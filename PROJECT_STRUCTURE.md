# 📁 Project Structure - NUTRABITICS Backend

```
PruebaTecnicaNUTRABIOTICS/
│
├── 📄 README.md                     # 📖 Documentación completa
├── 📄 API_REFERENCE.md              # 🔗 Referencia rápida de endpoints
├── 📄 IMPLEMENTATION_SUMMARY.md      # ✅ Checklist completo
├── 📄 SETUP.md                      # 🚀 Instrucciones de setup
├── 📄 PROJECT_STRUCTURE.md          # 📁 Este archivo
│
├── 🖥️  setup.bat                    # Windows setup script
├── 🖥️  setup.sh                     # Unix/Mac setup script
│
├── 🐳 docker-compose.yml            # Orquestación (PostgreSQL + Backend)
├── .gitignore                       # Git ignore rules
├── tsconfig.json                    # TypeScript config
├── package.json                     # Root dependencies
│
└── backend/                         # 🏗️ Backend NestJS
    ├── 📄 package.json              # Dependencias backend
    ├── 📄 Dockerfile                # Imagen Docker
    ├── 📄 .env.example              # Variables template
    ├── tsconfig.json                # TS config backend
    │
    ├── 🔑 main.ts                   # Entry point
    ├── 🔑 app.module.ts             # Root module
    │
    ├── 📁 prisma/                   # 🗄️ Base de Datos
    │   ├── schema.prisma            # DB schema (User, Doctor, Patient, Prescription, etc)
    │   ├── prisma.service.ts        # Prisma client connection
    │   └── prisma.module.ts         # Prisma module
    │
    ├── 📁 auth/                     # 🔐 Autenticación
    │   ├── auth.service.ts          # Sign-up, Sign-in, Token generation
    │   ├── auth.controller.ts       # /auth/sign-up, /auth/sign-in
    │   ├── auth.module.ts           # Auth module
    │   ├── auth.dto.ts              # DTOs de autenticación
    │   ├── jwt.strategy.ts          # Passport JWT strategy
    │   ├── refresh.strategy.ts      # Refresh token strategy
    │   ├── roles.guard.ts           # Guard para validar roles
    │   └── roles.decorator.ts       # @Roles() decorator
    │
    ├── 📁 users/                    # 👥 Gestión de Usuarios
    │   ├── users.service.ts         # CRUD usuarios
    │   ├── users.controller.ts      # Endpoints /users
    │   ├── users.module.ts          # Users module
    │   └── users.dto.ts             # DTOs (CreateUser, UserResponse)
    │
    ├── 📁 doctors/                  # 👨‍⚕️ Perfil de Médicos
    │   ├── doctors.service.ts       # Obtener datos médicos
    │   ├── doctors.controller.ts    # Endpoints /doctors
    │   ├── doctors.module.ts        # Doctors module
    │   └── doctors.dto.ts           # DTOs
    │
    ├── 📁 patients/                 # 👤 Perfil de Pacientes
    │   ├── patients.service.ts      # Obtener datos pacientes
    │   ├── patients.controller.ts   # Endpoints /patients
    │   ├── patients.module.ts       # Patients module
    │   └── patients.dto.ts          # DTOs
    │
    ├── 📁 prescriptions/            # 💊 Prescripciones (CORE)
    │   ├── prescriptions.service.ts # Crear, ver, actualizar Rx
    │   ├── prescriptions.controller.ts # Endpoints /prescriptions
    │   ├── prescriptions.module.ts  # Prescriptions module
    │   └── prescriptions.dto.ts     # DTOs con validación
    │
    ├── 📁 admin/                    # 📊 Métricas & Administración
    │   ├── admin.service.ts         # Cálculo de métricas
    │   ├── admin.controller.ts      # GET /admin/metrics
    │   ├── admin.module.ts          # Admin module
    │   └── admin.dto.ts             # DTOs
    │
    └── 📁 common/                   # 🛠️ Utilidades Comunes
        ├── filters/
        │   └── all-exceptions.filter.ts  # Exception handling global
        ├── guards/
        │   └── (Roles guard está en auth/)
        ├── interceptors/
        │   └── logging.interceptor.ts    # Request logging
        ├── middlewares/
        │   └── logger.middleware.ts      # Logger middleware
        └── pipes/
            └── parse-int.pipe.ts         # Validación de enteros
```

## 🔄 Flujos de Datos

### 1️⃣ Autenticación
```
Client → POST /auth/sign-up
         ↓
    auth.service.ts
    - Hash password con bcrypt
    - Crear User en BD
    - Crear Doctor/Patient profile
    - Generar JWT tokens
         ↓
    Response: { accessToken, refreshToken, user }
```

### 2️⃣ Crear Prescripción
```
Doctor → POST /prescriptions
         ↓
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('DOCTOR')
         ↓
    prescriptions.service.ts
    - Validar doctor existe
    - Validar paciente existe
    - Crear Prescription + Items
         ↓
    Response: Prescription con items
```

### 3️⃣ Ver Métricas (Admin)
```
Admin → GET /admin/metrics
        ↓
   @UseGuards(AuthGuard('jwt'), RolesGuard)
   @Roles('ADMIN')
        ↓
   admin.service.ts
   - Count pacientes
   - Count médicos
   - Count prescripciones
   - Group by status
   - Group by day (últimos 30 días)
        ↓
   Response: MetricsResponseDto
```

## 📦 Dependencias Principales

```json
{
  "@nestjs/common": "^10.2.10",     // Core de NestJS
  "@nestjs/core": "^10.2.10",       // Core runtime
  "@nestjs/jwt": "^11.0.1",         // JWT handling
  "@nestjs/passport": "^10.0.3",    // Passport integration
  "@prisma/client": "^5.6.0",       // Database client
  "passport": "^0.7.0",             // Authentication middleware
  "passport-jwt": "^4.0.1",         // JWT Passport strategy
  "bcrypt": "^5.1.1",               // Password hashing
  "class-validator": "^0.14.0",     // DTO validation
  "class-transformer": "^0.5.1"     // DTO transformation
}
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (salt: 10)
- ✅ JWT con expiración
- ✅ Refresh tokens separados
- ✅ Role-based access control
- ✅ Validación global de DTOs
- ✅ Exception handling
- ✅ CORS configurado

## 🚀 Inicio Rápido

```bash
# Setup automático (Windows)
setup.bat

# O setup automático (Mac/Linux)
setup.sh

# O manualmente
cd backend
npm install
npm run prisma:migrate
npm run start:dev
```

## 📊 Endpoints Resumen

| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | /auth/sign-up | - | Registrarse |
| POST | /auth/sign-in | - | Login |
| POST | /users | ADMIN | Crear usuario |
| GET | /users | ADMIN | Listar usuarios |
| GET | /doctors | ALL | Listar médicos |
| GET | /patients | ADMIN/DOCTOR | Listar pacientes |
| POST | /prescriptions | DOCTOR | Crear Rx |
| GET | /prescriptions/patient/:id | PATIENT | Mis Rx |
| PATCH | /prescriptions/:id/status | PATIENT | Cambiar estado |
| GET | /admin/metrics | ADMIN | Ver métricas |

## 🎯 Estados y Flujos

```
Usuario
├── ADMIN (crear usuarios, ver métricas)
├── DOCTOR (crear Rx, ver sus Rx)
└── PATIENT (ver Rx, cambiar estado)

Prescripción
├── PENDING (creada)
└── CONSUMED (consumida)

Item de Rx
└── (sin estado, solo información)
```

## 📝 Notas Importantes

1. **Base de datos**: PostgreSQL 16 en Docker
2. **ORM**: Prisma con migraciones automáticas
3. **Auth**: JWT con estrategias separadas para access/refresh
4. **Validación**: class-validator + ValidationPipe global
5. **Roles**: Guard inyectable con decorador @Roles()
6. **Logging**: Interceptor global
7. **Errores**: Filter global para excepciones

## 🔗 Referencias

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Passport Docs](https://www.passportjs.org)
- [JWT.io](https://jwt.io)

