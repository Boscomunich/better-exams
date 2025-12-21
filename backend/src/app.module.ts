import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { auth } from 'libs/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { DocumentsModule } from './documents/documents.module';
import { ExamModule } from './exam/exam.module';
import { ChatModule } from './chat/chat.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AiClientModule } from './aiclient/aiclient.module';
import { VectorizeModule } from './vectorize/vectorize.module';
import { AiModule } from './ai/ai.module';
import { PrismaModule } from './prisma/prisma.module';
import { PineconeModule } from './pinecone/pinecone.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    EventEmitterModule.forRoot(),
    UserModule,
    CourseModule,
    DocumentsModule,
    ExamModule,
    ChatModule,
    VectorizeModule,
    AiClientModule,
    AiModule,
    PrismaModule,
    PineconeModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
