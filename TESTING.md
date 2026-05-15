# Testing — NUTRABITICS API

## Preparación

```bash
docker-compose up -d

# Verificar backend
curl http://localhost:3001/auth/me
# → 401 Unauthorized (esperado)
```

## Cuentas de Prueba (seed)

```bash
cd backend && npm run prisma:seed
```

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@test.com` | `password123` |
| Doctor | `dr@test.com` | `password123` |
| Paciente | `patient@test.com` | `password123` |

---

## Paso 1 — Login

```bash
# Login como Admin
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'

export ADMIN_TOKEN="<accessToken>"

# Login como Doctor
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr@test.com","password":"password123"}'

export DOCTOR_TOKEN="<accessToken>"

# Login como Paciente
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"password123"}'

export PATIENT_TOKEN="<accessToken>"
```

## Paso 2 — Crear Usuario (Admin)

```bash
curl -X POST http://localhost:3001/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo.doctor@example.com",
    "password": "Pass123!",
    "firstName": "Ana",
    "lastName": "López",
    "role": "DOCTOR"
  }'
```

## Paso 3 — Ver Médicos y Pacientes

```bash
# Médicos
curl http://localhost:3001/doctors \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Pacientes
curl http://localhost:3001/patients \
  -H "Authorization: Bearer $DOCTOR_TOKEN"
```

## Paso 4 — Crear Prescripción (Doctor)

```bash
curl -X POST http://localhost:3001/prescriptions \
  -H "Authorization: Bearer $DOCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientEmail": "patient@test.com",
    "notes": "Tomar con alimentos",
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
        "instructions": "Cada 6 horas según necesidad"
      }
    ]
  }'

export PRESCRIPTION_ID="<id>"
```

## Paso 5 — Ver Prescripciones

```bash
# Mis prescripciones (paciente)
curl "http://localhost:3001/me/prescriptions" \
  -H "Authorization: Bearer $PATIENT_TOKEN"

# Con filtros
curl "http://localhost:3001/me/prescriptions?status=PENDING&page=1&limit=10" \
  -H "Authorization: Bearer $PATIENT_TOKEN"

# Prescripciones del doctor (filtra automáticamente)
curl "http://localhost:3001/prescriptions" \
  -H "Authorization: Bearer $DOCTOR_TOKEN"

# Detalle
curl "http://localhost:3001/prescriptions/$PRESCRIPTION_ID" \
  -H "Authorization: Bearer $PATIENT_TOKEN"
```

## Paso 6 — Descargar PDF y QR

```bash
# PDF
curl "http://localhost:3001/prescriptions/$PRESCRIPTION_ID/pdf" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -o prescription.pdf

# QR (PNG)
curl "http://localhost:3001/prescriptions/$PRESCRIPTION_ID/qr" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -o prescription-qr.png
```

## Paso 7 — Consumir Prescripción (Paciente)

```bash
# Opción A
curl -X PUT "http://localhost:3001/prescriptions/$PRESCRIPTION_ID/consume" \
  -H "Authorization: Bearer $PATIENT_TOKEN"

# Opción B
curl -X PATCH "http://localhost:3001/prescriptions/$PRESCRIPTION_ID/status" \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"CONSUMED"}'
```

## Paso 8 — Métricas (Admin)

```bash
# General
curl http://localhost:3001/admin/metrics \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Con filtro de fechas
curl "http://localhost:3001/admin/metrics?from=2024-01-01&to=2024-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Paso 9 — Pruebas de Error

```bash
# Sin token → 401
curl http://localhost:3001/prescriptions

# Rol incorrecto (paciente intenta crear prescripción) → 403
curl -X POST http://localhost:3001/prescriptions \
  -H "Authorization: Bearer $PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

# Recurso inexistente → 404
curl http://localhost:3001/prescriptions/id-invalido \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Tests Frontend

```bash
cd frontend

# Todos los tests
npm test

# Con cobertura
npm run test:coverage

# Watch mode
npm run test:watch
```

Archivos de test:
- `src/lib/auth.test.ts` — helpers de autenticación (localStorage, JWT validation)
- `src/components/ProtectedPage.test.tsx` — guard de rutas por rol

---

## Base de Datos — Verificación

```bash
# Conectar a PostgreSQL
docker exec -it nutrabitics_db psql -U nutrabitics_user -d nutrabitics_db

# Queries útiles
SELECT id, email, role FROM "User";
SELECT p.id, p.code, p.status, p."createdAt" FROM "Prescription" p ORDER BY p."createdAt" DESC;
SELECT status, COUNT(*) FROM "Prescription" GROUP BY status;
SELECT * FROM "PrescriptionItem" WHERE "prescriptionId" = '<id>';
```

---