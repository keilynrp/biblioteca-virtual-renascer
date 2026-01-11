#!/bin/bash

# Script Shell para iniciar servicios del Sprint 6
echo "============================================================"
echo "Iniciando Servicios para Sprint 6 - Lector de Documentos"
echo "============================================================"
echo ""

# Verificar Docker
echo "[Verificando] Docker Desktop..."
if ! command -v docker &> /dev/null; then
    echo "✗ ERROR: Docker no está instalado o no está en el PATH"
    echo "Por favor, instala Docker Desktop y asegúrate de que esté corriendo"
    exit 1
fi

docker_version=$(docker --version)
echo "✓ Docker instalado: $docker_version"
echo ""

# 1. Detener servicios
echo "[1/6] Deteniendo servicios existentes..."
docker compose down 2>/dev/null
echo "✓ Servicios detenidos"
echo ""

# 2. Iniciar DB y Elasticsearch
echo "[2/6] Iniciando PostgreSQL y Elasticsearch..."
docker compose up -d db elasticsearch
echo "Esperando 15 segundos para que la base de datos inicie..."
sleep 15
echo "✓ Base de datos iniciada"
echo ""

# 3. Iniciar Backend
echo "[3/6] Iniciando Backend..."
docker compose up -d backend
echo "Esperando 10 segundos para que el backend inicie..."
sleep 10
echo "✓ Backend iniciado"
echo ""

# 4. Ejecutar migración
echo "[4/6] Ejecutando migración del modelo Reading..."
docker compose exec backend python manage.py migrate
echo "✓ Migración completada"
echo ""

# 5. Verificar tabla
echo "[5/6] Verificando que la tabla Reading existe..."
docker compose exec db psql -U postgres -d biblioteca_virtual -c "\\dt content_reading"
echo ""

# 6. Iniciar Frontend
echo "[6/6] Iniciando Frontend..."
docker compose up -d frontend
echo "Esperando 10 segundos para que el frontend compile..."
sleep 10
echo "✓ Frontend iniciado"
echo ""

# Estado final
echo "============================================================"
echo "Estado de los Servicios"
echo "============================================================"
docker compose ps
echo ""

# Verificar conectividad
echo "============================================================"
echo "Verificando Conectividad"
echo "============================================================"
echo ""

echo "Probando Backend (http://localhost:8000)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/auth/health/ | grep -q "200"; then
    echo "✓ Backend respondiendo correctamente"
else
    echo "✗ Backend no responde aún (esto es normal, puede tomar unos segundos más)"
fi
echo ""

echo "Probando Frontend (http://localhost:3000)..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✓ Frontend respondiendo correctamente"
else
    echo "✗ Frontend no responde aún (esto es normal, puede tomar unos minutos compilar)"
fi
echo ""

# Resumen
echo "============================================================"
echo "✓ Servicios Iniciados Correctamente"
echo "============================================================"
echo ""
echo "Accede a la aplicación:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000/api"
echo "  - Admin Django: http://localhost:8000/admin"
echo ""
echo "Para probar el lector PDF:"
echo "  1. Accede a http://localhost:3000"
echo "  2. Inicia sesión con tu usuario"
echo "  3. Ejecuta: ./obtener-libro-prueba.sh"
echo "  4. Ve a http://localhost:3000/reader/BOOK_ID"
echo ""
echo "Si hay errores, revisa los logs:"
echo "  docker compose logs -f backend"
echo "  docker compose logs -f frontend"
echo ""
