import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AIChatService } from './chat.service';
import { ChatWithDocumentDto } from 'src/chat/dto/create';

@Controller()
export class AiController {
  constructor(private readonly chatService: AIChatService) {}

  @MessagePattern('process_chat')
  async handleProcessChat(
    @Payload() data: { room: string; payload: ChatWithDocumentDto },
  ) {
    const response = await this.chatService.chatWithLLM(data.payload);

    return {
      room: data.room,
      chunk: response,
      done: true,
    };
  }
}
