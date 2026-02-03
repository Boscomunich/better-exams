import { Controller, Get, Query, Session } from '@nestjs/common';
import { FetchChatsDto } from './dto/fetchchats.dto';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @Get()
  async getChatHistory(
    @Query() data: FetchChatsDto,
    @Session() session: UserSession,
  ) {
    return await this.chatService.getChatHistory(data, session.user.id);
  }

  @Get('message')
  async getChatMessages(@Query() data: { id: string }) {
    return await this.chatService.getChatMessages(data.id);
  }
}
