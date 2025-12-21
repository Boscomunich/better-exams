import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class DeleteCourseDto {
  @IsNotEmpty({ message: 'ID is required' })
  @IsString({ message: 'ID must be a string' })
  id: string;

  @IsBoolean({ message: 'please indicate if to delete documents' })
  willDeleteDocuments: boolean;
}
