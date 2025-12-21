import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { logger } from './logger';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export async function uploadFileStream(
  file: Express.Multer.File,
  key: string,
): Promise<string> {
  if (!file) throw new Error('File is required');
  if (!file.buffer) throw new Error('File buffer is missing');
  if (!file.mimetype) throw new Error('File MIME type is missing');

  const buffer: Buffer = file.buffer;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype,
    }),
  );

  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME!}/${key}`;
}

export async function deleteS3Files(fileKeys: string[]) {
  if (!fileKeys || fileKeys.length === 0) return;
  try {
    const response = await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Delete: {
          Objects: fileKeys.map((key) => ({ Key: key })),
          Quiet: true,
        },
      }),
    );

    if (response.Errors && response.Errors.length > 0) {
      logger.error('Some files failed to delete:', response.Errors);
    }

    return {
      success: true,
      deletedCount: response.Deleted?.length || 0,
    };
  } catch (error) {
    logger.error(
      `Failed to delete files ${fileKeys.join(', ')} from storage: ${error.message}`,
    );
  }
}
