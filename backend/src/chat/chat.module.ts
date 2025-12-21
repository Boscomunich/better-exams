import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { AiClientModule } from 'src/aiclient/aiclient.module';

@Module({
  providers: [ChatService, ChatGateway],
  imports: [AiClientModule],
})
export class ChatModule {}
