@echo off
REM Setup script for NUTRABITICS Backend
REM Este script prepara el ambiente para ejecutar la aplicación

echo.
echo ================================
echo NUTRABITICS Backend Setup
echo ================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js 18+
    pause
    exit /b 1
)

echo ✅ Node.js detectado
node --version

REM Verificar si Docker está instalado (opcional)
where docker >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Docker detectado
    docker --version
) else (
    echo ⚠️  Docker no detectado. Necesitarás PostgreSQL instalado localmente.
)

echo.
echo Instalando dependencias del backend...
cd backend
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas

REM Crear archivo .env si no existe
if not exist .env (
    echo.
    echo Creando archivo .env...
    copy .env.example .env
    echo ⚠️  Edita backend\.env con tus variables de entorno
)

echo.
echo ================================
echo ✅ Setup completado!
echo ================================
echo.
echo Próximos pasos:
echo.
echo 1. Edita backend\.env con tus configuraciones
echo.
echo 2. Si usas Docker (recomendado):
echo    - cd ..
echo    - docker-compose up -d
echo.
echo 3. Si ejecutas localmente:
echo    - Asegúrate de tener PostgreSQL corriendo
echo    - npm run prisma:migrate
echo    - npm run start:dev
echo.
echo 4. Accede a:
echo    - API: http://localhost:3001
echo    - Docs: http://localhost:3001/docs
echo.
pause
