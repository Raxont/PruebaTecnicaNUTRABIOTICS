# 🛠️ Comandos Útiles - NUTRABITICS Backend

Referencia rápida de comandos frecuentes.

---

## 🚀 Inicio & Desarrollo

```bash
# Ir a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (hot reload)
npm run start:dev

# Ejecutar en modo debug
npm run start:debug

# Build para producción
npm run build

# Ejecutar versión producción
npm run start:prod
```

---

## 🐳 Docker

```bash
# Iniciar servicios (PostgreSQL + Backend)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Resetear volúmenes (cuidado: borra datos)
docker-compose down -v

# Conectarse a la BD desde Docker
docker exec -it nutrabitics_db psql -U nutrabitics_user -d nutrabitics_db
```

---

## 🗄️ Prisma & Base de Datos

```bash
cd backend

# Generar Prisma Client (después de instalar)
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Resetear BD (cuidado: borra todo)
npx prisma migrate reset

# Abrir Prisma Studio (UI para la BD)
npm run prisma:studio

# Ver estado de las migraciones
npx prisma migrate status

# Crear nueva migración
npx prisma migrate dev --name nombre_migracion
```

---

## 📊 PostgreSQL

```bash
# Conectarse a la BD (local)
psql -U nutrabitics_user -d nutrabitics_db -h localhost

# Conectarse a la BD (Docker)
docker exec -it nutrabitics_db psql -U nutrabitics_user -d nutrabitics_db

# Queries útiles

# Ver todos los usuarios
SELECT * FROM "User";

# Ver prescripciones pendientes
SELECT * FROM "Prescription" WHERE status = 'PENDING';

# Contar prescripciones por estado
SELECT status, COUNT(*) FROM "Prescription" GROUP BY status;

# Ver prescripciones de un paciente
SELECT * FROM "Prescription" WHERE "patientId" = 'patient-id-xxx';

# Ver items de una prescripción
SELECT * FROM "PrescriptionItem" WHERE "prescriptionId" = 'rx-id-xxx';

# Cambiar rol de un usuario
UPDATE "User" SET role = 'ADMIN' WHERE email = 'user@example.com';

# Eliminar usuario (y sus datos relacionados)
DELETE FROM "User" WHERE id = 'user-id-xxx';

# Ver relaciones (Foreign Keys)
\d "Prescription"
```

---

## 🧪 Testing

```bash
cd backend

# Ejecutar tests unitarios
npm run test

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch

# Tests E2E
npm run test:e2e

# Tests debugging
npm run test:debug
```

---

## 📝 Calidad de Código

```bash
cd backend

# Linting
npm run lint

# Fix linting issues
npm run lint -- --fix

# Code formatting
npm run format

# Check formatting
npx prettier --check .
```

---

## 🔍 Debugging

```bash
# Ejecutar con debugger
npm run start:debug

# Abrir en Chrome
chrome://inspect

# Logs personalizados en consola
console.log('Debug message:', data);

# Prettier debug
npx prettier --debug-check .
```

---

## 🌐 REST API Testing

```bash
# Test con CURL

# 1. Sign up
curl -X POST http://localhost:3001/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","firstName":"John","lastName":"Doe"}'

# 2. Sign in
curl -X POST http://localhost:3001/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# 3. Ver usuarios (requiere token)
curl -X GET http://localhost:3001/users \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Health check (sin auth)
curl http://localhost:3001

# Guardar token en variable
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Usar en requests
curl -X GET http://localhost:3001/admin/metrics \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📁 Gestión de Archivos

```bash
# Crear .env desde template
cp backend/.env.example backend/.env

# Ver contenido de .env (sin mostrar valores sensibles)
cat backend/.env | grep -v "SECRET"

# Listar archivos importantes
ls -la backend/src/
ls -la backend/prisma/

# Buscar en el código
grep -r "TODO" backend/
grep -r "console.log" backend/
```

---

## 🔒 Seguridad

```bash
# Generar JWT secrets seguros
openssl rand -base64 32

# Verificar vulnerabilidades en dependencias
npm audit

# Fix vulnerabilidades automáticamente
npm audit fix

# Check de seguridad
npm audit --audit-level=moderate
```

---

## 📦 Dependencias

```bash
cd backend

# Listar dependencias instaladas
npm list

# Actualizar dependencias
npm update

# Ver dependencias desactualizadas
npm outdated

# Mostrar espacio usado por node_modules
du -sh node_modules/

# Reinstalar node_modules
npm ci
```

---

## 🧹 Limpieza

```bash
cd backend

# Limpiar archivos compilados
npm run prebuild

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de npm
npm cache clean --force

# Eliminar archivos temporales
rm -rf dist/
rm -rf .eslintcache
```

---

## 🐛 Troubleshooting

```bash
# Puerto ocupado (6432 es PostgreSQL)
# Windows
netstat -ano | findstr :5432

# Mac/Linux
lsof -i :5432

# Matar proceso en puerto
# Windows
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>

# Restart Docker
docker restart nutrabitics_db

# Ver logs del contenedor
docker logs nutrabitics_backend -f
```

---

## 📊 Monitoreo

```bash
# Ver procesos corriendo
npm ps

# Monitor de recursos
npm top

# Ver requests en tiempo real
npm run start:debug

# Performance profiling
node --prof app.ts
node --prof-process isolate-*.log > profile.txt
```

---

## 🚀 Deployment

```bash
# Build de producción
npm run build

# Verificar build
ls -la dist/

# Ejecutar build
npm run start:prod

# Con PM2 (opcional)
npm install -g pm2
pm2 start dist/main.js --name "nutrabitics-backend"
pm2 logs nutrabitics-backend
```

---

## 📝 Checklist Diario

- [ ] `npm run start:dev` - Backend corriendo
- [ ] `docker-compose up -d` - BD corriendo
- [ ] `npm run lint` - Sin errores de linting
- [ ] `npm run test` - Tests pasando
- [ ] Variables .env correctas
- [ ] No hay console.log en código
- [ ] Cambios commiteados

---

## 🆘 Comandos de Emergencia

```bash
# Resetear todo
cd backend
rm -rf node_modules dist .eslintcache
npm install
npm run build

# Resetear BD
docker-compose down -v
docker-compose up -d

# Full reset
docker-compose down -v
rm -rf backend/node_modules
docker-compose up -d
cd backend
npm install
npm run prisma:migrate
```

---

## 📚 Recursos Rápidos

- [NestJS CLI](https://docs.nestjs.com/cli/overview)
- [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference)
- [npm scripts](https://docs.npmjs.com/cli/v9/using-npm/run-script)
- [Docker Compose](https://docs.docker.com/compose/reference/)

