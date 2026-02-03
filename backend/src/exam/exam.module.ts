import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { AiClientModule } from 'src/aiclient/aiclient.module';

@Module({
  controllers: [ExamController],
  providers: [ExamService],
  imports: [AiClientModule],
})
export class ExamModule {}
