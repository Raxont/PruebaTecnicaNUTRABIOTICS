# 🧪 Testing NUTRABITICS Backend API

Guía completa para testear todos los endpoints de la API.

---

## 🚀 Preparación

### 1. Iniciar el servidor

```bash
# Con Docker (recomendado)
docker-compose up -d

# O localmente
cd backend
npm run start:dev
```

### 2. Verificar que está corriendo

```bash
# Debería retornar un error 401 (esperado porque no hay token)
curl http://localhost:3001/users

# Resultado: {"statusCode":401,"message":"Unauthorized","timestamp":"2024-01-15T10:30:00Z"}
```

---

## 🔐 Paso 1: Autenticación

### 1.1 Registrarse como Paciente

```bash
curl -X POST http://localhost:3001/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paciente@example.com",
    "password": "SecurePass123!",
    "firstName": "Juan",
    "lastName": "Perez"
  }'
```

**Respuesta esperada:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "patient-id-12345",
    "email": "paciente@example.com",
    "firstName": "Juan",
    "lastName": "Perez",
    "role": "PATIENT"
  }
}
```

**Guarda los tokens:**
```bash
export PATIENT_ACCESS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
export PATIENT_ID="patient-id-12345"
```

### 1.2 Login como Paciente

```bash
curl -X POST http://localhost:3001/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paciente@example.com",
    "password": "SecurePass123!"
  }'
```

---

## 👥 Paso 2: Crear Usuarios (Admin)

**NOTA:** Primero necesitas crear un usuario ADMIN. Deberás actualizar manualmente la BD:

```bash
# Conectado a PostgreSQL:
UPDATE "User" SET role = 'ADMIN' WHERE email = 'paciente@example.com';
```

O crea un admin directamente:

```sql
INSERT INTO "User" (id, email, password, "firstName", "lastName", role, "createdAt", "updatedAt")
VALUES (
  'admin-123',
  'admin@example.com',
  '$2b$10$...',  -- contraseña hasheada con bcrypt
  'Administrador',
  'Sistema',
  'ADMIN',
  NOW(),
  NOW()
);
```

### 2.1 Registrate como Admin (simulado)

```bash
# Primero registrate como paciente
curl -X POST http://localhost:3001/auth/sign-up ...

# Luego en BD, cambia el rol
export ADMIN_ACCESS_TOKEN="tu_admin_token"
```

### 2.2 Crear un Médico

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -d '{
    "email": "doctor@example.com",
    "password": "DoctorPass123!",
    "firstName": "Carlos",
    "lastName": "Garcia",
    "role": "DOCTOR"
  }'
```

**Respuesta esperada:**
```json
{
  "id": "doctor-id-456",
  "email": "doctor@example.com",
  "firstName": "Carlos",
  "lastName": "Garcia",
  "role": "DOCTOR"
}
```

**Guarda el doctor ID:**
```bash
export DOCTOR_ID="doctor-id-456"
export DOCTOR_ACCESS_TOKEN="nuevo_token_del_doctor"
```

### 2.3 Crear otro Paciente

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN" \
  -d '{
    "email": "otro.paciente@example.com",
    "password": "PatientPass123!",
    "firstName": "Maria",
    "lastName": "Lopez",
    "role": "PATIENT"
  }'
```

```bash
export PATIENT2_ID="patient-id-789"
```

---

## 📋 Paso 3: Listar Usuarios

```bash
curl -X GET http://localhost:3001/users \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```

**Respuesta:** Array de usuarios

---

## 👨‍⚕️ Paso 4: Ver Médicos

```bash
curl -X GET http://localhost:3001/doctors \
  -H "Authorization: Bearer $PATIENT_ACCESS_TOKEN"
```

**Respuesta:** Array de médicos con detalles

---

## 💊 Paso 5: Crear Prescripción (Médico)

```bash
curl -X POST http://localhost:3001/prescriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCTOR_ACCESS_TOKEN" \
  -d '{
    "patientId": "'$PATIENT_ID'",
    "items": [
      {
        "name": "Amoxicilina",
        "dosage": "500mg",
        "quantity": "30",
        "instructions": "Una cápsula cada 8 horas por 10 días"
      },
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "quantity": "20",
        "instructions": "Una tableta cada 6-8 horas según sea necesario para el dolor"
      },
      {
        "name": "Vitamina C",
        "dosage": "1000mg",
        "quantity": "30",
        "instructions": "Una tableta diaria por la mañana"
      }
    ]
  }'
```

**Respuesta esperada:**
```json
{
  "id": "rx-123",
  "doctorId": "doctor-id-456",
  "patientId": "patient-id-12345",
  "status": "PENDING",
  "items": [
    {
      "id": "item-1",
      "name": "Amoxicilina",
      "dosage": "500mg",
      "quantity": 30,
      "instructions": "Una cápsula cada 8 horas por 10 días"
    },
    ...
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Guarda el prescription ID:**
```bash
export PRESCRIPTION_ID="rx-123"
```

---

## 👤 Paso 6: Ver Mis Prescripciones (Paciente)

```bash
curl -X GET http://localhost:3001/prescriptions/patient/$PATIENT_ID \
  -H "Authorization: Bearer $PATIENT_ACCESS_TOKEN"
```

**Respuesta:** Array con la prescripción creada

---

## 👨‍⚕️ Paso 7: Ver Mis Prescripciones (Médico)

```bash
curl -X GET http://localhost:3001/prescriptions/doctor/$DOCTOR_ID \
  -H "Authorization: Bearer $DOCTOR_ACCESS_TOKEN"
```

**Respuesta:** Array con la prescripción creada

---

## 📝 Paso 8: Cambiar Estado de Prescripción (Paciente)

```bash
curl -X PATCH http://localhost:3001/prescriptions/$PRESCRIPTION_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_ACCESS_TOKEN" \
  -d '{
    "status": "CONSUMED"
  }'
```

**Respuesta esperada:**
```json
{
  "id": "rx-123",
  "status": "CONSUMED",
  ...
}
```

---

## 📊 Paso 9: Ver Métricas (Admin)

```bash
curl -X GET http://localhost:3001/admin/metrics \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```

**Respuesta esperada:**
```json
{
  "totalPatients": 2,
  "totalDoctors": 1,
  "totalPrescriptions": 1,
  "prescriptionsByStatus": {
    "pending": 0,
    "consumed": 1
  },
  "prescriptionsByDay": [
    {
      "date": "2024-01-15",
      "count": 1
    }
  ]
}
```

---

## ❌ Paso 10: Pruebas de Error

### 10.1 Sin Token

```bash
curl -X GET http://localhost:3001/users
# Error 401: Unauthorized
```

### 10.2 Token Inválido

```bash
curl -X GET http://localhost:3001/users \
  -H "Authorization: Bearer invalid_token_123"
# Error 401: Unauthorized
```

### 10.3 Permisos Insuficientes (Paciente intenta crear usuario)

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PATIENT_ACCESS_TOKEN" \
  -d '{...}'
# Error 403: Forbidden - Insufficient permissions
```

### 10.4 Recurso No Encontrado

```bash
curl -X GET http://localhost:3001/users/invalid-id \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
# Error 404: User not found
```

---

## 🧪 Con Postman (Recomendado)

### 1. Importar colección

```json
{
  "info": {
    "name": "NUTRABITICS API",
    "version": "1.0"
  },
  "item": [
    {
      "name": "Sign Up",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/auth/sign-up",
        "body": {
          "mode": "raw",
          "raw": "{...}"
        }
      }
    },
    ...
  ]
}
```

### 2. Utilizar el cliente REST

- **Cliente:** Postman, Insomnia, VS Code REST Client
- **Headers:** `Authorization: Bearer {token}`
- **Content-Type:** `application/json`

---

## 📊 Diagrama de Flujo de Testing

```
1️⃣ REGISTRO PACIENTE
    ↓
2️⃣ LOGIN PACIENTE
    ↓
3️⃣ CREAR ADMIN (en BD)
    ↓
4️⃣ CREAR MÉDICO (Admin)
    ↓
5️⃣ CREAR PRESCRIPCIÓN (Médico)
    ↓
6️⃣ VER MIS RX (Paciente)
    ↓
7️⃣ CAMBIAR ESTADO (Paciente)
    ↓
8️⃣ VER MÉTRICAS (Admin)
    ↓
9️⃣ PROBAR ERRORES
```

---

## 💾 Base de Datos - Verificación

### Conectarse a PostgreSQL

```bash
# Con Docker
docker exec -it nutrabitics_db psql -U nutrabitics_user -d nutrabitics_db

# Queries útiles
SELECT * FROM "User";
SELECT * FROM "Prescription" JOIN "PrescriptionItem" ON "Prescription".id = "PrescriptionItem"."prescriptionId";
SELECT status, COUNT(*) FROM "Prescription" GROUP BY status;
```

---

## ✅ Checklist de Testing

- [ ] Login y registro funcionan
- [ ] Tokens se generan correctamente
- [ ] Guards protegen endpoints
- [ ] CRUD de usuarios funciona
- [ ] Crear prescripción funciona
- [ ] Ver prescripciones por paciente/médico
- [ ] Cambiar estado funciona
- [ ] Métricas se calculan correctamente
- [ ] Errores retornan códigos correctos
- [ ] Validación de DTOs funciona

---

## 🚀 Performance

```bash
# Medir velocidad de respuesta
time curl -X GET http://localhost:3001/admin/metrics \
  -H "Authorization: Bearer $ADMIN_ACCESS_TOKEN"
```

---

## 📝 Notas

- Los tokens expiran en 15 minutos (access)
- El refresh token dura 7 días
- Las constraseñas se hashean con bcrypt
- Los IDs se generan con CUID
- Las timestamps están en UTC

