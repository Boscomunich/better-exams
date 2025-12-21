import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { DocumentsModule } from 'src/documents/documents.module';

@Module({
  controllers: [CourseController],
  providers: [CourseService],
  imports: [DocumentsModule],
})
export class CourseModule {}
