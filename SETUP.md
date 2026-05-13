# Requerimientos Funcionales - NUTRABITICS

## 1. Requerimientos Funcionales

### Roles
- **Admin**
  - Visualiza métricas: # de pacientes, # de médicos, # de prescripciones, prescripciones por estado y por día.
  - (Opcional/Plus) Crea usuarios y asigna roles.

- **Médico**
  - Crea prescripciones para un paciente existente (o por email del paciente).
  - Lista y ve detalle de sus propias prescripciones.

- **Paciente**
  - Lista y ve detalle de sus prescripciones.
  - Cambia el estado pendiente → consumida.
  - Descarga PDF de la prescripción.

### Flujo Mínimo
1. Autenticación por email/password.
2. Un médico crea una prescripción para un paciente (inputs libres para items).
3. El paciente ve su bandeja de prescripciones, puede marcar como consumida y descargar PDF.
4. El admin visualiza métricas.

### Estados
- Prescripción: pending | consumed.

### Items
- No requieren estado; sólo nombre, dosis, cantidad, indicaciones.

## 2. Implementación Completada

✅ **Schema Prisma**
- User (ADMIN, DOCTOR, PATIENT)
- Doctor (relación con User)
- Patient (relación con User)
- Prescription (estado: PENDING, CONSUMED)
- PrescriptionItem (nombre, dosis, cantidad, indicaciones)

✅ **Autenticación**
- Sign up (registro de pacientes)
- Sign in (login)
- JWT con access token y refresh token
- Roles guard

✅ **Usuarios (Admin)**
- Crear usuarios con rol
- Listar usuarios
- Obtener usuario
- Actualizar usuario
- Eliminar usuario

✅ **Médicos**
- Listar médicos
- Obtener detalles de médico
- Actualizar especialización

✅ **Pacientes**
- Listar pacientes
- Obtener detalles de paciente

✅ **Prescripciones**
- Crear prescripciones (solo médicos)
- Ver prescripciones por doctor
- Ver prescripciones por paciente
- Cambiar estado (solo pacientes)

✅ **Métricas (Admin)**
- Cantidad de pacientes
- Cantidad de médicos
- Cantidad total de prescripciones
- Prescripciones por estado
- Prescripciones por día (últimos 30 días)

✅ **Configuración**
- Docker compose con PostgreSQL
- Dockerfile para backend
- Package.json con dependencias
- Variables de entorno
- Migraciones Prisma

## 3. Próximos Pasos Opcionales

- [ ] Descarga de PDF de prescripciones
- [ ] Notificaciones por email
- [ ] Swagger/OpenAPI documentation
- [ ] Unit tests y E2E tests
- [ ] Rate limiting
- [ ] Logging avanzado
- [ ] Caché de sesiones

