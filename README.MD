# NUTRABITICS Backend - Sistema de Gestión de Prescripciones Médicas

## 📋 Descripción

Backend API para un sistema de gestión de prescripciones médicas construido con NestJS y PostgreSQL. Implementa funcionalidades para:

- **Autenticación** con JWT (access token y refresh token)
- **Roles y permisos**: Admin, Médico, Paciente
- **Gestión de prescripciones** médicas con códigos QR
- **Métricas y reportes** para administradores
- **Generación de PDFs** con códigos QR integrados

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
- Descargar PDF de prescripción con código QR
- Acceder a códigos QR individuales de prescripciones

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
# 1. Clonar el repositorio
git clone <repository-url>
cd PruebaTecnicaNUTRABIOTICS

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones

# 3. Iniciar servicios con Docker
docker-compose up -d

# 4. Ejecutar migraciones y seed (opcional, para datos de prueba)
docker-compose exec backend npm run prisma:migrate
docker-compose exec backend npm run prisma:seed

# Servicios disponibles:
# - API Backend: http://localhost:3001
# - Base de datos: localhost:5432
# - Adminer (DB UI): http://localhost:8080
```

### Opción 2: Instalación Local

```bash
# 1. Instalar dependencias
cd backend
npm install

# 2. Configurar base de datos PostgreSQL
# Crear base de datos 'nutrabitics_db' o actualizar .env

# 3. Generar Prisma Client
npm run prisma:generate

# 4. Ejecutar migraciones
npm run prisma:migrate

# 5. Ejecutar seed (datos de prueba)
npm run prisma:seed

# 6. Ejecutar en desarrollo
npm run start:dev

# La API estará disponible en http://localhost:3001
```

## 📝 Variables de Entorno

Crear archivo `backend/.env` basado en `.env.example`:

```env
# Base de datos
DATABASE_URL="postgresql://nutrabitics_user:nutrabitics_password@localhost:5432/nutrabitics_db"

# JWT Configuration
JWT_ACCESS_SECRET="your_secret_key_here_minimum_32_characters_long"
JWT_REFRESH_SECRET="your_refresh_secret_here_minimum_32_characters"
JWT_ACCESS_TTL=900                    # 15 minutos en segundos
JWT_REFRESH_TTL=604800               # 7 días en segundos

# Aplicación
APP_ORIGIN="http://localhost:3000"   # URL del frontend
PORT=3001                            # Puerto del servidor

# Configuración adicional (opcional)
NODE_ENV="development"               # Entorno de ejecución
```

## � Scripts Disponibles

```bash
cd backend

# Desarrollo
npm run start:dev          # Iniciar en modo desarrollo con hot reload
npm run start:debug        # Iniciar en modo debug
npm run start:prod         # Iniciar en producción

# Build
npm run build              # Compilar TypeScript
npm run prebuild           # Limpiar directorio dist

# Testing
npm run test               # Ejecutar tests unitarios
npm run test:watch         # Tests en modo watch
npm run test:cov           # Tests con reporte de cobertura
npm run test:e2e           # Tests end-to-end
npm run test:debug         # Debug de tests

# Base de datos (Prisma)
npm run prisma:generate    # Generar Prisma Client
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:studio      # Abrir Prisma Studio (UI de BD)
npm run prisma:seed        # Ejecutar seed de datos de prueba

# Código
npm run lint               # Ejecutar ESLint
npm run format             # Formatear código con Prettier
```

## 🗄️ Gestión de Base de Datos

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
- `GET /prescriptions` - Listar prescripciones con filtros y paginación
- `GET /prescriptions/:id` - Obtener prescripción
- `GET /prescriptions/:id/pdf` - Descargar PDF de prescripción con QR
- `GET /prescriptions/:id/qr` - Descargar código QR de prescripción
- `GET /prescriptions/doctor/:doctorId` - Prescripciones por médico
- `GET /prescriptions/patient/:patientId` - Prescripciones por paciente
- `PUT /prescriptions/:id/consume` - Consumir prescripción (Patient only)
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

## 👥 Cuentas de Prueba

Después de ejecutar `npm run prisma:seed`, estarán disponibles las siguientes cuentas:

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| **Admin** | `admin@test.com` | `password123` | Acceso completo al sistema |
| **Doctor** | `dr@test.com` | `password123` | Dr. Maria Gonzalez - Médico general |
| **Patient** | `patient@test.com` | `password123` | Ana Molina - Paciente de prueba |

### Datos de Prueba Incluidos:
- 6 prescripciones de ejemplo (algunas pendientes, otras consumidas)
- Medicamentos comunes: Paracetamol, Ibuprofeno, Amoxicilina, etc.
- Estados de prescripción variados para testing

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

### Resetear datos de prueba
```bash
# Ejecutar seed nuevamente (sobrescribe datos existentes)
cd backend
npm run prisma:seed
```

### Problemas con códigos QR
```bash
# Verificar que APP_ORIGIN esté configurado correctamente en .env
# El QR genera URLs hacia el frontend configurado
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
- [x] **Download PDF de prescripciones con códigos QR**
- [x] **Endpoint para códigos QR individuales**
- [ ] Email notifications
- [ ] Rate limiting
- [ ] Swagger/OpenAPI docs

## 📝 Notas

- Las contraseñas se encriptan con bcrypt (salt: 10)
- Los tokens JWT expiran según JWT_ACCESS_TTL y JWT_REFRESH_TTL
- Las prescripciones se crean con estado PENDING por defecto
- Solo los pacientes pueden cambiar el estado de sus prescripciones

## 🔳 Códigos QR en Prescripciones

### Funcionalidades QR Implementadas:

1. **PDF con QR Integrado**: Los PDFs de prescripción incluyen automáticamente un código QR que enlaza a la vista web de la prescripción
2. **Endpoint QR Independiente**: `GET /prescriptions/:id/qr` retorna el código QR como imagen PNG
3. **URL del QR**: `http://localhost:3000/patient/prescriptions/{prescriptionId}` (configurable via APP_ORIGIN)

### Beneficios:
- **Acceso Rápido**: Los pacientes pueden escanear el QR desde el PDF impreso para acceder digitalmente
- **Verificación**: Los códigos QR facilitan la verificación de autenticidad de prescripciones
- **Integración Móvil**: Compatible con aplicaciones móviles de lectura de QR

### Seguridad:
- Los códigos QR respetan las mismas reglas de autorización que los endpoints de API
- Solo usuarios autorizados pueden acceder a las prescripciones vía QR

## 👤 Autor

Tu Nombre

## 📄 Licencia

MIT
