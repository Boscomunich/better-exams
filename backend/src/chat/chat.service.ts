import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatWithDocumentDto } from './dto/create';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createChatSession(userId: string, chat: ChatWithDocumentDto) {
    const title = chat.message.replace(/\s+/g, ' ').trim().slice(0, 60);

    const documentIds = chat.documentIds ?? [];

    const chatSession = await this.prisma.$transaction(async (tx) => {
      const session = await tx.chatSession.create({
        data: {
          userId,
          title,
          courseId: chat.courseId ?? null,
        },
      });

      if (documentIds.length > 0) {
        await tx.chatSessionDocument.createMany({
          data: documentIds.map((documentId) => ({
            chatSessionId: session.id,
            documentId,
          })),
        });
      }

      return session;
    });

    return chatSession;
  }
}
