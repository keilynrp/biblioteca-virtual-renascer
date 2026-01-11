#!/bin/bash

echo "🔍 Verificando usuarios en el backend..."
echo ""

# Copiar el script Python al contenedor y ejecutarlo
sudo docker-compose exec -T backend python manage.py shell < check_user.py

echo ""
echo "✅ Verificación completa"
echo ""
echo "Para probar la autenticación, ejecuta:"
echo "  ./probar-autenticacion.sh"
echo ""
