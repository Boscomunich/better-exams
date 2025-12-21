export class UploadFilesEvent {
  constructor(
    public readonly userId: string,
    public readonly files: Express.Multer.File[],
    public readonly courseId?: string,
  ) {}
}
