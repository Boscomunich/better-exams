import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExamDto } from './dto/create .dto';
import { VectorStatus } from '@prisma/client';

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

  async getExam(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: {
        id,
      },
    });
    return exam;
  }

  async getExamWithProcessedQuestion(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: {
        id,
      },
    });

    if (exam?.questionsStatus === VectorStatus.COMPLETED) return exam;
    return null;
  }
}
