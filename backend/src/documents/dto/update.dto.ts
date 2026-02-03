import { IsString, IsArray } from 'class-validator';

export class UpdateDocumentsDto {
  @IsString({ message: 'courseId is required' })
  courseId: string;

  @IsArray()
  @IsString({ each: true, message: 'documents id array is required' })
  documentIds: string[];
}

export class AddDocumentsToChatDto {
  @IsString({ message: 'chatId is required' })
  chatSessionId: string;

  @IsArray()
  @IsString({ each: true, message: 'documents id array is required' })
  documentIds: string[];
}
