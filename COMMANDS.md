# Comandos — NUTRABITICS

## Backend

```bash
cd backend

# Desarrollo
npm run start:dev          # Hot reload
npm run start:debug        # Con debugger
npm run build              # Compilar
npm run start:prod         # Producción

# Base de datos
npm run prisma:generate    # Generar Prisma Client
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:studio      # UI de la BD (http://localhost:5555)
npm run prisma:seed        # Datos de prueba

# Calidad
npm run lint               # ESLint
npm run lint -- --fix      # Fix automático
npm run format             # Prettier

# Tests
npm run test               # Unitarios
npm run test:cov           # Con cobertura
npm run test:e2e           # E2E
```

## Frontend

```bash
cd frontend

npm run dev                # Desarrollo (http://localhost:3000)
npm run build              # Build de producción
npm run start              # Servir build
npm run lint               # ESLint

# Tests
npm test                   # Todos los tests
npm run test:watch         # Watch mode
npm run test:coverage      # Con cobertura
```

## Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
docker-compose logs -f backend

# Detener
docker-compose down

# Resetear volúmenes (borra datos de BD)
docker-compose down -v

# Conectar a PostgreSQL
docker exec -it nutrabitics_db psql -U nutrabitics_user -d nutrabitics_db
```

## PostgreSQL — Queries útiles

```sql
-- Ver usuarios
SELECT id, email, role, "createdAt" FROM "User";

-- Contar prescripciones por estado
SELECT status, COUNT(*) FROM "Prescription" GROUP BY status;

-- Ver prescripciones de un paciente
SELECT * FROM "Prescription" WHERE "patientId" = '<id>';

-- Cambiar rol manualmente
UPDATE "User" SET role = 'ADMIN' WHERE email = 'user@example.com';

-- Reset completo de datos
-- (solo desarrollo) usar: npm run prisma:migrate reset
```

## Troubleshooting

```bash
# Puerto 5432 ocupado
lsof -i :5432          # Mac/Linux
netstat -ano | findstr :5432  # Windows

# Resetear migraciones (borra todos los datos)
cd backend && npx prisma migrate reset

# Reinstalar node_modules
rm -rf node_modules && npm install

# Regenerar Prisma Client tras cambios en schema
npm run prisma:generate

# Ver logs del contenedor backend
docker logs nutrabitics_backend -f

# JWT secrets — generar valor seguro
openssl rand -base64 32
```