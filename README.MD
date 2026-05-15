# NUTRABITICS — Sistema de Gestión de Prescripciones Médicas

Backend NestJS + Frontend Next.js para gestión de prescripciones médicas con roles diferenciados.

---

## Stack Tecnológico

**Backend:** Node.js 18+, NestJS 10, PostgreSQL 16, Prisma, JWT + Passport.js, class-validator, PDFKit, QRCode, Docker  
**Frontend:** Next.js 14, React 18, TypeScript, Recharts

---

## Características implementadas

### Por Rol

**Admin**
- Ver métricas: pacientes, médicos, prescripciones por estado y por día (últimos 30 días)
- Crear usuarios y asignar roles
- Listar, editar y eliminar usuarios
- Ver todas las prescripciones con filtros y paginación

**Médico**
- Crear prescripciones para pacientes (por ID o por email)
- Listar y ver detalle de sus propias prescripciones
- Descargar PDF y código QR de prescripciones
- Filtros por estado, paciente y rango de fechas

**Paciente**
- Listar y ver detalle de sus prescripciones
- Cambiar estado: `PENDING → CONSUMED`
- Descargar PDF con código QR integrado
- Descargar código QR individual
- Filtros por estado, médico y rango de fechas

---

## Instalación y Ejecución

### Con Docker (Recomendado)

```bash
git clone https://github.com/Raxont/PruebaTecnicaNUTRABIOTICS
cd PruebaTecnicaNUTRABIOTICS

cp backend/.env.example backend/.env
# Editar backend/.env

docker-compose up -d
```

Servicios disponibles:
- API Backend: http://localhost:3001
- Swagger UI: http://localhost:3001/docs
- Base de datos: localhost:5432
- Adminer (DB UI): http://localhost:8080

### Instalación Local

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed   # datos de prueba
npm run start:dev
```

---

## Variables de Entorno

```env
DATABASE_URL="postgresql://nutrabitics_user:nutrabitics_password@localhost:5432/nutrabitics_db"
JWT_ACCESS_SECRET="your_secret_key_here_minimum_32_characters_long"
JWT_REFRESH_SECRET="your_refresh_secret_here_minimum_32_characters"
JWT_ACCESS_TTL=900        # 15 minutos
JWT_REFRESH_TTL=604800    # 7 días
APP_ORIGIN="http://localhost:3000"
PORT=3001
```

---

## Scripts disponibles

```bash
cd backend

npm run start:dev          # Desarrollo con hot reload
npm run build              # Compilar TypeScript
npm run start:prod         # Producción

npm run prisma:generate    # Generar Prisma Client
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:studio      # UI de la base de datos
npm run prisma:seed        # Datos de prueba

npm run test               # Tests unitarios
npm run test:cov           # Con cobertura
npm run test:e2e           # Tests E2E
npm run lint               # ESLint
npm run format             # Prettier
```

---

## Endpoints

### Autenticación (públicos)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/auth/sign-up` | Registro de pacientes |
| POST | `/auth/sign-in` | Login |
| POST | `/auth/login` | Login (alias) |
| POST | `/auth/refresh` | Renovar access token |
| GET | `/auth/me` | Perfil del usuario autenticado |

### Usuarios (Admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/users` | Crear usuario |
| GET | `/users` | Listar usuarios |
| GET | `/users/:id` | Obtener usuario |
| PATCH | `/users/:id` | Actualizar usuario |
| DELETE | `/users/:id` | Eliminar usuario |

### Médicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/doctors` | Listar médicos |
| GET | `/doctors/:id` | Obtener médico |
| PATCH | `/doctors/:id` | Actualizar especialidad (Admin) |

### Pacientes
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/patients` | Listar pacientes (Admin/Doctor) |
| GET | `/patients/:id` | Obtener paciente |

### Prescripciones
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/prescriptions` | Crear prescripción (Doctor) |
| GET | `/prescriptions` | Listar con filtros y paginación (Admin/Doctor) |
| GET | `/prescriptions/:id` | Ver prescripción |
| GET | `/prescriptions/:id/pdf` | Descargar PDF con QR |
| GET | `/prescriptions/:id/qr` | Descargar código QR (PNG) |
| GET | `/prescriptions/doctor/:doctorId` | Prescripciones por médico |
| GET | `/prescriptions/patient/:patientId` | Prescripciones por paciente |
| PUT | `/prescriptions/:id/consume` | Consumir prescripción (Patient) |
| PATCH | `/prescriptions/:id/status` | Cambiar estado (Patient) |

### Paciente autenticado
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/me/prescriptions` | Mis prescripciones con paginación |

### Admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/admin/metrics` | Métricas generales |
| GET | `/admin/prescriptions` | Todas las prescripciones (Admin) |

---

## Modelos de Datos

```
User        id, email, password (bcrypt), firstName, lastName, role, timestamps
Doctor      id, userId (FK), specialty, timestamps
Patient     id, userId (FK), timestamps
Prescription  id, code, doctorId, patientId?, patientEmail?, status, notes?, consumedAt?, timestamps
PrescriptionItem  id, prescriptionId, name, dosage, quantity, instructions?
```

**Enums:**
- `UserRole`: `ADMIN | DOCTOR | PATIENT`
- `PrescriptionStatus`: `PENDING | CONSUMED`

---

## Cuentas de Prueba (después de `npm run prisma:seed`)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@test.com` | `password123` |
| Doctor | `dr@test.com` | `password123` |
| Paciente | `patient@test.com` | `password123` |

---

## Seguridad implementada

- Contraseñas hasheadas con bcrypt (salt: 10)
- JWT access token (15 min) + refresh token (7 días)
- HTTP-Only cookies como opción alternativa (`/auth/sign-in-cookies`)
- Role-Based Access Control (RBAC) con guards y decoradores
- Helmet para headers de seguridad
- Rate limiting: 100 requests/minuto por IP (`ThrottlerModule`)
- CORS configurado para el origen del frontend
- Validación global de DTOs con `class-validator`
- Exception filter global con respuestas consistentes

---

## Códigos QR en Prescripciones

Los PDFs incluyen automáticamente un código QR que enlaza a la vista web de la prescripción. También se puede obtener el QR como imagen PNG independiente vía `GET /prescriptions/:id/qr`.

La URL base del QR es configurable vía `APP_ORIGIN` en el archivo `.env`.

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| Puerto 5432 ocupado | Cambiar a `5433:5432` en `docker-compose.yml` y actualizar `DATABASE_URL` |
| Migraciones fallan | `npx prisma migrate reset` (borra todos los datos) |
| Error de conexión a BD | Verificar `DATABASE_URL` en `.env` y que PostgreSQL esté corriendo |
| Token inválido | Verificar `JWT_ACCESS_SECRET` en `.env` |
| Import errors de Prisma | `npm run prisma:generate` |
| QR con URL incorrecta | Verificar `APP_ORIGIN` en `.env` |