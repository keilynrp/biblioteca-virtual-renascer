#!/bin/bash

echo "=========================================="
echo "🔗 VERIFICACIÓN DE INTEGRACIÓN BACKEND-FRONTEND"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

total_tests=0
passed_tests=0
failed_tests=0

check_test() {
    local test_name=$1
    local test_result=$2
    total_tests=$((total_tests + 1))

    if [ "$test_result" == "0" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
        passed_tests=$((passed_tests + 1))
        return 0
    else
        echo -e "${RED}❌ $test_name${NC}"
        failed_tests=$((failed_tests + 1))
        return 1
    fi
}

echo "=========================================="
echo "1️⃣  VERIFICACIÓN DE SERVICIOS"
echo "=========================================="
echo ""

# Verificar que todos los servicios estén corriendo
echo "Verificando estado de contenedores..."
services_status=$(sudo docker-compose ps --quiet backend frontend db redis elasticsearch 2>/dev/null | wc -l)
if [ "$services_status" -ge 5 ]; then
    check_test "Todos los servicios están corriendo" 0
else
    check_test "Todos los servicios están corriendo" 1
    echo -e "${YELLOW}  Algunos servicios no están activos. Ejecuta: sudo docker-compose ps${NC}"
fi

echo ""
echo "=========================================="
echo "2️⃣  VERIFICACIÓN DE CONECTIVIDAD"
echo "=========================================="
echo ""

# Backend
echo "Probando Backend (http://localhost:8000)..."
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/admin/ 2>/dev/null)
if [ "$backend_status" == "302" ] || [ "$backend_status" == "200" ]; then
    check_test "Backend responde (HTTP $backend_status)" 0
else
    check_test "Backend responde" 1
    echo -e "${YELLOW}  Status: $backend_status${NC}"
fi

# Frontend
echo "Probando Frontend (http://localhost:3000)..."
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$frontend_status" == "200" ]; then
    check_test "Frontend responde (HTTP $frontend_status)" 0
else
    check_test "Frontend responde" 1
    echo -e "${YELLOW}  Status: $frontend_status${NC}"
fi

# PostgreSQL
echo "Probando PostgreSQL..."
pg_status=$(sudo docker-compose exec -T db pg_isready -U postgres 2>/dev/null | grep -q "accepting" && echo "0" || echo "1")
check_test "PostgreSQL está aceptando conexiones" $pg_status

# Redis
echo "Probando Redis..."
redis_status=$(sudo docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q "PONG" && echo "0" || echo "1")
check_test "Redis responde PONG" $redis_status

# Elasticsearch
echo "Probando Elasticsearch..."
es_response=$(curl -s http://localhost:9200 2>/dev/null | grep -q "cluster_name" && echo "0" || echo "1")
check_test "Elasticsearch responde" $es_response

echo ""
echo "=========================================="
echo "3️⃣  VERIFICACIÓN DE CONFIGURACIÓN"
echo "=========================================="
echo ""

# Verificar .env del frontend
echo "Verificando configuración del frontend..."
if [ -f "frontend/.env.local" ]; then
    api_url=$(grep NEXT_PUBLIC_API_URL frontend/.env.local | cut -d'=' -f2)
    if [ "$api_url" == "http://localhost:8000/api" ]; then
        check_test "URL del API configurada correctamente" 0
        echo -e "${BLUE}  → API URL: $api_url${NC}"
    else
        check_test "URL del API configurada correctamente" 1
        echo -e "${YELLOW}  → API URL actual: $api_url${NC}"
        echo -e "${YELLOW}  → Debería ser: http://localhost:8000/api${NC}"
    fi
else
    check_test "Archivo .env.local existe" 1
    echo -e "${YELLOW}  → Crea frontend/.env.local con NEXT_PUBLIC_API_URL${NC}"
fi

# Verificar CORS en backend
echo ""
echo "Verificando configuración CORS..."
cors_config=$(grep CORS_ALLOWED_ORIGINS backend/.env 2>/dev/null | grep -q "localhost:3000" && echo "0" || echo "1")
check_test "CORS permite localhost:3000" $cors_config

echo ""
echo "=========================================="
echo "4️⃣  VERIFICACIÓN DE ENDPOINTS API"
echo "=========================================="
echo ""

# Probar endpoint de autenticación
echo "Probando endpoint /api/auth/..."
auth_endpoint=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/auth/ 2>/dev/null)
if [ "$auth_endpoint" == "200" ] || [ "$auth_endpoint" == "404" ]; then
    echo -e "${BLUE}  → /api/auth/ responde con HTTP $auth_endpoint${NC}"
else
    echo -e "${YELLOW}  → /api/auth/ responde con HTTP $auth_endpoint${NC}"
fi

# Probar login endpoint
echo "Probando endpoint /api/auth/login/..."
login_test=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}' \
    -w "\n%{http_code}" 2>/dev/null)

login_status=$(echo "$login_test" | tail -n 1)
login_body=$(echo "$login_test" | head -n -1)

if [ "$login_status" == "400" ] || [ "$login_status" == "401" ]; then
    check_test "Endpoint de login está disponible" 0
    echo -e "${BLUE}  → Login endpoint funcional (HTTP $login_status)${NC}"
else
    check_test "Endpoint de login está disponible" 1
    echo -e "${YELLOW}  → HTTP $login_status${NC}"
fi

# Verificar otros endpoints importantes
echo ""
echo "Verificando endpoints adicionales..."
for endpoint in "/api/" "/api/content/" "/api/content/books/" "/api/users/"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000$endpoint" 2>/dev/null)
    if [ "$status" == "200" ] || [ "$status" == "401" ] || [ "$status" == "403" ]; then
        echo -e "${GREEN}  ✅ $endpoint → HTTP $status${NC}"
    elif [ "$status" == "404" ]; then
        echo -e "${YELLOW}  ⚠️  $endpoint → HTTP 404 (no existe)${NC}"
    else
        echo -e "${RED}  ❌ $endpoint → HTTP $status${NC}"
    fi
done

echo ""
echo "=========================================="
echo "5️⃣  PRUEBA DE AUTENTICACIÓN END-TO-END"
echo "=========================================="
echo ""

# Verificar que existe un usuario
user_exists=$(sudo docker-compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
print('1' if User.objects.filter(username='admin').exists() else '0')
" 2>/dev/null | tail -n 1 | tr -d '[:space:]')

if [ "$user_exists" == "1" ]; then
    check_test "Usuario 'admin' existe en la BD" 0

    # Probar login con credenciales reales
    echo ""
    echo "Probando autenticación con usuario admin..."

    auth_response=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
        -H "Content-Type: application/json" \
        -d '{"username":"admin","password":"admin123456"}' 2>/dev/null)

    if echo "$auth_response" | grep -q "access"; then
        check_test "Login exitoso con credenciales válidas" 0

        # Extraer token
        access_token=$(echo "$auth_response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access', ''))" 2>/dev/null)

        if [ ! -z "$access_token" ]; then
            echo -e "${GREEN}  → Access token obtenido: ${access_token:0:30}...${NC}"

            # Probar endpoint autenticado
            echo ""
            echo "Probando endpoint autenticado con token..."
            protected_response=$(curl -s -o /dev/null -w "%{http_code}" \
                http://localhost:8000/api/users/me/ \
                -H "Authorization: Bearer $access_token" 2>/dev/null)

            if [ "$protected_response" == "200" ]; then
                check_test "Acceso a endpoint protegido con token" 0
            else
                check_test "Acceso a endpoint protegido con token" 1
                echo -e "${YELLOW}  → HTTP $protected_response${NC}"
            fi
        fi
    else
        check_test "Login exitoso con credenciales válidas" 1
        echo -e "${YELLOW}  → Respuesta: $auth_response${NC}"
    fi
else
    check_test "Usuario 'admin' existe en la BD" 1
    echo -e "${YELLOW}  → Crea un usuario con: ./crear-usuario-automatico.sh${NC}"
fi

echo ""
echo "=========================================="
echo "6️⃣  VERIFICACIÓN DE LOGS"
echo "=========================================="
echo ""

echo "Últimos 10 logs del backend:"
echo "----------------------------------------"
sudo docker-compose logs --tail=10 backend 2>/dev/null | grep -v "GET /static" || echo "No hay logs recientes"

echo ""
echo "Últimos 10 logs del frontend:"
echo "----------------------------------------"
sudo docker-compose logs --tail=10 frontend 2>/dev/null | tail -10 || echo "No hay logs recientes"

echo ""
echo "=========================================="
echo "📊 RESUMEN DE RESULTADOS"
echo "=========================================="
echo ""

percentage=$((passed_tests * 100 / total_tests))

echo "Total de pruebas:     $total_tests"
echo -e "${GREEN}Pruebas exitosas:     $passed_tests${NC}"
echo -e "${RED}Pruebas fallidas:     $failed_tests${NC}"
echo "Porcentaje de éxito:  $percentage%"

echo ""

if [ $failed_tests -eq 0 ]; then
    echo "=========================================="
    echo -e "${GREEN}🎉 ¡INTEGRACIÓN COMPLETA Y FUNCIONAL!${NC}"
    echo "=========================================="
    echo ""
    echo "✅ Todos los componentes están integrados correctamente"
    echo ""
    echo "🌐 Accesos disponibles:"
    echo "  → Frontend:      http://localhost:3000"
    echo "  → Django Admin:  http://localhost:8000/admin/"
    echo "  → API Backend:   http://localhost:8000/api/"
    echo ""
    echo "🔑 Credenciales:"
    echo "  → Username: admin"
    echo "  → Password: admin123456"
else
    echo "=========================================="
    echo -e "${YELLOW}⚠️  ALGUNOS PROBLEMAS DETECTADOS${NC}"
    echo "=========================================="
    echo ""
    echo "Revisa los errores marcados con ❌ arriba"
    echo ""
    echo "Comandos útiles para diagnóstico:"
    echo "  → Ver logs backend:  sudo docker-compose logs backend"
    echo "  → Ver logs frontend: sudo docker-compose logs frontend"
    echo "  → Estado servicios:  sudo docker-compose ps"
    echo "  → Reiniciar todo:    sudo docker-compose restart"
fi

echo ""
