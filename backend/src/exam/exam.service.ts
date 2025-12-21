import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto } from './dto/create .dto';

@Injectable()
export class ExamService {
  constructor(
    @Inject('AI_SERVICE') private readonly aiClient: ClientProxy,
    private readonly prisma: PrismaService,
  ) {}

  async createExam(data: CreateExamDto, userId: string) {
    const exam = await this.prisma.exam.create({
      data: {
        userId,
        title: data.title,
        duration: data.duration,
        type: data.type,
        numberOfQuestions: data.numberOfQuestions,
        difficulty: data.difficulty,
        courseId: data.courseId,
        documents: data.documentIds
          ? {
              connect: data.documentIds.map((id) => ({ id })),
            }
          : undefined,
      },
    });
    this.aiClient.emit('generate-exams', exam);
    return {
      message: 'sucessfully created exams, pending ai question generation',
      data: exam,
    };
  }
}
