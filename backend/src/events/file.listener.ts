import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { prisma } from 'libs/prisma';
import { UploadFilesEvent } from './dto/file-upload.dto';
import { ClientProxy } from '@nestjs/microservices';
import { VectorizeFilesEvent } from 'src/vectorize/dto/vectorize.dto';
import { uploadFileStream } from 'libs/s3';

@Injectable()
export class DocumentsListener {
  constructor(@Inject('AI_SERVICE') private readonly aiClient: ClientProxy) {}

  @OnEvent('documents.upload', { async: true })
  async handleUpload(event: UploadFilesEvent) {
    console.log('running upload');
    const { userId, files, courseId } = event;
    try {
      const uploadedResults: {
        documentId: string;
        fileUrl: string;
        key: string;
        originalName: string;
        mimeType: string;
        fileBuffer: Buffer;
      }[] = [];

      const s3Uploads = await Promise.all(
        files.map(async (file) => {
          const key = `uploads/${Date.now()}-${file.originalname}`;
          const fileUrl = await uploadFileStream(file, key);

          return {
            key,
            fileUrl,
            fileBuffer: file.buffer,
            originalName: file.originalname,
            mimeType: file.mimetype,
          };
        }),
      );

      /** STEP 2 — Write all to DB */
      for (const file of s3Uploads) {
        const document = await prisma.document.create({
          data: {
            title: file.originalName,
            fileUrl: file.fileUrl,
            fileKey: file.key,
            fileType: file.mimeType,
            fileSize: file.fileBuffer.length,
            user: { connect: { id: userId } },
            ...(courseId && { course: { connect: { id: courseId } } }),
          },
        });

        uploadedResults.push({
          documentId: document.id,
          ...file,
        });
      }

      /** STEP 3 — Emit vectorization event ONCE */
      this.aiClient.emit<VectorizeFilesEvent>(
        'vectorize.files',
        new VectorizeFilesEvent(
          uploadedResults.map((f) => ({
            documentId: f.documentId,
            key: f.key,
            fileUrl: f.fileUrl,
            mimeType: f.mimeType,
            fileBuffer: f.fileBuffer.toString('base64') as any,
            originalName: f.originalName,
          })),
          userId,
        ),
      );
    } catch (error) {
      console.log(error);
    }
  }
}
