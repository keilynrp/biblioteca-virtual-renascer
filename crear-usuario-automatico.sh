#!/bin/bash

echo "=========================================="
echo "👤 CREANDO SUPERUSUARIO AUTOMÁTICAMENTE"
echo "=========================================="
echo ""

# Crear superusuario con credenciales predeterminadas
sudo docker-compose exec -T backend python manage.py shell <<'EOF'
from django.contrib.auth import get_user_model

User = get_user_model()

# Credenciales
username = 'admin'
email = 'admin@biblioteca.com'
password = 'admin123456'

# Verificar si ya existe
if User.objects.filter(username=username).exists():
    print(f"⚠️  El usuario '{username}' ya existe")
    user = User.objects.get(username=username)
    print(f"\n✅ Información del usuario existente:")
    print(f"   Username: {user.username}")
    print(f"   Email: {user.email}")
    print(f"   Es superusuario: {user.is_superuser}")
    print(f"   Es staff: {user.is_staff}")
    print(f"   Está activo: {user.is_active}")
else:
    # Crear el superusuario
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    print("✅ ¡Superusuario creado exitosamente!\n")
    print("CREDENCIALES:")
    print("=" * 40)
    print(f"Username: {username}")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print("=" * 40)
    print("\n⚠️  IMPORTANTE: Cambia esta contraseña en producción!")

print("\n📊 Resumen de todos los superusuarios:")
print("-" * 40)
superusers = User.objects.filter(is_superuser=True)
for su in superusers:
    print(f"  • {su.username} ({su.email})")
print(f"\nTotal: {superusers.count()} superusuario(s)")
EOF

echo ""
echo "=========================================="
echo "🌐 ACCESO A LA APLICACIÓN"
echo "=========================================="
echo ""
echo "Django Admin Panel:"
echo "  URL: http://localhost:8000/admin/"
echo "  Username: admin"
echo "  Password: admin123456"
echo ""
echo "Frontend (Next.js):"
echo "  URL: http://localhost:3000"
echo ""
echo "API Backend:"
echo "  URL: http://localhost:8000/api/"
echo ""
echo "=========================================="
