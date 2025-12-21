export class VectorizeFilesEvent {
  constructor(
    public files: {
      documentId: string;
      fileUrl: string;
      key: string;
      originalName: string;
      mimeType: string;
      fileBuffer: Buffer;
    }[],
    public userId: string,
  ) {}
}
