import { IsString, IsArray } from 'class-validator';

export class DeleteDocumentsDto {
  @IsArray()
  @IsString({ each: true, message: 'documents id array is required' })
  ids: string[];
}
