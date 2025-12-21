import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Session,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { UploadFilesDto } from './dto/create.dto';
import { DeleteDocumentsDto } from './dto/delete.dto';
import { FetchDocDto } from './dto/fetchdocs.dto';
import { UpdateDocumentsDto } from './dto/update.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async fetchUserDocs(
    @Query() data: FetchDocDto,
    @Session() session: UserSession,
  ) {
    return await this.documentsService.fetchUserDocument(data, session.user.id);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Session() session: UserSession,
    @Body() data: UploadFilesDto,
  ) {
    const uploadedFiles = await this.documentsService.uploadFiles(
      session.user.id,
      files,
      20,
      data.courseId,
    );
    return { files: uploadedFiles };
  }

  @Delete()
  async deleteFiles(@Body() data: DeleteDocumentsDto) {
    return await this.documentsService.deleteUserDocuments(data);
  }

  @Patch('addCourse')
  async addDocumentsToCourse(@Body() data: UpdateDocumentsDto) {
    return await this.documentsService.addDocumentsToCourse(data);
  }

  @Patch('removeCourse')
  async removeDocumentsFromCourse(@Body() data: UpdateDocumentsDto) {
    return await this.documentsService.removeDocumentsFromCourse(data);
  }
}
