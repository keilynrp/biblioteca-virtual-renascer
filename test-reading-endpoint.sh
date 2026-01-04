#!/bin/bash

echo "========================================"
echo "Testing Reading Endpoint"
echo "========================================"
echo ""

echo "Paso 1: Verificando si la tabla Reading existe..."
docker compose exec -T backend python manage.py shell -c "
from apps.content.models import Reading
print(f'Tabla Reading existe: {Reading._meta.db_table}')
"

echo ""
echo "Paso 2: Verificando estado de migraciones..."
docker compose exec -T backend python manage.py showmigrations content

echo ""
echo "Paso 3: Verificando si hay migraciones pendientes..."
docker compose exec -T backend python manage.py migrate --plan

echo ""
echo "Paso 4: Obteniendo token de admin y probando endpoint..."
echo "Creando token de prueba..."
docker compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
User = get_user_model()
user = User.objects.filter(is_superuser=True).first()
if user:
    token, _ = Token.objects.get_or_create(user=user)
    print(f'Token: {token.key}')
    print(f'Usuario: {user.username}')
else:
    print('No se encontró usuario administrador')
"

echo ""
echo "========================================"
echo "PRÓXIMOS PASOS:"
echo "1. Copia el token de arriba"
echo "2. Prueba el endpoint con:"
echo "   curl -X POST http://localhost:8000/api/user/readings/start/1/ \\"
echo "        -H \"Authorization: Bearer TU_TOKEN_AQUI\" \\"
echo "        -H \"Content-Type: application/json\""
echo "========================================"
