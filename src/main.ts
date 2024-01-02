import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  await app.listen(3000);
  app.useGlobalPipes(
    new ValidationPipe({
      // DTO 형식 유효성 검사 싱기방기
      whitelist: true,
      forbidNonWhitelisted: true,

      // request 측 데이터타입 자동변환
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}
bootstrap();
