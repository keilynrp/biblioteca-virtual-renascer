#!/bin/bash

echo "=========================================="
echo "🔍 VERIFICACIÓN DE USUARIOS"
echo "=========================================="
echo ""

echo "📊 Listado de todos los usuarios:"
echo "------------------------------------------"
sudo docker-compose exec -T backend python manage.py shell <<'EOF'
from django.contrib.auth import get_user_model

User = get_user_model()

print("\n" + "=" * 60)
print("USUARIOS EN LA BASE DE DATOS")
print("=" * 60)

users = User.objects.all()

if users.count() == 0:
    print("\n⚠️  No hay usuarios registrados en la base de datos")
else:
    print(f"\nTotal de usuarios: {users.count()}\n")

    for user in users:
        print("-" * 60)
        print(f"👤 Username:      {user.username}")
        print(f"📧 Email:         {user.email}")
        print(f"🔐 Superusuario:  {'✅ Sí' if user.is_superuser else '❌ No'}")
        print(f"👔 Staff:         {'✅ Sí' if user.is_staff else '❌ No'}")
        print(f"✔️  Activo:        {'✅ Sí' if user.is_active else '❌ No'}")
        print(f"📅 Fecha creación: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🔑 Último login:  {user.last_login.strftime('%Y-%m-%d %H:%M:%S') if user.last_login else 'Nunca'}")

print("\n" + "=" * 60)

# Contar por tipo
superusers = User.objects.filter(is_superuser=True).count()
staff = User.objects.filter(is_staff=True, is_superuser=False).count()
regular = User.objects.filter(is_staff=False, is_superuser=False).count()

print("\n📈 RESUMEN:")
print(f"   Superusuarios: {superusers}")
print(f"   Staff:         {staff}")
print(f"   Usuarios:      {regular}")
print(f"   TOTAL:         {users.count()}")
print("\n" + "=" * 60)
EOF

echo ""
echo "=========================================="
echo "🌐 INFORMACIÓN DE ACCESO"
echo "=========================================="
echo ""
echo "Django Admin Panel:"
echo "  🔗 http://localhost:8000/admin/"
echo ""
echo "Si creaste el usuario 'admin' con el script:"
echo "  Username: admin"
echo "  Password: admin123456"
echo ""
echo "Frontend:"
echo "  🔗 http://localhost:3000"
echo ""
echo "API Login Endpoint:"
echo "  🔗 POST http://localhost:8000/api/auth/login/"
echo ""
echo "=========================================="
