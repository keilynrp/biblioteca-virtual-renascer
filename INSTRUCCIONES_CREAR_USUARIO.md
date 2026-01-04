# 👤 Instrucciones para Crear Superusuario

## ✅ El Backend está Funcionando

El backend Django está activo y respondiendo correctamente en el puerto 8000.

---

## 🚀 Opción 1: Creación Automática (RECOMENDADO)

Esta opción crea un superusuario con credenciales predeterminadas para desarrollo.

### Ejecuta en WSL:

```bash
cd /mnt/d/bvs_framework
chmod +x crear-usuario-automatico.sh
./crear-usuario-automatico.sh
```

### Credenciales que se crearán:
- **Username:** `admin`
- **Email:** `admin@biblioteca.com`
- **Password:** `admin123456`

⚠️ **Nota:** Si el usuario ya existe, el script te informará y mostrará la información del usuario existente.

---

## 🎯 Opción 2: Creación Interactiva

Si prefieres elegir tus propias credenciales:

### Ejecuta en WSL:

```bash
cd /mnt/d/bvs_framework
sudo docker-compose exec backend python manage.py createsuperuser
```

El comando te pedirá:
1. **Username** (nombre de usuario)
2. **Email** (correo electrónico)
3. **Password** (contraseña - debes escribirla dos veces)

---

## 🌐 Acceso a la Aplicación

Una vez creado el superusuario, puedes acceder a:

### Django Admin Panel
- **URL:** http://localhost:8000/admin/
- **Username:** `admin` (o el que hayas elegido)
- **Password:** `admin123456` (o la que hayas elegido)

### Frontend (Next.js)
- **URL:** http://localhost:3000

### API Backend
- **URL:** http://localhost:8000/api/

---

## 🔧 Comandos Útiles Adicionales

### Ver todos los usuarios existentes:
```bash
sudo docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
[print(f'{u.username} - {u.email} - Superuser: {u.is_superuser}') for u in User.objects.all()]
"
```

### Cambiar contraseña de un usuario:
```bash
sudo docker-compose exec backend python manage.py changepassword admin
```

### Crear un usuario regular (no superusuario):
```bash
sudo docker-compose exec backend python manage.py shell
```

Luego dentro del shell:
```python
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.create_user(
    username='usuario1',
    email='usuario1@ejemplo.com',
    password='password123'
)
print(f"Usuario creado: {user.username}")
exit()
```

---

## 📊 Verificar Usuarios Existentes

```bash
sudo docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
print(f'Total usuarios: {User.objects.count()}');
print(f'Superusuarios: {User.objects.filter(is_superuser=True).count()}')
"
```

---

## ⚠️ Importante para Producción

Las credenciales predeterminadas (`admin`/`admin123456`) son **SOLO para desarrollo**.

En producción:
1. Usa contraseñas fuertes
2. Usa autenticación de dos factores (2FA)
3. Limita los usuarios con permisos de superusuario
4. Cambia las credenciales por defecto inmediatamente

---

## 🐛 Solución de Problemas

### "Error: That username is already taken"
El usuario ya existe. Puedes:
- Usar otro username
- Cambiar la contraseña del existente: `sudo docker-compose exec backend python manage.py changepassword admin`

### "CommandError: superuser creation skipped"
El backend puede estar en modo no-interactivo. Usa el script automático en su lugar.

### Backend no responde
Verifica que el backend esté corriendo:
```bash
sudo docker-compose ps backend
sudo docker-compose logs backend
```

---

## 📝 Resumen Rápido

**Para crear rápidamente un superusuario de prueba:**

```bash
cd /mnt/d/bvs_framework
chmod +x crear-usuario-automatico.sh
./crear-usuario-automatico.sh
```

Luego accede a:
- **Admin:** http://localhost:8000/admin/ (admin / admin123456)
- **Frontend:** http://localhost:3000
