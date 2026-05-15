# API Reference — NUTRABITICS

Base URL: `http://localhost:3001`  
Swagger UI: `http://localhost:3001/api`

Todos los endpoints protegidos requieren:
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

---

## Autenticación

### POST /auth/sign-up
Registro (crea usuario con rol PATIENT por defecto).
```json
// Body
{
  "email": "paciente@example.com",
  "password": "SecurePass123!",
  "firstName": "Juan",
  "lastName": "Perez",
  "role": "PATIENT"  // opcional, default PATIENT
}

// Response 201
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { "id": "...", "email": "...", "firstName": "...", "lastName": "...", "role": "PATIENT" }
}
```

### POST /auth/login  ·  POST /auth/sign-in
Login (ambas rutas son equivalentes). `@HttpCode(200)`
```json
// Body
{ "email": "...", "password": "..." }

// Response 200 — misma estructura que sign-up
```

### POST /auth/sign-in-cookies
Login que devuelve tokens como HTTP-Only cookies en lugar del body.

### POST /auth/refresh
Renueva el access token usando el refresh token (estrategia `jwt-refresh`).

### GET /auth/me  ·  GET /auth/profile
Devuelve `{ id, role }` del usuario autenticado.

---

## Usuarios — solo ADMIN

### POST /users
```json
{
  "email": "doctor@example.com",
  "password": "DoctorPass123!",
  "firstName": "Carlos",
  "lastName": "Garcia",
  "role": "DOCTOR"  // ADMIN | DOCTOR | PATIENT
}
```

### GET /users
Query params: `page`, `limit`, `sortBy`, `sortOrder`, `role`, `query`

### GET /users/:id
### PATCH /users/:id — body parcial de CreateUserDto
### DELETE /users/:id

---

## Médicos

Acceso: ADMIN, DOCTOR, PATIENT (lectura) / ADMIN (escritura)

### GET /doctors
Query params: `page`, `limit`, `query`, `sortBy`, `sortOrder`

### GET /doctors/:id
### PATCH /doctors/:id
```json
{ "specialty": "Cardiología" }
```

---

## Pacientes

Acceso: ADMIN, DOCTOR

### GET /patients
Query params: `page`, `limit`, `query`, `sortBy`, `sortOrder`

### GET /patients/:id
Acceso: ADMIN, DOCTOR, PATIENT

---

## Prescripciones

### POST /prescriptions — DOCTOR
```json
{
  "patientId": "cuid-del-paciente",  // o patientEmail
  "patientEmail": "externo@email.com",
  "notes": "Tomar en ayunas",
  "items": [
    {
      "name": "Amoxicilina",
      "dosage": "500mg",
      "quantity": "30",
      "instructions": "Una cápsula cada 8 horas por 10 días"
    }
  ]
}
```

### GET /prescriptions — ADMIN, DOCTOR
Query params: `page`, `limit`, `status` (PENDING|CONSUMED), `doctorId`, `patientId`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder`

Para DOCTOR: automáticamente filtra por sus propias prescripciones.

### GET /prescriptions/:id — ADMIN, DOCTOR, PATIENT
Control de acceso por rol: médico solo ve las suyas, paciente solo las suyas.

### GET /prescriptions/:id/pdf — ADMIN, DOCTOR, PATIENT
Descarga PDF con QR integrado. Response: `application/pdf`

### GET /prescriptions/:id/qr — ADMIN, DOCTOR, PATIENT
Descarga código QR como PNG. Response: `image/png`

### GET /prescriptions/doctor/:doctorId — DOCTOR, ADMIN
Array de prescripciones del médico.

### GET /prescriptions/patient/:patientId — PATIENT, DOCTOR, ADMIN
Array de prescripciones del paciente.

### PUT /prescriptions/:id/consume — PATIENT
Marca como CONSUMED. Solo el paciente dueño puede consumirla.

### PATCH /prescriptions/:id/status — PATIENT
```json
{ "status": "CONSUMED" }
```

---

## Paciente autenticado

### GET /me/prescriptions — PATIENT
Prescripciones del paciente logueado con paginación.  
Query params: `page`, `limit`, `status`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder`

---

## Admin

### GET /admin/metrics — ADMIN
Query params: `from` (YYYY-MM-DD), `to` (YYYY-MM-DD)
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
    { "date": "2024-01-15", "count": 5 }
  ]
}
```

### GET /admin/prescriptions — ADMIN
Todas las prescripciones con filtros y paginación. Mismos query params que `GET /prescriptions`.

---

## Códigos de Error

| Código | Significado |
|--------|-------------|
| 200 | OK |
| 201 | Creado |
| 400 | Bad Request — datos inválidos o faltantes |
| 401 | Unauthorized — sin token o token inválido |
| 403 | Forbidden — permisos insuficientes |
| 404 | Not Found |
| 429 | Too Many Requests — rate limit (100 req/min) |
| 500 | Internal Server Error |

Formato de error:
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```