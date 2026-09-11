import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AiService } from './ai.service';
import { ChatDto } from './types/ChatDto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentLoggedInUser } from '../decorator/current-user.decorator';
import { TestSchema } from './types/TestSchema';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('conversations')
  createConversation(@CurrentLoggedInUser('id') userId: string) {
    return this.aiService.createConversation(userId);
  }

  @Post('chat')
  async chat(@CurrentLoggedInUser('id') userId: string, @Body() dto: ChatDto) {
    return {
      response: await this.aiService.chat(userId, dto),
    };
  }

  @Post('structured-test')
  async structuredTest(@Body('message') message: string) {
    return this.aiService.generateStructured(message, TestSchema);
  }
}
