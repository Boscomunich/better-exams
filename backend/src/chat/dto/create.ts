import { IsOptional, IsString, IsArray } from 'class-validator';

export class ChatWithDocumentDto {
  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  chatSessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}
