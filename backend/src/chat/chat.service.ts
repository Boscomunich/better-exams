import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatWithDocumentDto } from './dto/create';
import { FetchChatsDto } from './dto/fetchchats.dto';

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

  async getChatHistory(data: FetchChatsDto, userId: string) {
    const skip = (data.page - 1) * data.limit;

    const [chats, totalCount] = await Promise.all([
      this.prisma.chatSession.findMany({
        where: { userId },
        orderBy: {
          createdAt: data.order || 'desc',
        },
        skip: skip,
        take: data.limit,
        select: {
          id: true,
          title: true,
          userId: true,
          courseId: true,
          course: true,
          createdAt: true,
          updatedAt: true,
          documents: true,
        },
      }),
      this.prisma.chatSession.count({
        where: { userId },
      }),
    ]);

    // Transform dates to strings here
    const serializedChats = chats.map((chat) => ({
      ...chat,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    }));

    return {
      message: 'successful',
      data: serializedChats,
      meta: {
        totalCount,
        currentPage: data.page,
        totalPages: Math.ceil(totalCount / data.limit),
        limit: data.limit,
      },
    };
  }

  async getChatMessages(id: string) {
    const chatWithMessage = await this.prisma.chatSession.findUnique({
      where: { id },
      select: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // Map through messages to convert createdAt to string
    const serializedMessages =
      chatWithMessage?.messages.map((msg) => ({
        ...msg,
        createdAt: msg.createdAt.toISOString(),
      })) || [];
    return {
      message: 'successful',
      data: serializedMessages,
    };
  }
}
