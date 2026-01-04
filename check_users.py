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
    print("No hay superusuarios en el sistema")

print(f"Total usuarios en el sistema: {User.objects.count()}")
