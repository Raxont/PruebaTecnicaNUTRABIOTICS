# Quick Reference - NUTRABITICS Backend API

## 🗺️ Flujo de la Aplicación

```
┌─────────────────────────────────────────────────────────────┐
│                        PACIENTE                             │
│  - Sign Up → Create Patient Profile                        │
│  - Sign In → Get JWT Tokens                                │
│  - Ver mis prescripciones                                  │
│  - Cambiar estado: pending → consumed                      │
│  - Descargar PDF                                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────█─────────┐
        │                   │
        ▼                   ▼
┌──────────────────┐  ┌──────────────────┐
│    MÉDICO        │  │     ADMIN        │
│  - Create Rx     │  │  - Ver métricas  │
│  - Ver mis Rx    │  │  - Crear usuarios│
│  - Consultar     │  │  - Asignar roles │
│    pacientes     │  │                  │
└──────────────────┘  └──────────────────┘
```

## 🔐 Componentes de Seguridad

1. **JWT Authentication**
   - Access Token: 15 minutos
   - Refresh Token: 7 días

2. **Role-Based Access Control (RBAC)**
   - ADMIN, DOCTOR, PATIENT

3. **Decoradores**
   - `@Roles('ADMIN')` - Restringe acceso
   - `@UseGuards(AuthGuard('jwt'))` - Requiere autenticación

## 📊 Modelos de Datos

### User
```
- id: CUID
- email: unique
- password: bcrypt (salt: 10)
- firstName, lastName
- role: ADMIN | DOCTOR | PATIENT
- timestamps
```

### Prescription
```
- id: CUID
- doctorId:FK → Doctor
- patientId: FK → Patient
- status: PENDING | CONSUMED
- items: PrescriptionItem[]
- timestamps
```

### PrescriptionItem
```
- id: CUID
- prescriptionId: FK → Prescription
- name: string (medicamento)
- dosage: string (ej: "500mg")
- quantity: number
- instructions: string (indicaciones)
```

## 📡 Endpoints por Rol

### 🔓 Públicos
- `POST /auth/sign-up` - Registro
- `POST /auth/sign-in` - Login

### 👤 Paciente
- `GET /patients/:id` - Mi perfil
- `GET /prescriptions/patient/:patientId` - Mis Rx
- `PATCH /prescriptions/:id/status` - Cambiar estado

### 👨‍⚕️ Médico
- `GET /doctors` - Listar médicos
- `GET /doctors/:id` - Perfil médico
- `POST /prescriptions` - Crear Rx
- `GET /prescriptions/doctor/:doctorId` - Mis Rx

### 👨‍💼 Admin
- `POST /users` - Crear usuario
- `GET /users` - Listar usuarios
- `GET /users/:id` - Usuario
- `PATCH /users/:id` - Editar usuario
- `DELETE /users/:id` - Eliminar usuario
- `GET /admin/metrics` - Métricas
- `PATCH /users/:id` - Cambiar rol

## 🔄 Flujos de Ejemplo

### 1️⃣ Registro e Inicio de Sesión

```bash
# 1. Registro (paciente)
POST /auth/sign-up
{
  "email": "paciente@example.com",
  "password": "securepass123",
  "firstName": "Juan",
  "lastName": "Perez"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}

# 2. Login
POST /auth/sign-in
{
  "email": "paciente@example.com",
  "password": "securepass123"
}
```

### 2️⃣ Crear Prescripción (Médico)

```bash
POST /prescriptions
Authorization: Bearer {accessToken}
{
  "patientId": "patient-id-123",
  "items": [
    {
      "name": "Amoxicilina",
      "dosage": "500mg",
      "quantity": "30",
      "instructions": "Una cada 8 horas por 10 días"
    },
    {
      "name": "Paracetamol",
      "dosage": "500mg",
      "quantity": "20",
      "instructions": "Una cada 6 horas según sea necesario"
    }
  ]
}

Response:
{
  "id": "rx-123",
  "doctorId": "doc-456",
  "patientId": "patient-id-123",
  "status": "PENDING",
  "items": [ ... ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 3️⃣ Ver Prescripciones (Paciente)

```bash
GET /prescriptions/patient/patient-id-123
Authorization: Bearer {accessToken}

Response:
[
  {
    "id": "rx-123",
    "status": "PENDING",
    "items": [ ... ],
    "doctor": {
      "user": {
        "firstName": "Carlos",
        "lastName": "García"
      }
    }
  }
]
```

### 4️⃣ Cambiar Estado (Paciente)

```bash
PATCH /prescriptions/rx-123/status
Authorization: Bearer {accessToken}
{
  "status": "CONSUMED"
}
```

### 5️⃣ Ver Métricas (Admin)

```bash
GET /admin/metrics
Authorization: Bearer {adminAccessToken}

Response:
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

## 📥 Headers Requeridos

Todos los endpoints protegidos requieren:

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

## ⚠️ Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | OK - Éxito |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Permisos insuficientes |
| 404 | Not Found - Recurso no existe |
| 500 | Internal Server Error |

## 🚀 Comandos Útiles

```bash
# Iniciar en desarrollo
npm run start:dev

# Build para producción
npm run build

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio
npm run prisma:studio

# Generar Prisma Client
npm run prisma:generate
```

## 🗂️ Estructura de Carpetas

```
backend/
├── admin/           # Métricas para admin
├── auth/            # Autenticación JWT, estrategias
├── common/          
│   ├── filters/     # Exception filters
│   ├── guards/      # Auth guards
│   ├── interceptors/# Logging, transformación
│   ├── middlewares/ # Logger middleware
│   └── pipes/       # Validación
├── doctors/         # Perfil de médicos
├── patients/        # Perfil de pacientes
├── prescriptions/   # Crear, actualizar Rx
├── prisma/          # DB schema, servicio
├── users/           # Gestión de usuarios
├── main.ts          # Entry point
└── app.module.ts    # Root module
```

## 📚 Recursos Adicionales

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [JWT.io](https://jwt.io)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

