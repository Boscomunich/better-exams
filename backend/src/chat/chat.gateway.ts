import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatWithDocumentDto } from './dto/create';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { Inject, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { ClientProxy } from '@nestjs/microservices';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: process.env.APP_URL,
    credentials: true,
    methods: ['GET', 'POST'],
  },
})
@UseGuards(AuthGuard)
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(
    private readonly chatService: ChatService,
    @Inject('AI_SERVICE') private readonly aiClient: ClientProxy,
  ) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() chatData: any,
    @ConnectedSocket() client: Socket,
    @Session() session: UserSession,
  ) {
    const chat: ChatWithDocumentDto = JSON.parse(chatData as string);

    if (!chat.chatSessionId) {
      const newChat = await this.chatService.createChatSession(
        session.user.id,
        chat,
      );
      chat.chatSessionId = newChat.id;
    }

    const roomName = this.getSocketRoom(session.user.id);
    await client.join(roomName);

    this.aiClient
      .send('process_chat', {
        room: roomName,
        payload: chat,
      })
      .subscribe({
        next: (data: {
          room: string;
          chunk: string | undefined;
          done: boolean;
        }) => {
          this.server.to(data.room).emit('chatStreamChunk', data.chunk);

          if (data.done) {
            this.server.to(data.room).emit('chatStreamComplete');
          }
        },
        error: (err) => {
          this.server
            .to(roomName)
            .emit('chatStreamError', err.message ?? 'AI error');
        },
      });

    console.log(chat);
    return {
      status: 'processing',
      chatSessionId: chat.chatSessionId,
    };
  }

  private getSocketRoom(userId: string): string {
    return `socket:${userId}`;
  }
}
