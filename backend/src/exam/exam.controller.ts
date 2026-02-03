import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create .dto';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Post()
  async createExam(
    @Body() data: CreateExamDto,
    @Session() session: UserSession,
  ) {
    return await this.examService.createExam(data, session.user.id);
  }

  @Get('with-questions/:id')
  async getExamWithProcessedQuestion(@Param('id') id: string) {
    return await this.examService.getExamWithProcessedQuestion(id);
  }
}
