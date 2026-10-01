import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AuthorWatermarkInterceptor } from './common/interceptors/author-watermark.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  // Поддержка прямых обращений без префикса /api/v1
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (
      req.url.startsWith('/setup/') ||
      req.url === '/setup' ||
      req.url.startsWith('/public/institution') ||
      req.url.startsWith('/admin/institution')
    ) {
      if (!req.url.startsWith('/api/v1')) {
        req.url = `/api/v1${req.url}`;
      }
    }
    next();
  });

  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['X-Platform-Architect', 'X-Engineered-By', 'X-Platform-License'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new AuthorWatermarkInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('College Management System - API')
    .setDescription('REST API taʼlim muassasasi (SPO) portali (Oʻzbekiston)')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите Supabase JWT токен',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await app.listen(port);
}

void bootstrap();
