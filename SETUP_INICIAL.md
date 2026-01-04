# 🚀 Setup Inicial del Backend

## ❗ Problema Identificado

La base de datos **no tiene las tablas creadas**. El error indica:
```
django.db.utils.ProgrammingError: relation "users" does not exist
```

Esto significa que necesitas ejecutar las **migraciones de Django** para crear todas las tablas en PostgreSQL.

---

## ✅ Solución: Setup Completo Automático (RECOMENDADO)

Ejecuta este script en tu **terminal WSL**:

```bash
cd /mnt/d/bvs_framework
chmod +x setup-completo.sh
./setup-completo.sh
```

### Este script hará TODO automáticamente:
1. ✅ Ejecutar las migraciones de Django (crear todas las tablas)
2. ✅ Configurar Elasticsearch (crear índices)
3. ✅ Crear un superusuario (admin/admin123456 o personalizado)
4. ✅ Verificar que todo funcione correctamente

**Es la forma más rápida y segura de configurar todo.**

---

## 📋 Opción 2: Paso a Paso Manual

Si prefieres hacerlo paso a paso:

### Paso 1: Ejecutar Migraciones

```bash
cd /mnt/d/bvs_framework
chmod +x ejecutar-migraciones.sh
./ejecutar-migraciones.sh
```

O manualmente:
```bash
sudo docker-compose exec backend python manage.py migrate
```

### Paso 2: Crear Superusuario

```bash
chmod +x crear-usuario-automatico.sh
./crear-usuario-automatico.sh
```

O manualmente:
```bash
sudo docker-compose exec backend python manage.py createsuperuser
```

### Paso 3: Verificar

```bash
chmod +x verificar-usuario.sh
./verificar-usuario.sh
```

---

## 🔍 ¿Qué Hacen las Migraciones?

Las migraciones de Django crean todas las tablas necesarias en PostgreSQL:

- **users** - Tabla de usuarios
- **auth_*** - Tablas de autenticación y permisos
- **content_*** - Tablas de libros, categorías, autores
- **payments_*** - Tablas de suscripciones y pagos
- Y muchas más...

Sin estas tablas, el backend no puede funcionar.

---

## 🎯 Comandos Importantes

### Ver migraciones pendientes:
```bash
sudo docker-compose exec backend python manage.py showmigrations
```

### Ejecutar migraciones:
```bash
sudo docker-compose exec backend python manage.py migrate
```

### Ver tablas creadas en PostgreSQL:
```bash
sudo docker-compose exec db psql -U postgres -d biblioteca -c "\dt"
```

### Verificar configuración de la BD:
```bash
sudo docker-compose exec backend python manage.py check --database default
```

---

## ⚠️ Importante

### Primera Vez Configurando el Proyecto

Si es la **primera vez** que configuras el proyecto:

1. **Ejecuta las migraciones** (crea las tablas)
2. **Crea un superusuario** (para acceder al admin)
3. **Verifica que funcione** (prueba el login)

### Si Reseteas la Base de Datos

Si eliminas los volúmenes de Docker (`docker-compose down -v`):

- ⚠️ **Perderás todos los datos**
- ✅ Tendrás que volver a ejecutar las migraciones
- ✅ Tendrás que volver a crear el superusuario

---

## 🐛 Solución de Problemas

### Error: "No changes detected"

Si ves este mensaje al ejecutar migraciones, puede significar:
- Las migraciones ya están aplicadas
- O no hay archivos de migración

Verifica con:
```bash
sudo docker-compose exec backend python manage.py showmigrations
```

### Error: "Access denied for user"

Problema de conexión a la base de datos. Verifica:
```bash
# Ver configuración de DB en el .env
cat .env | grep DB_

# Verificar que PostgreSQL esté corriendo
sudo docker-compose ps db

# Ver logs de PostgreSQL
sudo docker-compose logs db
```

### Error: "table already exists"

Las tablas ya fueron creadas. Esto es normal si ya ejecutaste las migraciones antes.

---

## 📊 Estado Esperado Después del Setup

### Servicios:
- ✅ PostgreSQL: Corriendo con todas las tablas creadas
- ✅ Backend: Corriendo sin errores
- ✅ Frontend: Accesible
- ✅ Redis: Corriendo
- ✅ Elasticsearch: Corriendo con índices creados

### Base de Datos:
- ✅ Tablas creadas (users, books, categories, etc.)
- ✅ Al menos 1 superusuario creado

### Accesos:
- ✅ Django Admin: http://localhost:8000/admin/ (funciona)
- ✅ API: http://localhost:8000/api/ (funciona)
- ✅ Frontend: http://localhost:3000 (funciona)

---

## 🎉 Resumen Rápido

### Configuración Completa en 1 Comando:

```bash
cd /mnt/d/bvs_framework
chmod +x setup-completo.sh
./setup-completo.sh
```

### O Paso a Paso:

```bash
# 1. Migraciones
sudo docker-compose exec backend python manage.py migrate

# 2. Crear superusuario
./crear-usuario-automatico.sh

# 3. Verificar
./verificar-usuario.sh
```

---

## 📝 Después del Setup

Una vez completado el setup:

1. **Accede al Django Admin**: http://localhost:8000/admin/
   - Username: `admin`
   - Password: `admin123456`

2. **Crea contenido de prueba**:
   - Categorías
   - Autores
   - Libros

3. **Prueba el frontend**: http://localhost:3000

4. **Prueba la API**: http://localhost:8000/api/

---

Por favor ejecuta `./setup-completo.sh` y todo se configurará automáticamente. 🚀
