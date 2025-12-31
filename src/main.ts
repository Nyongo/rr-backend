// Crypto polyfill for @nestjs/schedule
import { webcrypto } from 'crypto';
if (!global.crypto) {
  global.crypto = webcrypto as any;
}

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { PermissionsGuard } from './auth/permission.guard';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { CommonFunctionsService } from './common/services/common-functions.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // Use HTTP only - Koyeb handles SSL termination in production
  // For local development, we also use HTTP (no HTTPS needed)
  const host = process.env.HOST || '0.0.0.0'; // Listen on all interfaces
  const port = process.env.PORT || 3000;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true, // Enable body parsing
  });

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:4000',
      'https://jf-foundation.vercel.app',
      'https://jackfruit-foundation.org',
      'https://www.jackfruit-foundation.org',
      'https://crm-ochre-pi.vercel.app',
      'https://foundation.jackfruitnetwork.com',
      'https://www.foundation.jackfruitnetwork.com',
      'https://www.jackfruitnetwork.com',
      'https://jackfruitnetwork.com',
      'https://www.jackfruitnetwork.com/',
      'https://www.finance.jackfruitnetwork.com',
      'https://finance.jackfruitnetwork.com',
      'https://www.hub.jackfruitnetwork.com',
      'https://hub.jackfruitnetwork.com',
      'http://localhost:8080',
      'https://rr-frontend-m5w46dvcb-njugunad85gmailcoms-projects.vercel.app',
      'https://rr-frontend-m5w46dvcb-njugunad85gmailcoms-projects.vercel.app/',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  // Serve static files from project root uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const commonFunctionsService = app.get(CommonFunctionsService);
  const prismaService = app.get(PrismaService);
  const reflector = app.get(Reflector);

  // Apply the guards directly without using 'provide'
  // No global guards applied - guards are applied per route as needed
  // app.useGlobalGuards(new JwtAuthGuard());
  // app.useGlobalGuards(new PermissionsGuard(reflector, prismaService, commonFunctionsService));

  // Apply global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Apply global filters
  app.useGlobalFilters(new ValidationExceptionFilter());
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Apply global validation pipe with transformation so numeric strings become numbers
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Health check endpoint for Koyeb (before listen)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (req: any, res: any) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  await app.listen(port, host);
  console.log(`\n🚀 Server is running on http://${host}:${port}`);
  console.log(`📝 Login endpoint: POST http://${host}:${port}/auth/login`);
  console.log(`📝 Test endpoint: GET http://${host}:${port}/auth/test`);
  console.log(`💚 Health check: GET http://${host}:${port}/health`);
  console.log(
    `✅ Logging middleware registered - all requests will be logged\n`,
  );
}
bootstrap();
