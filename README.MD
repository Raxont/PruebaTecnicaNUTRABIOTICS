# NUTRABITICS Backend - Sistema de Gestión de Prescripciones Médicas

## 📋 Descripción

Backend API para un sistema de gestión de prescripciones médicas construido con NestJS y PostgreSQL. Implementa funcionalidades para:

- **Autenticación** con JWT (access token y refresh token)
- **Roles y permisos**: Admin, Médico, Paciente
- **Gestión de prescripciones** médicas
- **Métricas y reportes** para administradores
- **PDF download** de prescripciones (integración pendiente)

## 🚀 Características

### Por Rol

#### Admin
- Crear usuarios con roles específicos
- Ver métricas: cantidad de pacientes, médicos, prescripciones
- Ver prescripciones por estado (pending/consumed)
- Ver prescripciones por día

#### Médico
- Crear prescripciones para pacientes
- Ver sus propias prescripciones
- Ver detalles de pacientes

#### Paciente
- Ver sus prescripciones
- Cambiar estado de prescripción (pending → consumed)
- Descargar PDF de prescripción

## 🛠️ Stack Tecnológico

- **Runtime**: Node.js 18+
- **Framework**: NestJS 10
- **Base de datos**: PostgreSQL 16
- **ORM**: Prisma
- **Autenticación**: JWT con Passport.js
- **Validación**: class-validator
- **Contenedorización**: Docker

## 📦 Prerequisites

- Docker & Docker Compose
- O alternativamente:
  - Node.js 18+
  - PostgreSQL 12+
  - npm o yarn

## 🚀 Instalación y Ejecución

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar y entrar al directorio
cd PruebaTecnicaNUTRABIOTICS

# Crear archivo .env en backend/ con las variables necesarias
cp backend/.env.example backend/.env

# Iniciar servicios
docker-compose up -d

# Las migraciones se ejecutarán automáticamente
# El API estará disponible en http://localhost:3001
# Adminer en http://localhost:8080
```

### Opción 2: Instalación Local

```bash
# Instalar dependencias
cd backend
npm install

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Ejecutar en desarrollo
npm run start:dev
```

## 📝 Variables de Entorno

Crear archivo `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nutrabitics_db"
JWT_ACCESS_SECRET="your_secret_key_here_minimum_32_characters"
JWT_REFRESH_SECRET="your_refresh_secret_here_minimum_32_characters"
JWT_ACCESS_TTL=900                    # 15 minutos
JWT_REFRESH_TTL=604800               # 7 días
APP_ORIGIN="http://localhost:3000"   # Frontend URL
PORT=3001
```

## 🔌 Endpoints API

### Autenticación
- `POST /auth/sign-up` - Registro de pacientes
- `POST /auth/sign-in` - Login

### Usuarios (Admin only)
- `POST /users` - Crear usuario
- `GET /users` - Listar usuarios
- `GET /users/:id` - Obtener usuario
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### Médicos
- `GET /doctors` - Listar médicos
- `GET /doctors/:id` - Obtener médico
- `PATCH /doctors/:id` - Actualizar médico

### Pacientes
- `GET /patients` - Listar pacientes
- `GET /patients/:id` - Obtener paciente

### Prescripciones
- `POST /prescriptions` - Crear prescripción (Doctor only)
- `GET /prescriptions/:id` - Obtener prescripción
- `GET /prescriptions/doctor/:doctorId` - Prescripciones por médico
- `GET /prescriptions/patient/:patientId` - Prescripciones por paciente
- `PATCH /prescriptions/:id/status` - Cambiar estado (Patient only)

### Admin
- `GET /admin/metrics` - Obtener métricas (Admin only)

## 🔐 Estructura de Datos

### User
```
{
  id: string (CUID)
  email: string (unique)
  password: string (hashed)
  firstName: string
  lastName: string
  role: ADMIN | DOCTOR | PATIENT
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Prescription
```
{
  id: string (CUID)
  doctorId: string
  patientId: string
  status: PENDING | CONSUMED
  items: PrescriptionItem[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### PrescriptionItem
```
{
  id: string (CUID)
  prescriptionId: string
  name: string (medicamento)
  dosage: string (dosis)
  quantity: number (cantidad)
  instructions: string (indicaciones)
}
```

## 📊 Métricas

El endpoint `/admin/metrics` retorna:

```json
{
  "totalPatients": 45,
  "totalDoctors": 12,
  "totalPrescriptions": 156,
  "prescriptionsByStatus": {
    "pending": 89,
    "consumed": 67
  },
  "prescriptionsByDay": [
    { "date": "2024-01-15", "count": 5 },
    { "date": "2024-01-16", "count": 8 }
  ]
}
```

## 🧪 Testing

```bash
cd backend

# Unit tests
npm run test

# Test con coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📚 Prisma Commands

```bash
cd backend

# Generar Prisma Client
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio (UI)
npm run prisma:studio
```

## 🐛 Troubleshooting

### Puerto 5432 ocupado
```bash
# Cambiar puerto en docker-compose.yml
"5433:5432"
# Actualizar DATABASE_URL en .env
```

### Migraciones fallando
```bash
# Resetear BD (CUIDADO: borra todo)
cd backend
npx prisma migrate reset
```

### Error de connexión a DB
```bash
# Verificar que postgres esté corriendo
docker-compose ps

# Ver logs
docker-compose logs postgres
```

## ✅ Checklist de Implementación

- [x] Schema Prisma con modelos
- [x] Autenticación JWT
- [x] Guards y roles
- [x] CRUD de usuarios
- [x] Módulo de médicos
- [x] Módulo de pacientes  
- [x] Módulo de prescripciones
- [x] Endpoint de métricas
- [ ] Download PDF de prescripciones
- [ ] Email notifications
- [ ] Rate limiting
- [ ] Swagger/OpenAPI docs

## 📝 Notas

- Las contraseñas se encriptan con bcrypt (salt: 10)
- Los tokens JWT expiran según JWT_ACCESS_TTL y JWT_REFRESH_TTL
- Las prescripciones se crean con estado PENDING por defecto
- Solo los pacientes pueden cambiar el estado de sus prescripciones

## 👤 Autor

Tu Nombre

## 📄 Licencia

MIT
