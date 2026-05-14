import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛡️ Seguridad: Helmet - Establece headers de seguridad HTTP
  app.use(helmet());

  // 🍪 Parser para cookies HTTP-Only
  app.use(cookieParser());

  // Global pipes - Validación y transformación automática
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters - Manejo de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors - Logging de requests
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ⚙️ CORS: Permitir acceso desde frontend
  app.enableCors({
    origin: process.env.APP_ORIGIN || 'http://localhost:3000',
    credentials: true, // Permitir cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Docs available at: http://localhost:${port}/api`);
  console.log(`🔐 Security enabled: Helmet, CORS, ValidationPipe`);
  console.log(`🍪 HTTP-Only Cookies: Enabled for JWT storage`);
}
bootstrap();

