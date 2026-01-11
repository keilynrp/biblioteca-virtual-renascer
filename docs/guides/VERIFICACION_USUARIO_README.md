# 🔍 Verificación de Usuario y Autenticación

## 📋 Scripts Disponibles

He creado varios scripts para verificar y probar la autenticación:

### 1. Verificar Usuario (Recomendado para empezar)

```bash
cd /mnt/d/bvs_framework
chmod +x verificar-usuario.sh
./verificar-usuario.sh
```

**Qué hace:**
- Lista todos los usuarios en la base de datos
- Muestra información detallada de cada usuario
- Indica quiénes son superusuarios, staff, etc.
- Muestra estadísticas

---

### 2. Probar Autenticación Completa

```bash
cd /mnt/d/bvs_framework
chmod +x probar-autenticacion.sh
./probar-autenticacion.sh
```

**Qué hace:**
- Prueba el login en la API REST (`/api/auth/login/`)
- Verifica acceso al Django Admin
- Comprueba que el usuario existe en la BD
- Valida las credenciales
- Muestra los tokens JWT si la autenticación es exitosa

**Te pedirá:**
- Username (por defecto: `admin`)
- Password (por defecto: `admin123456`)

---

### 3. Verificación Simple

```bash
cd /mnt/d/bvs_framework
chmod +x verificar-usuario-simple.sh
./verificar-usuario-simple.sh
```

**Qué hace:**
- Ejecución rápida del script de verificación
- Lista usuarios de forma formateada

---

## 🎯 Comandos Rápidos (Sin Scripts)

### Ver todos los usuarios:

```bash
sudo docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
for u in User.objects.all():
    print(f'{u.username} - {u.email} - Superuser: {u.is_superuser} - Active: {u.is_active}')
"
```

### Verificar un usuario específico:

```bash
sudo docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
try:
    u = User.objects.get(username='admin');
    print(f'✅ Usuario encontrado:');
    print(f'  Username: {u.username}');
    print(f'  Email: {u.email}');
    print(f'  Superuser: {u.is_superuser}');
    print(f'  Active: {u.is_active}')
except User.DoesNotExist:
    print('❌ Usuario no encontrado')
"
```

### Probar autenticación de usuario:

```bash
sudo docker-compose exec backend python manage.py shell -c "
from django.contrib.auth import get_user_model;
User = get_user_model();
user = User.objects.get(username='admin');
if user.check_password('admin123456'):
    print('✅ Contraseña correcta')
else:
    print('❌ Contraseña incorrecta')
"
```

---

## 🔐 Probar Login desde la API

### Con curl:

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}'
```

**Respuesta esperada (éxito):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@biblioteca.com"
  }
}
```

**Respuesta esperada (error):**
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

## 🌐 Acceder al Django Admin

### Manualmente en el navegador:

1. Abre: http://localhost:8000/admin/
2. Ingresa credenciales:
   - **Username:** `admin`
   - **Password:** `admin123456`
3. Deberías ver el panel de administración de Django

---

## 🔧 Solución de Problemas

### "Usuario no encontrado"

El usuario no existe en la base de datos. Créalo:

```bash
./crear-usuario-automatico.sh
```

### "Contraseña incorrecta"

Resetea la contraseña:

```bash
sudo docker-compose exec backend python manage.py changepassword admin
```

### "Error de conexión al backend"

Verifica que el backend esté corriendo:

```bash
sudo docker-compose ps backend
sudo docker-compose logs backend
```

### "Endpoint /api/auth/login/ no encontrado (404)"

Verifica la configuración de URLs del backend. El endpoint puede estar en:
- `/api/auth/login/`
- `/api/authentication/login/`
- `/api/token/`

Para verificar las URLs disponibles:

```bash
sudo docker-compose exec backend python manage.py show_urls | grep -i login
```

O revisa las URLs manualmente:

```bash
sudo docker-compose exec backend python manage.py shell -c "
from django.urls import get_resolver;
print([str(p.pattern) for p in get_resolver().url_patterns])
"
```

---

## 📊 Información de Acceso

### Credenciales por Defecto (si usaste el script automático):

```
Username: admin
Email:    admin@biblioteca.com
Password: admin123456
```

### URLs de la Aplicación:

- **Django Admin:** http://localhost:8000/admin/
- **API Backend:** http://localhost:8000/api/
- **Frontend:** http://localhost:3000
- **Elasticsearch:** http://localhost:9200

---

## ✅ Checklist de Verificación

Ejecuta estos pasos para confirmar que todo funciona:

- [ ] Verificar que el usuario existe: `./verificar-usuario.sh`
- [ ] Probar autenticación API: `./probar-autenticacion.sh`
- [ ] Acceder al Django Admin: http://localhost:8000/admin/
- [ ] Probar login desde el frontend: http://localhost:3000
- [ ] Verificar que todos los servicios estén UP: `sudo docker-compose ps`

---

## 💡 Siguiente Paso

Una vez verificado que el usuario existe y puede autenticarse:

1. **Accede al Django Admin** para gestionar contenido
2. **Prueba el frontend** para verificar la integración
3. **Crea contenido de prueba** (libros, categorías, etc.)

---

## 📝 Resumen Rápido

**Para verificar usuario:**
```bash
./verificar-usuario.sh
```

**Para probar autenticación:**
```bash
./probar-autenticacion.sh
```

**Para acceder al admin:**
- URL: http://localhost:8000/admin/
- User: admin
- Pass: admin123456
