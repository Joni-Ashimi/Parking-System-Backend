import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ChatDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
