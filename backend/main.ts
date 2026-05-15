import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
const swaggerUi = require('swagger-ui-express');

// ─── Schemas reutilizables ────────────────────────────────────────────────────
const schemas = {
  AuthResponse: {
    type: 'object',
    properties: {
      accessToken:  { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      user: {
        type: 'object',
        properties: {
          id:        { type: 'string', example: 'clx1abc...' },
          email:     { type: 'string', example: 'user@example.com' },
          firstName: { type: 'string', example: 'Juan' },
          lastName:  { type: 'string', example: 'Pérez' },
          role:      { type: 'string', enum: ['ADMIN', 'DOCTOR', 'PATIENT'] },
        },
      },
    },
  },
  UserResponse: {
    type: 'object',
    properties: {
      id:        { type: 'string' },
      email:     { type: 'string' },
      firstName: { type: 'string' },
      lastName:  { type: 'string' },
      role:      { type: 'string', enum: ['ADMIN', 'DOCTOR', 'PATIENT'] },
    },
  },
  DoctorResponse: {
    type: 'object',
    properties: {
      id:        { type: 'string' },
      userId:    { type: 'string' },
      specialty: { type: 'string', nullable: true },
      user: {
        type: 'object',
        properties: {
          id:        { type: 'string' },
          email:     { type: 'string' },
          firstName: { type: 'string' },
          lastName:  { type: 'string' },
        },
      },
    },
  },
  PatientResponse: {
    type: 'object',
    properties: {
      id:     { type: 'string' },
      userId: { type: 'string' },
      user: {
        type: 'object',
        properties: {
          id:        { type: 'string' },
          email:     { type: 'string' },
          firstName: { type: 'string' },
          lastName:  { type: 'string' },
        },
      },
    },
  },
  PrescriptionItem: {
    type: 'object',
    properties: {
      id:           { type: 'string' },
      name:         { type: 'string', example: 'Amoxicilina' },
      dosage:       { type: 'string', example: '500mg' },
      quantity:     { type: 'integer', example: 30 },
      instructions: { type: 'string', nullable: true, example: 'Una cápsula cada 8 horas' },
    },
  },
  PrescriptionResponse: {
    type: 'object',
    properties: {
      id:           { type: 'string' },
      code:         { type: 'string', example: 'RX-20240115-ABC1' },
      doctorId:     { type: 'string' },
      patientId:    { type: 'string', nullable: true },
      patientEmail: { type: 'string', nullable: true },
      status:       { type: 'string', enum: ['PENDING', 'CONSUMED'] },
      notes:        { type: 'string', nullable: true },
      consumedAt:   { type: 'string', format: 'date-time', nullable: true },
      createdAt:    { type: 'string', format: 'date-time' },
      items: {
        type: 'array',
        items: { $ref: '#/components/schemas/PrescriptionItem' },
      },
      doctor: {
        type: 'object',
        nullable: true,
        properties: {
          id:   { type: 'string' },
          user: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName:  { type: 'string' },
              email:     { type: 'string' },
            },
          },
        },
      },
      patient: {
        type: 'object',
        nullable: true,
        properties: {
          id:   { type: 'string' },
          user: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName:  { type: 'string' },
              email:     { type: 'string' },
            },
          },
        },
      },
    },
  },
  PaginatedResponse: {
    type: 'object',
    properties: {
      data: { type: 'array', items: {} },
      pagination: {
        type: 'object',
        properties: {
          page:       { type: 'integer' },
          limit:      { type: 'integer' },
          total:      { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
    },
  },
  MetricsResponse: {
    type: 'object',
    properties: {
      totalPatients:      { type: 'integer', example: 45 },
      totalDoctors:       { type: 'integer', example: 12 },
      totalPrescriptions: { type: 'integer', example: 156 },
      prescriptionsByStatus: {
        type: 'object',
        properties: {
          pending:  { type: 'integer', example: 89 },
          consumed: { type: 'integer', example: 67 },
        },
      },
      prescriptionsByDay: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date:  { type: 'string', format: 'date', example: '2024-01-15' },
            count: { type: 'integer', example: 5 },
          },
        },
      },
    },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      statusCode: { type: 'integer', example: 401 },
      message:    { type: 'string', example: 'Unauthorized' },
      error:      { type: 'string', example: 'Unauthorized', nullable: true },
      timestamp:  { type: 'string', format: 'date-time' },
    },
  },
};

// ─── Parámetros de paginación reutilizables ───────────────────────────────────
const paginationParams = [
  { name: 'page',      in: 'query', schema: { type: 'integer', default: 1 },    description: 'Número de página' },
  { name: 'limit',     in: 'query', schema: { type: 'integer', default: 10 },   description: 'Resultados por página (máx 100)' },
  { name: 'sortBy',    in: 'query', schema: { type: 'string',  default: 'createdAt' }, description: 'Campo de ordenamiento' },
  { name: 'sortOrder', in: 'query', schema: { type: 'string',  enum: ['asc', 'desc'], default: 'desc' } },
];

const prescriptionFilterParams = [
  ...paginationParams,
  { name: 'status',   in: 'query', schema: { type: 'string', enum: ['PENDING', 'CONSUMED'] }, description: 'Filtrar por estado' },
  { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha desde (YYYY-MM-DD)' },
  { name: 'dateTo',   in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha hasta (YYYY-MM-DD)' },
];

const searchParams = [
  ...paginationParams,
  { name: 'query', in: 'query', schema: { type: 'string' }, description: 'Búsqueda por nombre o email' },
];

const idParam = (name = 'id', description = 'ID del recurso') => ({
  name, in: 'path', required: true, schema: { type: 'string' }, description,
});

// ─── Respuestas comunes ───────────────────────────────────────────────────────
const resp401 = { description: 'No autenticado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } };
const resp403 = { description: 'Permisos insuficientes', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } };
const resp404 = { description: 'Recurso no encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } };

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'NUTRABITICS API',
    version: '1.0.0',
    description: `
## Sistema de Gestión de Prescripciones Médicas

### Roles
- **ADMIN** — gestión de usuarios, métricas globales
- **DOCTOR** — crear y gestionar prescripciones
- **PATIENT** — consultar y consumir prescripciones

### Autenticación
Usar el botón **Authorize** con el formato: \`Bearer {accessToken}\`

### Rate Limiting
100 requests por minuto por IP.
    `,
  },
  servers: [
    { url: 'http://localhost:3001', description: 'Desarrollo local' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT obtenido en /auth/login o /auth/sign-in',
      },
    },
    schemas,
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Auth',          description: 'Autenticación y sesión' },
    { name: 'Users',         description: 'Gestión de usuarios (Admin)' },
    { name: 'Doctors',       description: 'Perfil de médicos' },
    { name: 'Patients',      description: 'Perfil de pacientes' },
    { name: 'Prescriptions', description: 'Gestión de prescripciones' },
    { name: 'Me',            description: 'Recursos del paciente autenticado' },
    { name: 'Admin',         description: 'Métricas y administración' },
  ],
  paths: {

    // ── AUTH ──────────────────────────────────────────────────────────────────
    '/auth/sign-up': {
      post: {
        tags: ['Auth'],
        summary: 'Registro de usuario',
        description: 'Crea un nuevo usuario. El rol por defecto es PATIENT.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email:     { type: 'string', format: 'email', example: 'nuevo@example.com' },
                  password:  { type: 'string', minLength: 6, example: 'SecurePass123!' },
                  firstName: { type: 'string', example: 'Juan' },
                  lastName:  { type: 'string', example: 'Pérez' },
                  role:      { type: 'string', enum: ['ADMIN', 'DOCTOR', 'PATIENT'], default: 'PATIENT' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Usuario creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '400': { description: 'Email ya registrado o datos inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login de usuario',
        description: 'Alias de /auth/sign-in. Retorna access token y refresh token.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', format: 'email', example: 'admin@test.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login exitoso', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': { description: 'Credenciales inválidas', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/auth/sign-in': {
      post: {
        tags: ['Auth'],
        summary: 'Login de usuario (alias)',
        description: 'Idéntico a /auth/login.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login exitoso', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': resp401,
        },
      },
    },

    '/auth/sign-in-cookies': {
      post: {
        tags: ['Auth'],
        summary: 'Login con HTTP-Only cookies',
        description: 'Igual que /auth/login pero los tokens se setean como cookies HTTP-Only seguras en lugar de retornarse en el body.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login exitoso — tokens en cookies', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': resp401,
        },
      },
    },

    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Cerrar sesión (limpia cookies)',
        description: 'Borra las cookies accessToken y refreshToken del navegador.',
        responses: {
          '200': { description: 'Sesión cerrada', content: { 'application/json': { schema: { type: 'object', properties: { message: { type: 'string', example: 'Logged out successfully' } } } } } },
          '401': resp401,
        },
      },
    },

    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Renovar access token',
        description: 'Usa el refresh token (cookie o header) para obtener un nuevo access token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Nuevo access token', content: { 'application/json': { schema: { type: 'object', properties: { accessToken: { type: 'string' } } } } } },
          '401': resp401,
        },
      },
    },

    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Perfil del usuario autenticado',
        description: 'Retorna el ID y rol del usuario con sesión activa.',
        responses: {
          '200': { description: 'Perfil', content: { 'application/json': { schema: { type: 'object', properties: { id: { type: 'string' }, role: { type: 'string' } } } } } },
          '401': resp401,
        },
      },
    },

    // ── USERS ─────────────────────────────────────────────────────────────────
    '/users': {
      post: {
        tags: ['Users'],
        summary: 'Crear usuario',
        description: 'Solo ADMIN. Crea automáticamente el perfil Doctor o Patient según el rol.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName', 'role'],
                properties: {
                  email:     { type: 'string', format: 'email', example: 'doctor@example.com' },
                  password:  { type: 'string', minLength: 6 },
                  firstName: { type: 'string' },
                  lastName:  { type: 'string' },
                  role:      { type: 'string', enum: ['ADMIN', 'DOCTOR', 'PATIENT'] },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Usuario creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } } } },
          '400': { description: 'Email ya registrado o datos inválidos' },
          '401': resp401,
          '403': resp403,
        },
      },
      get: {
        tags: ['Users'],
        summary: 'Listar usuarios',
        description: 'Solo ADMIN. Soporta paginación, búsqueda y filtro por rol.',
        parameters: [
          ...searchParams,
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['ADMIN', 'DOCTOR', 'PATIENT'] }, description: 'Filtrar por rol' },
        ],
        responses: {
          '200': { description: 'Lista paginada de usuarios' },
          '401': resp401,
          '403': resp403,
        },
      },
    },

    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Obtener usuario por ID',
        parameters: [idParam('id', 'ID del usuario')],
        responses: {
          '200': { description: 'Usuario', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } } } },
          '401': resp401,
          '404': resp404,
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Actualizar usuario',
        description: 'Solo ADMIN. Todos los campos son opcionales.',
        parameters: [idParam('id', 'ID del usuario')],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email:     { type: 'string', format: 'email' },
                  password:  { type: 'string', minLength: 6 },
                  firstName: { type: 'string' },
                  lastName:  { type: 'string' },
                  role:      { type: 'string', enum: ['ADMIN', 'DOCTOR', 'PATIENT'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Usuario actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } } } },
          '401': resp401,
          '403': resp403,
          '404': resp404,
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Eliminar usuario',
        description: 'Solo ADMIN.',
        parameters: [idParam('id', 'ID del usuario')],
        responses: {
          '204': { description: 'Usuario eliminado' },
          '401': resp401,
          '403': resp403,
          '404': resp404,
        },
      },
    },

    // ── DOCTORS ───────────────────────────────────────────────────────────────
    '/doctors': {
      get: {
        tags: ['Doctors'],
        summary: 'Listar médicos',
        description: 'Accesible para ADMIN, DOCTOR y PATIENT.',
        parameters: searchParams,
        responses: {
          '200': { description: 'Lista paginada de médicos' },
          '401': resp401,
        },
      },
    },

    '/doctors/{id}': {
      get: {
        tags: ['Doctors'],
        summary: 'Obtener médico por ID',
        parameters: [idParam('id', 'ID del médico (Doctor.id, no User.id)')],
        responses: {
          '200': { description: 'Médico', content: { 'application/json': { schema: { $ref: '#/components/schemas/DoctorResponse' } } } },
          '401': resp401,
          '404': resp404,
        },
      },
      patch: {
        tags: ['Doctors'],
        summary: 'Actualizar especialidad del médico',
        description: 'Solo ADMIN.',
        parameters: [idParam('id', 'ID del médico')],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  specialty: { type: 'string', example: 'Cardiología' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Médico actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/DoctorResponse' } } } },
          '401': resp401,
          '403': resp403,
          '404': resp404,
        },
      },
    },

    // ── PATIENTS ──────────────────────────────────────────────────────────────
    '/patients': {
      get: {
        tags: ['Patients'],
        summary: 'Listar pacientes',
        description: 'Accesible para ADMIN y DOCTOR.',
        parameters: searchParams,
        responses: {
          '200': { description: 'Lista paginada de pacientes' },
          '401': resp401,
          '403': resp403,
        },
      },
    },

    '/patients/{id}': {
      get: {
        tags: ['Patients'],
        summary: 'Obtener paciente por ID',
        description: 'Accesible para ADMIN, DOCTOR y PATIENT.',
        parameters: [idParam('id', 'ID del paciente (Patient.id, no User.id)')],
        responses: {
          '200': { description: 'Paciente', content: { 'application/json': { schema: { $ref: '#/components/schemas/PatientResponse' } } } },
          '401': resp401,
          '404': resp404,
        },
      },
    },

    // ── PRESCRIPTIONS ─────────────────────────────────────────────────────────
    '/prescriptions': {
      post: {
        tags: ['Prescriptions'],
        summary: 'Crear prescripción',
        description: 'Solo DOCTOR. Requiere `patientId` o `patientEmail` (al menos uno).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: {
                  patientId:    { type: 'string', description: 'ID del paciente registrado (Patient.id)' },
                  patientEmail: { type: 'string', format: 'email', description: 'Email para pacientes externos no registrados' },
                  notes:        { type: 'string', example: 'Tomar con alimentos' },
                  items: {
                    type: 'array',
                    minItems: 1,
                    items: {
                      type: 'object',
                      required: ['name', 'dosage', 'quantity'],
                      properties: {
                        name:         { type: 'string', example: 'Amoxicilina' },
                        dosage:       { type: 'string', example: '500mg' },
                        quantity:     { type: 'string', example: '30' },
                        instructions: { type: 'string', example: 'Una cápsula cada 8 horas por 10 días' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Prescripción creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/PrescriptionResponse' } } } },
          '400': { description: 'Datos inválidos o paciente no encontrado' },
          '401': resp401,
          '403': resp403,
        },
      },
      get: {
        tags: ['Prescriptions'],
        summary: 'Listar prescripciones con filtros',
        description: 'ADMIN ve todas. DOCTOR ve solo las suyas (filtro automático por doctorId).',
        parameters: [
          ...prescriptionFilterParams,
          { name: 'doctorId',  in: 'query', schema: { type: 'string' }, description: 'Solo para ADMIN' },
          { name: 'patientId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Lista paginada de prescripciones' },
          '401': resp401,
          '403': resp403,
        },
      },
    },

    '/prescriptions/doctor/{doctorId}': {
      get: {
        tags: ['Prescriptions'],
        summary: 'Prescripciones por médico',
        description: 'Accesible para DOCTOR y ADMIN. Retorna array sin paginación.',
        parameters: [idParam('doctorId', 'ID del médico (Doctor.id)')],
        responses: {
          '200': { description: 'Array de prescripciones', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/PrescriptionResponse' } } } } },
          '401': resp401,
          '403': resp403,
        },
      },
    },

    '/prescriptions/patient/{patientId}': {
      get: {
        tags: ['Prescriptions'],
        summary: 'Prescripciones por paciente',
        description: 'Accesible para PATIENT, DOCTOR y ADMIN. Retorna array sin paginación.',
        parameters: [idParam('patientId', 'ID del paciente (Patient.id)')],
        responses: {
          '200': { description: 'Array de prescripciones', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/PrescriptionResponse' } } } } },
          '401': resp401,
          '403': resp403,
        },
      },
    },

    '/prescriptions/{id}': {
      get: {
        tags: ['Prescriptions'],
        summary: 'Ver detalle de prescripción',
        description: 'ADMIN ve cualquiera. DOCTOR solo las suyas. PATIENT solo las suyas.',
        parameters: [idParam()],
        responses: {
          '200': { description: 'Prescripción', content: { 'application/json': { schema: { $ref: '#/components/schemas/PrescriptionResponse' } } } },
          '401': resp401,
          '403': resp403,
          '404': resp404,
        },
      },
    },

    '/prescriptions/{id}/pdf': {
      get: {
        tags: ['Prescriptions'],
        summary: 'Descargar PDF de prescripción',
        description: 'Genera un PDF con los datos de la prescripción y un código QR integrado. Accesible para ADMIN, DOCTOR y PATIENT (solo sus propias).',
        parameters: [idParam()],
        responses: {
          '200': {
            description: 'Archivo PDF',
            content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } },
          },
          '401': resp401,
          '403': resp403,
          '404': resp404,
        },
      },
    },

    '/prescriptions/{id}/qr': {
      get: {
        tags: ['Prescriptions'],
        summary: 'Descargar código QR de prescripción',
        description: 'Retorna el QR como imagen PNG. El QR enlaza a la URL pública de la prescripción (configurable vía APP_ORIGIN). Accesible para ADMIN, DOCTOR y PATIENT.',
        parameters: [idParam()],
        responses: {
          '200': {
            description: 'Imagen PNG del código QR',
            content: { 'image/png': { schema: { type: 'string', format: 'binary' } } },
          },
          '401': resp401,
          '403': resp403,
          '404': resp404,
        },
      },
    },

    '/prescriptions/{id}/consume': {
      put: {
        tags: ['Prescriptions'],
        summary: 'Consumir prescripción',
        description: 'Solo PATIENT. Solo el paciente dueño puede consumirla. Establece status=CONSUMED y registra consumedAt.',
        parameters: [idParam()],
        responses: {
          '200': { description: 'Prescripción consumida', content: { 'application/json': { schema: { $ref: '#/components/schemas/PrescriptionResponse' } } } },
          '401': resp401,
          '403': resp403,
          '404': resp404,
        },
      },
    },

    '/prescriptions/{id}/status': {
      patch: {
        tags: ['Prescriptions'],
        summary: 'Cambiar estado de prescripción',
        description: 'Solo PATIENT. Alias de /consume con body explícito.',
        parameters: [idParam()],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'CONSUMED'] },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Estado actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/PrescriptionResponse' } } } },
          '401': resp401,
          '403': resp403,
          '404': resp404,
        },
      },
    },

    // ── ME ────────────────────────────────────────────────────────────────────
    '/me/prescriptions': {
      get: {
        tags: ['Me'],
        summary: 'Mis prescripciones (paciente autenticado)',
        description: 'Solo PATIENT. Obtiene las prescripciones del paciente con sesión activa.',
        parameters: prescriptionFilterParams,
        responses: {
          '200': { description: 'Lista paginada de prescripciones del paciente' },
          '401': resp401,
          '403': resp403,
          '404': { description: 'Perfil de paciente no encontrado para este usuario' },
        },
      },
    },

    // ── ADMIN ─────────────────────────────────────────────────────────────────
    '/admin/metrics': {
      get: {
        tags: ['Admin'],
        summary: 'Métricas generales',
        description: 'Solo ADMIN. Retorna totales, agrupaciones por estado y evolución diaria.',
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha inicio (YYYY-MM-DD). Aplica a conteos y agrupaciones.' },
          { name: 'to',   in: 'query', schema: { type: 'string', format: 'date' }, description: 'Fecha fin (YYYY-MM-DD).' },
        ],
        responses: {
          '200': { description: 'Métricas', content: { 'application/json': { schema: { $ref: '#/components/schemas/MetricsResponse' } } } },
          '401': resp401,
          '403': resp403,
        },
      },
    },

    '/admin/prescriptions': {
      get: {
        tags: ['Admin'],
        summary: 'Todas las prescripciones (Admin)',
        description: 'Solo ADMIN. Listado completo con filtros avanzados y paginación.',
        parameters: [
          ...prescriptionFilterParams,
          { name: 'doctorId',  in: 'query', schema: { type: 'string' } },
          { name: 'patientId', in: 'query', schema: { type: 'string' } },
          { name: 'from',      in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to',        in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: 'Lista paginada de prescripciones' },
          '401': resp401,
          '403': resp403,
        },
      },
    },
  },
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🛡️ Seguridad: Helmet — headers de seguridad HTTP
  app.use(helmet());

  // 🍪 Parser para cookies HTTP-Only
  app.use(cookieParser());

  // Global pipes — Validación y transformación automática
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

  // Global filters — Manejo de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors — Logging de requests
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ⚙️ CORS
  app.enableCors({
    origin: process.env.APP_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // 📚 Swagger UI en /docs
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Docs available at: http://localhost:${port}/docs`);
  console.log(`🔐 Security: Helmet, CORS, ValidationPipe, Rate Limiting (100 req/min)`);
  console.log(`🍪 HTTP-Only Cookies: Enabled`);
}
bootstrap();