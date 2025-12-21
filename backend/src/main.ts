import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './interceptors/logging/logging.interceptor';
import { AllExceptionsFilter } from './global/global.filter';

async function bootstrap() {
  const host = '0.0.0.0';
  const port = 8080;

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: [process.env.APP_URL],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
  });

  await app.listen(port, host);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 8877,
    },
  });

  await app.startAllMicroservices();
  console.log('Microservice listener started');
}

void bootstrap();
