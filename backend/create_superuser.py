#!/usr/bin/env python
"""Script para crear superusuario automáticamente"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.authentication.models import User

def create_superuser():
    """Crea un superusuario si no existe"""
    username = 'admin'
    email = 'admin@biblioteca.com'
    password = 'admin123'

    print("=" * 60)
    print("CREACIÓN DE SUPERUSUARIO")
    print("=" * 60)
    print()

    # Verificar usuarios existentes
    total_users = User.objects.count()
    total_superusers = User.objects.filter(is_superuser=True).count()

    print(f"Usuarios totales en el sistema: {total_users}")
    print(f"Superusuarios: {total_superusers}")
    print()

    # Verificar si ya existe el admin
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        print(f"⚠️  El usuario '{username}' ya existe")
        print(f"   Email: {user.email}")
        print(f"   Es superusuario: {user.is_superuser}")
        print(f"   Es staff: {user.is_staff}")
        print(f"   Activo: {user.is_active}")
        print(f"   Tipo: {user.user_type}")

        # Asegurar que sea superusuario
        if not user.is_superuser or not user.is_staff:
            user.is_superuser = True
            user.is_staff = True
            user.is_active = True
            user.save()
            print()
            print("   ✓ Usuario actualizado a superusuario")

        print()
        print("Credenciales de acceso:")
        print(f"   URL: http://localhost:8000/admin")
        print(f"   Usuario: {username}")
        print(f"   Password: {password}")

        return user

    # Crear nuevo superusuario
    print(f"Creando superusuario '{username}'...")
    user = User.objects.create_superuser(
        username=username,
        email=email,
        password=password
    )
    user.user_type = 'other'  # Tipo por defecto para admin
    user.is_verified = True
    user.save()

    print()
    print("✅ Superusuario creado exitosamente!")
    print()
    print("Credenciales de acceso:")
    print(f"   URL: http://localhost:8000/admin")
    print(f"   Usuario: {username}")
    print(f"   Email: {email}")
    print(f"   Password: {password}")
    print()
    print("⚠️  IMPORTANTE: Cambia la contraseña después del primer login!")
    print()
    print("=" * 60)

    return user

if __name__ == '__main__':
    try:
        create_superuser()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
