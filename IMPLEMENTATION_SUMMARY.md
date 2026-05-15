# Implementación Completada — NUTRABITICS

## Estado General

| Área | Estado |
|------|--------|
| Backend NestJS | ✅ Completo |
| Base de Datos (Prisma + PostgreSQL) | ✅ Completo |
| Autenticación JWT | ✅ Completo |
| Roles y Permisos (RBAC) | ✅ Completo |
| Generación de PDF con QR | ✅ Completo |
| Rate Limiting | ✅ Completo |
| Swagger / OpenAPI UI | ✅ Completo |
| Frontend Next.js | ✅ Completo |
| Tests unitarios (frontend) | ✅ Completo |
| Docker | ✅ Completo |

---

## Backend — Módulos

### Autenticación (`auth/`)
- Sign-up, sign-in, login (alias), refresh token
- Estrategias Passport: JWT (Bearer + Cookie) y Refresh
- HTTP-Only cookies como alternativa segura (`/auth/sign-in-cookies`)
- Guard de roles (`RolesGuard`) y decorador `@Roles()`
- bcrypt con salt 10

### Usuarios (`users/`)
- CRUD completo (solo Admin)
- Al crear un usuario, se crea automáticamente el perfil `Doctor` o `Patient` según el rol

### Médicos (`doctors/`)
- Listar médicos con paginación y búsqueda
- Ver detalle de médico
- Actualizar especialidad (Admin)

### Pacientes (`patients/`)
- Listar pacientes con paginación y búsqueda
- Ver detalle de paciente

### Prescripciones (`prescriptions/`)
- Crear prescripción para paciente por ID o por email
- Listar con filtros (estado, fechas, doctor/paciente) y paginación
- Ver detalle con control de acceso por rol
- Consumir prescripción (`PUT /consume` y `PATCH /status`)
- Descargar PDF generado con PDFKit (incluye QR)
- Descargar código QR como PNG

### Admin (`admin/`)
- Métricas: total pacientes, médicos, prescripciones, agrupadas por estado y por día
- Soporte de filtros de fecha (`from`, `to`)
- Listado de todas las prescripciones con filtros y paginación

### Paciente autenticado (`me/`)
- `GET /me/prescriptions` — prescripciones del paciente logueado con paginación

### Utilidades comunes (`common/`)
- `AllExceptionsFilter` — respuestas de error consistentes
- `LoggingInterceptor` — logging de duración de requests
- `LoggerMiddleware` — logging de método/URL/status
- `ThrottleGuard` — rate limiting personalizado por IP
- `PdfService` — generación de PDF y QR con PDFKit + qrcode

---

## Frontend — Páginas

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/` | Público | Landing / bienvenida |
| `/login` | Público | Login con redirección por rol |
| `/admin` | Admin | Dashboard con métricas y gráfica |
| `/doctor` | Doctor | Home del médico |
| `/doctor/prescriptions` | Doctor | Lista de prescripciones con filtros |
| `/doctor/prescriptions/new` | Doctor | Crear nueva prescripción |
| `/doctor/prescriptions/[id]` | Doctor | Detalle + descarga PDF/QR |
| `/patient` | Patient | Home del paciente |
| `/patient/prescriptions` | Patient | Lista de prescripciones con filtros |
| `/patient/prescriptions/[id]` | Patient | Detalle + descarga PDF/QR |

### Componentes clave
- `ProtectedPage` — valida sesión y rol, redirige si no cumple
- `SiteHeader` — navegación con chip de usuario y logout
- `ToastContext` — sistema global de notificaciones
- `Toast` — notificación puntual por componente

### Utilidades
- `lib/auth.ts` — gestión de sesión en localStorage, decodificación y validación de JWT
- `lib/api.ts` — cliente HTTP con token automático, `apiFetch` y `apiFetchBlob`
- `lib/types.ts` — tipos compartidos (`Prescription`, `UserRole`, `MetricsResponse`, etc.)

---

## Tests (Frontend)

- `src/lib/auth.test.ts` — tests unitarios de todos los helpers de autenticación
- `src/components/ProtectedPage.test.tsx` — tests de integración de la guarda de rutas

Configurados con Jest + ts-jest + jest-environment-jsdom + @testing-library/react.

---

## Infraestructura

- `docker-compose.yml` — PostgreSQL 16, Adminer, Backend NestJS
- `Dockerfile` — imagen optimizada del backend
- `main.ts` — Helmet, cookie-parser, ValidationPipe global, CORS, Swagger UI en `/docs`
- `app.module.ts` — ThrottlerModule (100 req/min por IP), todos los módulos registrados

---
