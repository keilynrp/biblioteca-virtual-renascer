# 🚀 Guía Rápida - Fix Error de Lectura PDF

## ⚡ Solución en 30 Segundos

Abre tu terminal (Git Bash, WSL o terminal de Linux) y ejecuta:

```bash
bash fix-reading-simple.sh
```

**¡Listo!** El script hará todo automáticamente.

### Alternativa con más detalles:
```bash
bash EJECUTAR_FIX.sh
```

---

## 📋 Opciones Disponibles

### Opción 1: Fix Simple y Robusto ⭐ (30 segundos)
```bash
bash fix-reading-simple.sh
```
✅ **RECOMENDADO** - Más confiable, sin errores de importación

### Opción 2: Fix con Diagnóstico Completo (1 minuto)
```bash
bash EJECUTAR_FIX.sh
```
✅ Incluye verificaciones detalladas del sistema

### Opción 3: Fix Completo con Pruebas de Endpoint (2 minutos)
```bash
bash fix-reading-session-error.sh
```
✅ Incluye pruebas del endpoint y creación de token

### Opción 4: Solo Diagnóstico (Sin cambios)
```bash
bash debug-reading-error.sh
```
✅ Para ver qué está pasando sin modificar nada

### Opción 5: Fix Ultra Rápido (20 segundos)
```bash
bash quick-fix-reading.sh
```
✅ Solo aplica migraciones y reinicia (mínimas verificaciones)

---

## 🖥️ Para Usuarios de Windows

### Si usas Git Bash:
1. Abre **Git Bash** en la carpeta del proyecto
2. Ejecuta: `bash fix-reading-simple.sh`

### Si usas WSL:
1. Abre **WSL** (Ubuntu, Debian, etc.)
2. Navega al proyecto: `cd /mnt/d/bvs_framework`
3. Ejecuta: `bash fix-reading-simple.sh`

### Si usas PowerShell o CMD:
1. Abre **PowerShell** o **CMD**
2. Ejecuta el archivo `.bat`:
   ```
   FIX_READING_SESSION_ERROR.bat
   ```

---

## 🔍 ¿Qué Hace el Script?

1. ✅ Verifica que Docker está corriendo
2. ✅ Aplica las migraciones de base de datos
3. ✅ Crea la tabla `readings` si no existe
4. ✅ Verifica que el modelo Reading funciona
5. ✅ Comprueba que hay libros disponibles
6. ✅ Reinicia los servicios (backend y frontend)
7. ✅ Verifica que todo está funcionando

---

## ❓ Si el Error Persiste

### 1. Ver Logs del Backend
```bash
docker compose logs backend --tail=50
```

### 2. Ver Logs del Frontend
```bash
docker compose logs frontend --tail=50
```

### 3. Verificar Estado de Contenedores
```bash
docker compose ps
```

Todos deben estar en estado `Up` o `healthy`.

### 4. Reconstruir Contenedores (Último Recurso)
```bash
docker compose down
docker compose up -d --build
```

---

## 🎯 Verificar que Funciona

1. Abre el navegador en: **http://localhost:3000**
2. Inicia sesión
3. Ve a la **Biblioteca**
4. Selecciona un libro
5. Haz clic en **"Leer"**

Deberías ver el visor de PDF sin errores.

---

## 📱 Mensajes de Error Comunes

### "Table readings does not exist"
**Solución:** El script ya lo corrige automáticamente

### "401 Unauthorized"
**Solución:** Tu token expiró, cierra sesión y vuelve a iniciar

### "404 Not Found"
**Solución:** El libro no existe o no tiene PDF asociado

### "500 Internal Server Error"
**Solución:** Revisa logs con `docker compose logs backend --tail=50`

---

## 🛠️ Comandos Útiles

```bash
# Estado de servicios
docker compose ps

# Reiniciar todo
docker compose restart

# Ver logs en vivo
docker compose logs -f backend frontend

# Acceder al backend
docker compose exec backend python manage.py shell

# Crear superusuario
docker compose exec backend python manage.py createsuperuser

# Importar libros de prueba
bash importar-libros-openlibrary.sh
```

---

## 📚 Más Información

- **Documentación completa:** [README_FIX_READING.md](README_FIX_READING.md)
- **Solución detallada:** [SOLUCION_ERROR_LECTURA.md](SOLUCION_ERROR_LECTURA.md)

---

## ⏱️ Tiempo Estimado

- **Fix automático:** 30-60 segundos
- **Diagnóstico:** 1-2 minutos
- **Fix manual:** 3-5 minutos

---

## ✅ Checklist Pre-Ejecución

- [ ] Docker Desktop está corriendo
- [ ] Estás en la carpeta del proyecto
- [ ] Tienes permisos de administrador (si es necesario)
- [ ] Los contenedores están corriendo (`docker compose ps`)

---

**¿Listo? Ejecuta:**
```bash
bash fix-reading-simple.sh
```

🎉 **¡Y listo!**
