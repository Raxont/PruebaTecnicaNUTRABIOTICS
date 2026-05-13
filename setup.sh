#!/bin/bash

# Setup script for NUTRABITICS Backend
# Este script prepara el ambiente para ejecutar la aplicación

echo ""
echo "================================"
echo "NUTRABITICS Backend Setup"
echo "================================"
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+"
    exit 1
fi

echo "✅ Node.js detectado"
node --version

# Verificar si Docker está instalado (opcional)
if command -v docker &> /dev/null; then
    echo "✅ Docker detectado"
    docker --version
else
    echo "⚠️  Docker no detectado. Necesitarás PostgreSQL instalado localmente."
fi

echo ""
echo "Instalando dependencias del backend..."
cd backend || exit
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias"
    exit 1
fi

echo "✅ Dependencias instaladas"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo ""
    echo "Creando archivo .env..."
    cp .env.example .env
    echo "⚠️  Edita backend/.env con tus variables de entorno"
fi

echo ""
echo "================================"
echo "✅ Setup completado!"
echo "================================"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Edita backend/.env con tus configuraciones"
echo ""
echo "2. Si usas Docker (recomendado):"
echo "   - cd .."
echo "   - docker-compose up -d"
echo ""
echo "3. Si ejecutas localmente:"
echo "   - Asegúrate de tener PostgreSQL corriendo"
echo "   - npm run prisma:migrate"
echo "   - npm run start:dev"
echo ""
echo "4. Accede a:"
echo "   - API: http://localhost:3001"
echo "   - Docs: http://localhost:3001/api"
echo ""
