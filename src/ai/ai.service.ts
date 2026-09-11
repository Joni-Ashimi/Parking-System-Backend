import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChatDto } from './types/ChatDto';
import { Conversation } from '../entity/Conversation';
import { ChatMessage } from '../entity/ChatMessage';
import { MessageRole } from '../def/enums/MessageRole';
import { getAvailableSpotsTool } from './tools/getAvailableSpots.tool';
import { buildToolRegistry } from './tools/tool-registry';
import { ParkingSpotService } from '../parkingSpot/ParkingSpot.service';
import { JsonSchema } from './types/JsonSchema';
import { VehicleService } from '../vehicles/vehicles.service';
import { getMyVehiclesTool } from './tools/getMyVehiclesTool.tool';
import { ParkingSessionService } from '../parkingSession/parkingSession.service';
import { getActiveSessionTool } from './tools/getActiveSessions.tool';

const MAX_TOOL_CALL_ITERATIONS = 5;

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;
  private readonly structuredModel: GenerativeModel;

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,

    @InjectRepository(ChatMessage)
    private readonly chatMessagesRepository: Repository<ChatMessage>,

    private readonly configService: ConfigService,
    private readonly parkingSpotsService: ParkingSpotService,
    private readonly vehiclesService: VehicleService,
    private readonly parkingSessionsService: ParkingSessionService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      tools: [
        {
          functionDeclarations: [
            getAvailableSpotsTool,
            getMyVehiclesTool,
            getActiveSessionTool,
          ],
        },
      ],
    });

    this.structuredModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
  }

  async createConversation(userId: string) {
    const conversation = this.conversationsRepository.create({
      user: { id: userId },
    });

    return this.conversationsRepository.save(conversation);
  }

  async chat(userId: string, dto: ChatDto): Promise<string> {
    const conversation = await this.conversationsRepository.findOne({
      where: {
        id: dto.conversationId,
        user: { id: userId },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const previousMessages = await this.chatMessagesRepository.find({
      where: {
        conversation: { id: conversation.id },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const chat = this.model.startChat({
      history: previousMessages.map((message) => ({
        role: message.role === MessageRole.USER ? 'user' : 'model',
        parts: [{ text: message.content }],
      })),
    });

    const toolRegistry = buildToolRegistry(
      this.parkingSpotsService,
      this.vehiclesService,
      this.parkingSessionsService,
      userId,
    );

    let result = await chat.sendMessage(dto.message);
    let functionCalls = result.response.functionCalls();
    let iterations = 0;

    while (functionCalls?.length) {
      iterations++;

      if (iterations > MAX_TOOL_CALL_ITERATIONS) {
        throw new BadRequestException(
          'AI exceeded maximum tool call iterations',
        );
      }

      const functionResponses = await Promise.all(
        functionCalls.map(async (call) => {
          const handler = toolRegistry[call.name];

          if (!handler) {
            return {
              functionResponse: {
                name: call.name,
                response: {
                  error: `Unknown tool: ${call.name}`,
                },
              },
            };
          }

          const functionResult = await handler(call.args);

          return {
            functionResponse: {
              name: call.name,
              response: {
                result: functionResult,
              },
            },
          };
        }),
      );

      result = await chat.sendMessage(functionResponses);
      functionCalls = result.response.functionCalls();
    }

    const response = result.response.text();

    await this.chatMessagesRepository.save([
      {
        conversation,
        role: MessageRole.USER,
        content: dto.message,
      },
      {
        conversation,
        role: MessageRole.MODEL,
        content: response,
      },
    ]);

    return response;
  }

  async generateStructured<T>(prompt: string, schema: JsonSchema): Promise<T> {
    const result = await this.structuredModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        responseSchema: schema as any,
      },
    });

    const text = result.response.text();

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new BadRequestException('AI returned invalid structured output');
    }
  }
}
