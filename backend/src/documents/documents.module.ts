import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentsListener } from 'src/events/file.listener';
import { AiClientModule } from 'src/aiclient/aiclient.module';

@Module({
  imports: [AiClientModule],
  providers: [DocumentsService, DocumentsListener],
  controllers: [DocumentsController],
  exports: [DocumentsService],
})
export class DocumentsModule {}
