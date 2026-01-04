#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'biblioteca.settings')
django.setup()

from django.contrib.auth.models import User

superusers = User.objects.filter(is_superuser=True)
print(f"Total superusuarios: {superusers.count()}")
print()

if superusers.exists():
    print("Superusuarios encontrados:")
    for user in superusers:
        print(f"  - Usuario: {user.username}")
        print(f"    Email: {user.email}")
        print(f"    Activo: {user.is_active}")
        print()
else:
    print("⚠️  NO HAY SUPERUSUARIOS EN EL SISTEMA")

print(f"Total usuarios: {User.objects.count()}")
