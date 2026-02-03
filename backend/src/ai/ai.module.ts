import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import {
  AiModelProvider,
  HeavyAiModelProvider,
  LightAiModelProvider,
} from './ai.model.provider';
import { QueryResolverAgent } from './resolver.service';
import { ChatMemory } from './memory.service';
import { LLMRouterService } from './router.service';
import { VectorizeModule } from 'src/vectorize/vectorize.module';
import { AIChatService } from './chat.service';
import { AiClientModule } from 'src/aiclient/aiclient.module';
import { AIExamService } from './exam.service';

@Module({
  providers: [
    QueryResolverAgent,
    ChatMemory,
    LLMRouterService,
    AiModelProvider,
    LightAiModelProvider,
    HeavyAiModelProvider,
    AIChatService,
    AIExamService,
  ],
  controllers: [AiController],
  exports: [AiModelProvider, LightAiModelProvider, AIChatService],
  imports: [VectorizeModule, AiClientModule],
})
export class AiModule {}
