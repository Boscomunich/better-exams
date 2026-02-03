import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AIChatService } from './chat.service';
import { ChatWithDocumentDto } from 'src/chat/dto/create';
import { Exam } from '@prisma/client';
import { AIExamService } from './exam.service';

@Controller()
export class AiController {
  constructor(
    private readonly chatService: AIChatService,
    private readonly examService: AIExamService,
  ) {}

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

  @EventPattern('generate-exams')
  async handleGenerateExam(@Payload() exam: Exam) {
    await this.examService.generateExamsQuestion(exam.id);
  }
}
