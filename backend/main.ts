import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'NUTRABITICS API',
    version: '1.0.0',
    description: 'Documentación API para el backend de NUTRABITICS.',
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Servidor local',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        summary: 'Login de usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Autenticación exitosa' },
          '401': { description: 'Credenciales inválidas' },
        },
      },
    },
    '/auth/sign-up': {
      post: {
        summary: 'Registro de usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  role: { type: 'string', enum: ['ADMIN', 'DOCTOR', 'PATIENT'] },
                },
                required: ['email', 'password', 'firstName', 'lastName'],
              },
            },
          },
        },
        responses: {
          '201': { description: 'Usuario creado' },
        },
      },
    },
    '/me/prescriptions': {
      get: {
        summary: 'Listar prescripciones del paciente autenticado',
        responses: {
          '200': { description: 'Listado de prescripciones' },
          '401': { description: 'No autorizado' },
        },
      },
    },
    '/prescriptions': {
      get: {
        summary: 'Listar prescripciones',
        responses: {
          '200': { description: 'Listado de prescripciones' },
        },
      },
      post: {
        summary: 'Crear prescripción',
        responses: {
          '201': { description: 'Prescripción creada' },
          '401': { description: 'No autorizado' },
        },
      },
    },
    '/prescriptions/{id}': {
      get: {
        summary: 'Obtener prescripción por ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Prescripción encontrada' },
          '404': { description: 'No encontrada' },
        },
      },
    },
    '/prescriptions/{id}/pdf': {
      get: {
        summary: 'Descargar PDF de prescripción',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'PDF descargado' },
        },
      },
    },
    '/prescriptions/{id}/qr': {
      get: {
        summary: 'Descargar código QR de prescripción',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'QR descargado' },
        },
      },
    },
    '/prescriptions/{id}/consume': {
      put: {
        summary: 'Marcar prescripción como consumida',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Prescripción consumida' },
        },
      },
    },
    '/prescriptions/{id}/status': {
      patch: {
        summary: 'Actualizar estado de prescripción',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'CONSUMED'] },
                },
                required: ['status'],
              },
            },
          },
        },
        responses: {
          '200': { description: 'Estado actualizado' },
        },
      },
    },
  },
};

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

  // Swagger UI en /api
  app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Docs available at: http://localhost:${port}/api`);
  console.log(`🔐 Security enabled: Helmet, CORS, ValidationPipe`);
  console.log(`🍪 HTTP-Only Cookies: Enabled for JWT storage`);
}
bootstrap();

