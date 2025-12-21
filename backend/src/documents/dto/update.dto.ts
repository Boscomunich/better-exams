import { IsString, IsArray } from 'class-validator';

export class UpdateDocumentsDto {
  @IsString({ message: 'courseId is required' })
  courseId: string;

  @IsArray()
  @IsString({ each: true, message: 'documents id array is required' })
  documentsIds: string[];
}
