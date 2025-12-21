import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UploadFilesEvent } from 'src/events/dto/file-upload.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { deleteS3Files } from 'libs/s3';
import { StorageService } from 'src/storage/storage.service';
import { UpdateDocumentsDto } from './dto/update.dto';
import { FetchDocDto } from 'src/documents/dto/fetchdocs.dto';
import { DeleteDocumentsDto } from './dto/delete.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadFiles(
    userId: string,
    files: Express.Multer.File[],
    maxTotalSizeMB = 20,
    courseId?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    // Validate file buffers and calculate total size
    let totalSize = 0;
    for (const file of files) {
      if (!file.buffer) {
        throw new BadRequestException(
          `File ${file.originalname} buffer is missing`,
        );
      }
      if (!file.mimetype) {
        throw new BadRequestException(
          `File ${file.originalname} MIME type is missing`,
        );
      }
      totalSize += file.buffer.length;
    }

    const MAX_SIZE = maxTotalSizeMB * 1024 * 1024;
    if (totalSize > MAX_SIZE) {
      throw new BadRequestException(
        `Total file size exceeds ${maxTotalSizeMB}MB`,
      );
    }

    //Check user storage
    const storage = await this.prisma.storageUsage.findUnique({
      where: { userId },
    });

    const usedBytes = storage?.usedBytes ?? BigInt(0);
    const limitBytes = storage?.limitBytes ?? BigInt(1073741824); // 1GB default

    if (usedBytes + BigInt(totalSize) > limitBytes) {
      throw new BadRequestException(
        'Upload would exceed your storage limit. Please free up space or upgrade your plan.',
      );
    }

    //Upsert storage usage
    await this.prisma.storageUsage.upsert({
      where: { userId },
      update: {
        usedBytes: { increment: BigInt(totalSize) },
      },
      create: {
        userId,
        usedBytes: BigInt(totalSize),
      },
    });

    // Emit event for processing files
    this.eventEmitter.emit(
      'documents.upload',
      new UploadFilesEvent(userId, files, courseId),
    );

    return { message: 'Files are being processed' };
  }

  async fetchUserDocument(data: FetchDocDto, userId: string) {
    const skip = (data.page - 1) * data.limit;

    const [documents, totalCount] = await Promise.all([
      this.prisma.document.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: data.order || 'desc',
        },
        skip: skip,
        take: data.limit,
      }),
      this.prisma.document.count({
        where: { userId },
      }),
    ]);

    return {
      message: 'sucessful',
      data: documents,
      meta: {
        totalCount,
        currentPage: data.page,
        totalPages: Math.ceil(totalCount / data.limit),
        limit: data.limit,
      },
    };
  }

  async deleteUserDocuments(data: DeleteDocumentsDto) {
    const documents = await this.prisma.document.findMany({
      where: {
        id: { in: data.ids },
      },
      select: {
        fileKey: true,
        fileSize: true,
        userId: true,
      },
    });

    let totalBytes = BigInt(0);

    for (const document of documents) {
      totalBytes += document.fileSize;
    }

    await this.storageService.updateAvailableStorage(
      documents[0].userId,
      totalBytes,
      'DECREASE',
    );

    const fileKeys = documents.map((doc) => doc.fileKey);

    if (fileKeys.length > 0) {
      await deleteS3Files(fileKeys);
    }

    const deleteResult = await this.prisma.document.deleteMany({
      where: {
        id: { in: data.ids },
      },
    });

    return {
      message: 'Successfully deleted documents',
      data: deleteResult.count,
    };
  }

  async addDocumentsToCourse(data: UpdateDocumentsDto) {
    const documents = await this.prisma.document.updateMany({
      where: {
        id: { in: data.documentsIds },
      },
      data: {
        courseId: data.courseId,
      },
    });
    return {
      message: 'Successfully added documents to course',
      data: documents,
    };
  }

  async removeDocumentsFromCourse(data: UpdateDocumentsDto) {
    const documents = await this.prisma.document.updateMany({
      where: {
        id: { in: data.documentsIds },
      },
      data: {
        courseId: null,
      },
    });
    return {
      message: 'Successfully removed documents to course',
      data: documents,
    };
  }
}
