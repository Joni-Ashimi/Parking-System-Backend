import {Body, Controller, HttpStatus, Post, Res} from '@nestjs/common';
import * as express from 'express';
import {google} from '@ai-sdk/google';
import {generateText} from 'ai';

@Controller('chat')
export class ChatController {
    @Post()
    async handleChat(@Body() body: any, @Res() res: express.Response) {
        try {
            const userPrompt = body.prompt || '';

            const {text} = await generateText({
                model: google('gemini-2.5-flash'),
                system: `You are the Prometrix Support AI. 
    
                CORE OPERATIONAL KNOWLEDGE:
                    - You represent the Prometrix Parking System, a platform for parking reservations, secure online payments (credit/debit/digital wallets), and real-time slot navigation.
                    - You are the primary interface for users managing their parking dashboard and history.

                RESPONSE GUIDELINES:
            1. CONCISENESS: Keep responses under 3 sentences unless specifically asked for a step-by-step guide.
            2. TONE: Professional, efficient, and calm—reflecting a high-end service platform.
            3. SCOPE GUARDRAIL: If a user asks questions about topics outside of the Prometrix system (e.g., general news, programming, or cooking), politely decline by saying: "I am the Prometrix Support AI and can only assist with parking-related inquiries."
            4. NAVIGATION: Always provide clear, direct instructions if a user is struggling to find a feature in the admin or user dashboard.`,
                prompt: userPrompt,
            });

            return res.status(HttpStatus.OK).json({response: text});
        } catch (error) {
            console.error('Chat Error:', error);
            return res.status(500).json({error: 'Failed to process request'});
        }
    }
}