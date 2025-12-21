import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExamType, Difficulty } from '@prisma/client';

export class CreateExamDto {
  @IsNotEmpty({ message: 'Exam title is required' })
  @IsString({ message: 'Exam title must be a string' })
  title: string;

  @IsNotEmpty({ message: 'Exam type is required' })
  @IsArray({ message: 'Exam type must be an array' })
  @IsEnum(ExamType, {
    message: `Exam type must be one of: ${Object.values(ExamType).join(', ')}`,
  })
  type: ExamType[];

  @IsOptional()
  @IsEnum(Difficulty, {
    message: `Difficulty must be one of: ${Object.values(Difficulty).join(', ')}`,
  })
  difficulty?: Difficulty;

  @IsOptional()
  @IsString({ message: 'Course ID must be a string' })
  courseId?: string;

  @IsOptional()
  @IsArray({ message: 'Topics must be an array' })
  @IsString({ each: true, message: 'Each topic must be a string' })
  topics?: string[];

  @IsOptional()
  @IsNumber({}, { message: 'Pass score must be a number' })
  @Min(0, { message: 'Pass score cannot be negative' })
  @Type(() => Number)
  passScore?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Numbers of questions must be a number' })
  @Type(() => Number)
  numberOfQuestions?: number;

  @IsNotEmpty({ message: 'Exam duration is required' })
  @IsNumber({}, { message: 'duration must be a number' })
  @Type(() => Number)
  duration: number;

  @IsOptional()
  @IsArray({ message: 'Document IDs must be an array' })
  @IsString({ each: true, message: 'Each document ID must be a string' })
  documentIds?: string[];
}
