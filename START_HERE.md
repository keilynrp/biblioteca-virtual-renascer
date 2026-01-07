# 🚀 START HERE - Backend Setup

**¡Bienvenido!** Esta es la forma más rápida de levantar el backend.

---

## ⚡ Inicio Ultra-Rápido (30 segundos)

### Windows

**Opción 1 - Más Fácil:**
```cmd
start-backend.bat
```
Luego selecciona opción **1**

**Opción 2 - PowerShell:**
```powershell
.\Start-Backend.ps1
```
Luego selecciona opción **1**

---

### Linux / Mac / Git Bash

```bash
./scripts/start_backend_optimized.sh
```

---

## ⏱️ Tiempo Estimado

- **Primera vez:** 5-7 minutos
- **Después:** 1-2 minutos (usa `--skip-build`)

---

## ✅ Verificar que Funciona

Abre tu navegador y verifica:

1. **Backend API:** http://localhost:8000/api/
2. **Django Admin:** http://localhost:8000/admin/

Si ves las páginas, **¡todo está funcionando!** 🎉

---

## 👤 Crear Usuario Admin

Después del primer inicio, crea un superuser:

**Windows:**
```cmd
docker-compose exec backend python manage.py createsuperuser
```

**Linux/Mac:**
```bash
docker-compose exec backend python manage.py createsuperuser
```

**Credenciales sugeridas:**
- Username: `admin`
- Email: `admin@biblioteca.com`
- Password: `admin123`

---

## 🆘 Si Algo No Funciona

### Opción 1: Script de Diagnóstico

**Windows:**
```cmd
start-backend.bat
```
Selecciona opción **4**

**Bash:**
```bash
./scripts/fix_backend_issues.sh
```

### Opción 2: Inicio Limpio

```bash
./scripts/start_backend_optimized.sh --fresh
```

⚠️ **ADVERTENCIA:** Esto borrará todos los datos

---

## 📚 Documentación Completa

Una vez que el backend esté corriendo, lee:

1. **[QUICK_START_BACKEND.md](QUICK_START_BACKEND.md)** - Guía completa de inicio
2. **[BACKEND_SCRIPTS_INDEX.md](BACKEND_SCRIPTS_INDEX.md)** - Índice de todos los scripts
3. **[BACKEND_OPTIMIZATION_SUMMARY.md](BACKEND_OPTIMIZATION_SUMMARY.md)** - Resumen técnico completo

---

## 🎯 Comandos Diarios

### Iniciar Backend (rápido)
```bash
./scripts/start_backend_optimized.sh --skip-build
```

### Ver Logs
```bash
docker-compose logs -f backend
```

### Detener Backend
```bash
docker-compose down
```

### Django Shell
```bash
docker-compose exec backend python manage.py shell
```

---

## 💡 Tips

- **Primera vez:** Usa el script normal
- **Desarrollo diario:** Usa `--skip-build`
- **Problemas:** Ejecuta `fix_backend_issues.sh`
- **Reset total:** Usa `--fresh` (borra datos)

---

## 📞 ¿Necesitas Ayuda?

1. Lee: [QUICK_START_BACKEND.md](QUICK_START_BACKEND.md)
2. Ejecuta: `./scripts/fix_backend_issues.sh`
3. Revisa: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**¡Listo para comenzar!** 🚀

Ejecuta el comando de inicio para tu sistema y en 5 minutos tendrás el backend corriendo.
