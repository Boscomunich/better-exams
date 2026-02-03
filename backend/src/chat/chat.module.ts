import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AiClientModule } from 'src/aiclient/aiclient.module';
import { ChatController } from './chat.controller';

@Module({
  providers: [ChatService, ChatGateway],
  imports: [AiClientModule],
  controllers: [ChatController],
})
export class ChatModule {}
