#!/usr/bin/env python
"""Script para verificar usuarios en Django"""

from django.contrib.auth import get_user_model

User = get_user_model()

print("\n" + "=" * 70)
print(" 📊 VERIFICACIÓN DE USUARIOS EN LA BASE DE DATOS")
print("=" * 70)

users = User.objects.all()

if users.count() == 0:
    print("\n⚠️  NO HAY USUARIOS REGISTRADOS")
    print("\nPara crear un superusuario, ejecuta:")
    print("  ./crear-usuario-automatico.sh")
    print("\nO manualmente:")
    print("  sudo docker-compose exec backend python manage.py createsuperuser")
else:
    print(f"\n✅ Total de usuarios encontrados: {users.count()}\n")

    for idx, user in enumerate(users, 1):
        print("-" * 70)
        print(f"Usuario #{idx}")
        print("-" * 70)
        print(f"  👤 Username:       {user.username}")
        print(f"  📧 Email:          {user.email}")
        print(f"  🔐 Superusuario:   {'✅ SÍ' if user.is_superuser else '❌ NO'}")
        print(f"  👔 Staff:          {'✅ SÍ' if user.is_staff else '❌ NO'}")
        print(f"  ✔️  Activo:         {'✅ SÍ' if user.is_active else '❌ NO'}")
        print(f"  📅 Creado:         {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}")

        if user.last_login:
            print(f"  🔑 Último login:   {user.last_login.strftime('%Y-%m-%d %H:%M:%S')}")
        else:
            print(f"  🔑 Último login:   Nunca")

        # Verificar si puede autenticarse
        can_login = user.is_active and (user.is_superuser or user.is_staff or True)
        print(f"  🚪 Puede autenticar: {'✅ SÍ' if can_login else '❌ NO'}")
        print()

    print("=" * 70)
    print("\n📈 RESUMEN POR TIPO:")
    print("-" * 70)

    superusers = User.objects.filter(is_superuser=True)
    staff = User.objects.filter(is_staff=True, is_superuser=False)
    regular = User.objects.filter(is_staff=False, is_superuser=False)

    print(f"  🔴 Superusuarios: {superusers.count()}")
    if superusers.exists():
        for su in superusers:
            print(f"      → {su.username} ({su.email})")

    print(f"  🟡 Staff:         {staff.count()}")
    if staff.exists():
        for s in staff:
            print(f"      → {s.username} ({s.email})")

    print(f"  🟢 Usuarios:      {regular.count()}")
    if regular.exists():
        for r in regular:
            print(f"      → {r.username} ({r.email})")

    print(f"\n  📊 TOTAL:         {users.count()}")

print("\n" + "=" * 70)
print("\n🌐 ACCESO A LA APLICACIÓN:")
print("-" * 70)
print("  Django Admin:  http://localhost:8000/admin/")
print("  API Backend:   http://localhost:8000/api/")
print("  Frontend:      http://localhost:3000")

if users.filter(username='admin').exists():
    admin_user = users.get(username='admin')
    print("\n🔑 CREDENCIALES DEL USUARIO 'admin':")
    print("-" * 70)
    print("  Username: admin")
    print("  Password: (la que configuraste)")
    print("")
    print("  Si usaste el script automático:")
    print("  Password: admin123456")

print("\n" + "=" * 70 + "\n")
