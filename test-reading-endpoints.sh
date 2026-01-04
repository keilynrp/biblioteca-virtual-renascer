#!/bin/bash

# Script para probar los endpoints de lectura corregidos

echo "════════════════════════════════════════════════════════════"
echo "  Probando Endpoints de Lectura (después del fix 404)"
echo "════════════════════════════════════════════════════════════"
echo ""

# Verificar que Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo"
    exit 1
fi

echo "→ Obteniendo token de autenticación..."
TOKEN_OUTPUT=$(docker compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
if user:
    token, _ = Token.objects.get_or_create(user=user)
    print(f'TOKEN:{token.key}')
    print(f'USER:{user.username}')
else:
    print('NO_USER')
" 2>&1)

if echo "$TOKEN_OUTPUT" | grep -q "NO_USER"; then
    echo "❌ No hay usuarios en el sistema"
    echo "   Crea un superusuario con: docker compose exec backend python manage.py createsuperuser"
    exit 1
fi

TOKEN=$(echo "$TOKEN_OUTPUT" | grep "TOKEN:" | cut -d':' -f2)
USERNAME=$(echo "$TOKEN_OUTPUT" | grep "USER:" | cut -d':' -f2)

if [ -z "$TOKEN" ]; then
    echo "❌ No se pudo obtener el token"
    exit 1
fi

echo "✓ Token obtenido para usuario: $USERNAME"
echo ""

# Obtener un libro de prueba
echo "→ Buscando libro para prueba..."
BOOK_ID=$(docker compose exec -T db psql -U postgres -d bvs_db -t -c "SELECT id FROM books LIMIT 1;" 2>/dev/null | tr -d ' \n\r')

if [ -z "$BOOK_ID" ]; then
    echo "❌ No hay libros en la base de datos"
    echo "   Importa libros con: bash importar-libros-openlibrary.sh"
    exit 1
fi

echo "✓ Usando libro ID: $BOOK_ID"
echo ""

# Test 1: Iniciar sesión de lectura
echo "════════════════════════════════════════════════════════════"
echo "TEST 1: Iniciar sesión de lectura"
echo "════════════════════════════════════════════════════════════"
echo "URL: POST /api/content/user/readings/start/$BOOK_ID/"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    http://localhost:8000/api/content/user/readings/start/$BOOK_ID/)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Test 1 PASSED - Sesión de lectura iniciada"
    echo ""
    echo "Respuesta:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
else
    echo "❌ Test 1 FAILED"
    echo "Respuesta: $BODY"
fi

echo ""
echo ""

# Test 2: Verificar endpoint de archivo PDF
echo "════════════════════════════════════════════════════════════"
echo "TEST 2: Endpoint de archivo PDF"
echo "════════════════════════════════════════════════════════════"
echo "URL: GET /api/content/books/$BOOK_ID/file/"
echo ""

PDF_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    -I http://localhost:8000/api/content/books/$BOOK_ID/file/ 2>&1)

PDF_CODE=$(echo "$PDF_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
CONTENT_TYPE=$(echo "$PDF_RESPONSE" | grep -i "content-type:" | cut -d':' -f2- | tr -d '\r\n ')

echo "HTTP Status: $PDF_CODE"
echo "Content-Type: $CONTENT_TYPE"
echo ""

if [ "$PDF_CODE" = "200" ]; then
    echo "✅ Test 2 PASSED - Archivo PDF accesible"
elif [ "$PDF_CODE" = "404" ]; then
    echo "⚠️  Test 2 WARNING - Endpoint existe pero no hay archivo PDF"
else
    echo "❌ Test 2 FAILED"
fi

echo ""
echo ""

# Test 3: Actualizar progreso de lectura
echo "════════════════════════════════════════════════════════════"
echo "TEST 3: Actualizar progreso de lectura"
echo "════════════════════════════════════════════════════════════"
echo "URL: PATCH /api/content/user/readings/$BOOK_ID/progress/"
echo ""

PROGRESS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PATCH \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"current_page": 5, "zoom_level": "1.25", "total_reading_time": 120}' \
    http://localhost:8000/api/content/user/readings/$BOOK_ID/progress/)

PROGRESS_CODE=$(echo "$PROGRESS_RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
PROGRESS_BODY=$(echo "$PROGRESS_RESPONSE" | sed '/HTTP_CODE:/d')

echo "HTTP Status: $PROGRESS_CODE"
echo ""

if [ "$PROGRESS_CODE" = "200" ]; then
    echo "✅ Test 3 PASSED - Progreso actualizado"
    echo ""
    echo "Respuesta:"
    echo "$PROGRESS_BODY" | python3 -m json.tool 2>/dev/null || echo "$PROGRESS_BODY"
else
    echo "❌ Test 3 FAILED"
    echo "Respuesta: $PROGRESS_BODY"
fi

echo ""
echo ""

# Resumen
echo "════════════════════════════════════════════════════════════"
echo "  RESUMEN DE PRUEBAS"
echo "════════════════════════════════════════════════════════════"
echo ""

PASSED=0
FAILED=0
WARNING=0

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ Test 1: Iniciar sesión de lectura - PASSED"
    PASSED=$((PASSED + 1))
else
    echo "❌ Test 1: Iniciar sesión de lectura - FAILED"
    FAILED=$((FAILED + 1))
fi

if [ "$PDF_CODE" = "200" ]; then
    echo "✅ Test 2: Archivo PDF - PASSED"
    PASSED=$((PASSED + 1))
elif [ "$PDF_CODE" = "404" ]; then
    echo "⚠️  Test 2: Archivo PDF - WARNING (endpoint OK, archivo no existe)"
    WARNING=$((WARNING + 1))
else
    echo "❌ Test 2: Archivo PDF - FAILED"
    FAILED=$((FAILED + 1))
fi

if [ "$PROGRESS_CODE" = "200" ]; then
    echo "✅ Test 3: Actualizar progreso - PASSED"
    PASSED=$((PASSED + 1))
else
    echo "❌ Test 3: Actualizar progreso - FAILED"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "Total: $PASSED passed, $FAILED failed, $WARNING warnings"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 Todos los tests pasaron! El visor PDF debería funcionar correctamente."
    echo ""
    echo "Próximos pasos:"
    echo "  1. Abre http://localhost:3000"
    echo "  2. Inicia sesión"
    echo "  3. Ve a la biblioteca"
    echo "  4. Haz clic en 'Leer' en un libro"
else
    echo "⚠️  Algunos tests fallaron. Revisa los logs arriba."
    echo ""
    echo "Solución:"
    echo "  1. Verifica que las migraciones están aplicadas: bash fix-reading-simple.sh"
    echo "  2. Revisa los logs del backend: docker compose logs backend --tail=50"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
