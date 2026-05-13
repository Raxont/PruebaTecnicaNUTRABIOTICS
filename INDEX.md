# 📚 NUTRABITICS Backend - Índice de Documentación

Bienvenido al backend de NUTRABITICS. Aquí encontrarás toda la información necesaria para entender, ejecutar y mantener la aplicación.

---

## 🚀 Inicio Rápido

**Quieres empezar ya?** Comienza aquí:

1. [README.md](README.md) - Guía principal
2. [setup.sh](setup.sh) ó [setup.bat](setup.bat) - Script de instalación automática
3. [TESTING.md](TESTING.md) - Cómo probar la API

---

## 📖 Documentación Principal

### 📄 [README.md](README.md)
Documentación completa del proyecto con:
- Stack tecnológico
- Instalación (Docker y local)
- Variables de entorno
- Endpoints API por rol
- Estructura de datos
- Troubleshooting

**Leer cuando:** Necesites información general del proyecto

---

### 📄 [API_REFERENCE.md](API_REFERENCE.md)
Referencia rápida de endpoints:
- Flujo de la aplicación
- Componentes de seguridad
- Modelos de datos
- Endpoints por rol
- Ejemplos de flujos
- Códigos de error

**Leer cuando:** Necesites ver rápidamente un endpoint o ejemplo

---

### 📄 [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
Checklist completo de implementación:
- Qué se ha implementado
- Qué NO se ha implementado
- Próximos pasos sugeridos
- Módulos y sus archivos

**Leer cuando:** Necesites verificar qué está hecho

---

### 📄 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
Estructura y organización del proyecto:
- Árbol de carpetas
- Qué hay en cada carpeta
- Flujos de datos
- Dependencias principales
- Resumen de endpoints

**Leer cuando:** Necesites entender la organización del código

---

## 🛠️ Guías Prácticas

### 🧪 [TESTING.md](TESTING.md)
**Cómo probar la API con ejemplos paso a paso:**
- Autenticación
- Crear usuarios
- Crear prescripciones
- Ver métricas
- Pruebas de error
- Con Postman

**Usar cuando:** Quieras testear la API o verificar que funciona

---

### 📋 [SETUP.md](SETUP.md)
**Guía de configuración inicial:**
- Requisitos
- Roles y funcionalidades
- Flujo mínimo
- Estados
- Checklist de implementación

**Usar cuando:** Necesites revisar qué se pidió vs qué se hizo

---

### ⌨️ [COMMANDS.md](COMMANDS.md)
**Referencia rápida de comandos:**
- Inicio y desarrollo
- Docker
- Prisma y BD
- Testing
- Debugging
- REST API testing
- Troubleshooting

**Usar cuando:** Necesites un comando específico

---

## 🔧 Configuración

### `.env` - Variables de Entorno
```bash
DATABASE_URL="..."           # Conexión a PostgreSQL
JWT_ACCESS_SECRET="..."      # Secret para access token
JWT_REFRESH_SECRET="..."     # Secret para refresh token
JWT_ACCESS_TTL=900           # 15 minutos
JWT_REFRESH_TTL=604800       # 7 días
APP_ORIGIN="http://localhost:3000"
PORT=3001
```

**Copiar desde:** `backend/.env.example`

---

### `docker-compose.yml` - Orquestación
Define los servicios:
- **postgres**: BD PostgreSQL 16
- **adminer**: UI para la BD (http://localhost:8080)
- **backend**: API NestJS

```bash
docker-compose up -d      # Iniciar
docker-compose down        # Parar
docker-compose logs -f    # Ver logs
```

---

## 📚 Guías por Rol

### 👤 **Para Desarrolladores Backend**

1. Lee [README.md](README.md) - Entender el proyecto
2. Lee [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Entender la estructura
3. Lee [COMMANDS.md](COMMANDS.md) - Comandos útiles
4. Ejecuta [setup.sh](setup.sh) o [setup.bat](setup.bat) - Instalación
5. Comienza con `npm run start:dev`

**Recursos:**
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)

---

### 👨‍⚕️ **Para Médicos (Testers)**

1. Lee [API_REFERENCE.md](API_REFERENCE.md) - Ver endpoints disponibles
2. Lee [TESTING.md](TESTING.md) - Ejemplos de uso
3. Instala Postman o usa cURL
4. Sigue los pasos en "Paso 5: Crear Prescripción"

**Flujo rápido:**
```
1. Registrarse como paciente
2. Admin crea médico
3. Médico crea prescripción
4. Paciente ve prescripción
5. Paciente marca como consumida
```

---

### 👤 **Para Pacientes (Testers)**

1. Lee [TESTING.md](TESTING.md) - Ver cómo registrarse
2. Registrate con `POST /auth/sign-up`
3. Mira [API_REFERENCE.md](API_REFERENCE.md) - "Paso 6: Ver mis prescripciones"
4. Usa curl o Postman

**Flujo rápido:**
```
1. Sign up
2. Sign in
3. Ver mis prescripciones
4. Cambiar estado a "consumed"
```

---

### 👨‍💼 **Para Admins**

1. Lee [API_REFERENCE.md](API_REFERENCE.md) - Ver endpoints admin
2. Lee [TESTING.md](TESTING.md) - "Paso 9: Ver Métricas"
3. Usa el endpoint `GET /admin/metrics`

**Funcionalidades:**
- Crear usuarios
- Asignar roles
- Ver métricas
- Ver prescripciones por estado

---

## 🏗️ Módulos y Responsabilidades

| Módulo | Archivo | Responsabilidad |
|--------|---------|-----------------|
| **Auth** | `auth/` | Autenticación y JWT |
| **Users** | `users/` | CRUD de usuarios |
| **Doctors** | `doctors/` | Perfil de médicos |
| **Patients** | `patients/` | Perfil de pacientes |
| **Prescriptions** | `prescriptions/` | Crear y gestionar Rx |
| **Admin** | `admin/` | Métricas y reportes |
| **Prisma** | `prisma/` | Conexión a BD |
| **Common** | `common/` | Utilidades compartidas |

---

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT con expiración
- ✅ Role-based access control
- ✅ Validación global de DTOs
- ✅ Exception handling
- ✅ CORS configurado

Para más detalles: [README.md](README.md) → "Seguridad"

---

## 🪵 Árbol de Carpetas

```
backend/
├── main.ts                    # Entry point
├── app.module.ts              # Root module
├── auth/                      # Autenticación
├── users/                     # Usuarios
├── doctors/                   # Médicos
├── patients/                  # Pacientes
├── prescriptions/             # Prescripciones
├── admin/                     # Métricas
├── prisma/                    # Base de datos
└── common/                    # Utilidades
    ├── filters/               # Exception filters
    ├── guards/                # Authorization guards
    ├── interceptors/          # Logging interceptors
    ├── middlewares/           # Custom middlewares
    └── pipes/                 # Validation pipes
```

Más detalles: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

---

## 📊 Flujo de Datos

```
Paciente              Médico                Admin
   │                   │                      │
   ├─→ Sign Up        │                      │
   │     ↓            │                      │
   ├─→ Login          │                      │
   │                  │                      │
   │                  ├─→ Login              │
   │                  │                      │
   │                  ├─→ Create Rx          │
   │                  │     ↓                │
   ├─→ View Rx ←─────┘     ↓                │
   │                  ├─→ View my Rx        │
   │                  │                      │
   ├─→ Change Status                        │
   │                                        │
   │                                        ├─→ View Metrics
   │                                        │
   │                                        ├─→ Create Users
   │                                        │
   │                                        ├─→ Assign Roles
```

---

## 🆘 Necesito Ayuda

### Problema: X no funciona

1. Revisa [COMMANDS.md](COMMANDS.md) → "Troubleshooting"
2. Revisa [README.md](README.md) → "Troubleshooting"
3. Revisa logs: `docker-compose logs -f`
4. Ejecuta: `npm run start:dev` para ver errores

### Problema: ¿Cómo hago Y?

1. Revisa [API_REFERENCE.md](API_REFERENCE.md)
2. Revisa [TESTING.md](TESTING.md) con ejemplos
3. Revisa el código en `backend/src/`

### Problema: Quiero agregar feature Z

1. Revisa [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
2. Sigue el patrón NestJS
3. Crea servicio + controller + module
4. Agrega a `app.module.ts`

---

## ✅ Checklist de Verificación

- [ ] Leo [README.md](README.md)
- [ ] Ejecuto setup (`setup.sh` o `setup.bat`)
- [ ] El backend está corriendo (`npm run start:dev`)
- [ ] La BD está corriendo (PostgreSQL)
- [ ] Puedo hacer un login exitoso
- [ ] Puedo crear una prescripción
- [ ] Puedo ver las métricas

Si todo ✅, ¡estás listo para usar la API!

---

## 📞 Recursos Útiles

- **NestJS**: https://docs.nestjs.com
- **Prisma**: https://www.prisma.io/docs
- **JWT**: https://jwt.io
- **PostgreSQL**: https://www.postgresql.org/docs
- **Docker**: https://docs.docker.com

---

## 🎯 Resumen Visual

```
📖 Documentación
├── 🚀 Quiero usar la API
│   ├── README.md
│   └── TESTING.md
│
├── 🛠️ Quiero desarrollar
│   ├── PROJECT_STRUCTURE.md
│   ├── COMMANDS.md
│   └── Código en backend/
│
├── 🔍 Quiero referencia rápida
│   ├── API_REFERENCE.md
│   └── COMMANDS.md
│
└── ⚙️ Quiero configurar
    ├── SETUP.md
    └── .env
```

---

## 🎉 ¡Listo!

Selecciona el documento que necesites según lo que quieras hacer:

- **Empezar**: [README.md](README.md)
- **Entender estructura**: [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
- **Ver endpoints**: [API_REFERENCE.md](API_REFERENCE.md)
- **Probar API**: [TESTING.md](TESTING.md)
- **Comandos**: [COMMANDS.md](COMMANDS.md)
- **Checklist**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

**Última actualización:** Enero 2024
**Estado:** ✅ Completamente implementado y documentado
