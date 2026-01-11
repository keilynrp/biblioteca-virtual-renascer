# 📚 Resumen de Todos los Scripts Creados

## ✅ Todo Listo - Scripts Docker Compose V2

He creado una suite completa de scripts para gestionar tu proyecto con Docker Compose V2.

---

## 🎯 Scripts Principales (USAR ESTOS)

| Script | Descripción | Ejemplo de Uso |
|--------|-------------|----------------|
| **[docker.sh](docker.sh)** | 🎯 **SCRIPT MAESTRO** - Usa este para todo | `./docker.sh start` |
| **[check_docker.sh](check_docker.sh)** | ✅ Verificar instalación de Docker | `./check_docker.sh` |
| **[start_containers.sh](start_containers.sh)** | 🚀 Levantar servicios (avanzado) | `./start_containers.sh --rebuild` |
| **[docker_quick.sh](docker_quick.sh)** | ⚡ Comandos rápidos | `./docker_quick.sh logs backend` |
| **[docker_dev.sh](docker_dev.sh)** | 🛠️ Herramientas de desarrollo | `./docker_dev.sh backup-db` |

---

## 📖 Documentación

| Archivo | Contenido |
|---------|-----------|
| **[DOCKER_V2_GUIDE.md](DOCKER_V2_GUIDE.md)** | 📘 Guía completa de Docker Compose V2 |
| **[DOCKER_START_GUIDE.md](DOCKER_START_GUIDE.md)** | 🚀 Guía rápida de inicio |
| **[install_docker_windows.md](install_docker_windows.md)** | 💻 Cómo instalar Docker en Windows |
| **[README_SCRIPTS.md](README_SCRIPTS.md)** | 📚 Este archivo - resumen de scripts |

---

## 🔧 Scripts de Fix (Soporte)

| Script | Para qué es |
|--------|-------------|
| **[fix_apt_auto.sh](fix_apt_auto.sh)** | Fix apt_pkg automático (detecta entorno) |
| **[fix_apt_now.sh](fix_apt_now.sh)** | Fix apt_pkg directo en sistema |
| **[fix_apt_docker.sh](fix_apt_docker.sh)** | Fix apt_pkg en contenedor Docker |
| **[fix_apt_error.sh](fix_apt_error.sh)** | Fix apt_pkg original |

---

## 🐍 Scripts de Python

| Script | Para qué es |
|--------|-------------|
| **[downgrade_python.sh](downgrade_python.sh)** | Downgrade Python 3.13 → 3.12 (Linux) |
| **[downgrade_python_wsl.sh](downgrade_python_wsl.sh)** | Downgrade Python en WSL |
| **[setup_python_env.sh](setup_python_env.sh)** | Configurar entorno Python |
| **[PYTHON_DOWNGRADE_README.md](PYTHON_DOWNGRADE_README.md)** | Guía de downgrade de Python |

---

## 🗑️ Scripts Obsoletos (NO USAR)

Estos son versiones antiguas o para Docker Compose V1:

- `docker_quick_commands.sh` (V1 - obsoleto)
- `docker_commands_v1.sh` (V1 - obsoleto)
- `start_containers_v1.sh` (V1 - obsoleto)
- `start_backend_docker.bat` (Windows batch - obsoleto)
- `verify_python.bat` (Windows batch - obsoleto)
- `install_pyenv.ps1` (PowerShell - obsoleto)

---

## 🚀 Cómo Empezar (Primeros Pasos)

### Paso 1: Verificar Requisitos

```bash
./check_docker.sh
```

### Paso 2: Instalar Docker Desktop (si no está instalado)

**Windows:**
1. Descarga desde: https://www.docker.com/products/docker-desktop/
2. Instala y reinicia
3. Verifica: `docker compose version`

**Guía completa:** [install_docker_windows.md](install_docker_windows.md)

### Paso 3: Levantar el Proyecto

```bash
# Opción A: Usar el script maestro (RECOMENDADO)
./docker.sh start

# Opción B: Script completo con opciones
./start_containers.sh

# Opción C: Docker Compose directo
docker compose up -d
```

### Paso 4: Configurar Django

```bash
# Ejecutar migraciones
./docker.sh migrate

# Crear superusuario
./docker.sh superuser

# Ver logs
./docker.sh logs backend
```

### Paso 5: Acceder a la Aplicación

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Admin Django:** http://localhost:8000/admin
- **Meilisearch:** http://localhost:7700

---

## 📖 Guías de Uso por Caso

### 🆕 Primera vez con el proyecto

```bash
# 1. Verificar instalación
./check_docker.sh

# 2. Levantar todo
./docker.sh start

# 3. Configurar
./docker.sh migrate
./docker.sh superuser

# 4. Ver que todo funcione
./docker.sh status
./docker.sh logs backend
```

### 💻 Desarrollo diario

```bash
# Iniciar sesión
./docker.sh start

# Ver logs en tiempo real
./docker.sh watch

# Hacer cambios en código...
# (se actualizan automáticamente)

# Ejecutar tests
./docker.sh test

# Terminar sesión
./docker.sh stop
```

### 🐛 Debugging

```bash
# Ver logs
./docker_quick.sh logs backend

# Shell en contenedor
./docker_quick.sh shell backend

# Verificar Django
./docker_dev.sh check

# Reiniciar servicio
./docker_quick.sh restart backend
```

### 🗄️ Base de Datos

```bash
# Crear backup
./docker.sh backup-db

# Restaurar backup
./docker.sh restore-db ./backups/backup_file.sql

# Reiniciar DB
./docker.sh reset-db

# Shell de PostgreSQL
docker compose exec db psql -U postgres -d biblioteca
```

### 🧹 Limpieza

```bash
# Limpiar todo (mantiene volúmenes)
./docker.sh stop
docker system prune -f

# Limpiar TODO incluyendo datos (⚠️ CUIDADO)
./docker_quick.sh clean
```

---

## 🎨 Comandos Más Usados

### Con docker.sh (Script Maestro)

```bash
./docker.sh start              # Levantar
./docker.sh stop               # Detener
./docker.sh logs backend       # Ver logs
./docker.sh shell              # Shell en backend
./docker.sh migrate            # Migraciones
./docker.sh test               # Tests
./docker.sh menu               # Menú interactivo
./docker.sh help               # Ayuda completa
```

### Con docker_quick.sh (Comandos Rápidos)

```bash
./docker_quick.sh start        # Levantar
./docker_quick.sh logs backend 100  # Ver 100 líneas
./docker_quick.sh restart frontend  # Reiniciar frontend
./docker_quick.sh rebuild backend   # Reconstruir backend
./docker_quick.sh status       # Ver estado
./docker_quick.sh fix-apt      # Fix apt_pkg
```

### Con docker_dev.sh (Desarrollo)

```bash
./docker_dev.sh watch          # Logs en vivo
./docker_dev.sh backup-db      # Backup
./docker_dev.sh reset-db       # Reset DB
./docker_dev.sh clear-cache    # Limpiar caché
./docker_dev.sh stats          # Estadísticas
./docker_dev.sh index          # Reindexar búsqueda
```

---

## 🔍 Encontrar Información

### Ver ayuda de cualquier script

```bash
./docker.sh help               # Ayuda del script maestro
./docker_quick.sh help         # Ayuda de comandos rápidos
./docker_dev.sh help           # Ayuda de desarrollo
./start_containers.sh --help   # Ayuda de inicio avanzado
```

### Leer documentación completa

```bash
# Guía completa de Docker V2
cat DOCKER_V2_GUIDE.md

# Guía rápida de inicio
cat DOCKER_START_GUIDE.md

# Instalación de Docker
cat install_docker_windows.md
```

---

## ⚡ Atajos Rápidos

Agrega estos alias a tu `.bashrc` o `.zshrc`:

```bash
# Agregar al final de ~/.bashrc o ~/.zshrc
alias dk='./docker.sh'
alias dkstart='./docker.sh start'
alias dkstop='./docker.sh stop'
alias dklogs='./docker.sh logs'
alias dkshell='./docker.sh shell'
alias dkmigrate='./docker.sh migrate'
```

Luego podrás usar:

```bash
dk start              # En lugar de ./docker.sh start
dklogs backend        # En lugar de ./docker.sh logs backend
dkshell               # En lugar de ./docker.sh shell
```

---

## 🎯 Características de los Scripts

### ✅ Docker Compose V2
- Usa `docker compose` (sin guión)
- Compatible con Docker Desktop moderno

### ✅ Colores y UX
- Mensajes con colores para mejor legibilidad
- Emojis para identificar rápidamente el tipo de mensaje
- Barras de progreso

### ✅ Validaciones
- Verifica que Docker esté instalado
- Detecta errores comunes
- Confirmaciones para operaciones destructivas

### ✅ Fix apt_pkg Integrado
- Ya aplicado en el Dockerfile
- Scripts adicionales por si reaparece el error
- Detección automática del error en logs

### ✅ Logs Informativos
- Muestra cada paso de ejecución
- URLs de acceso al terminar
- Comandos útiles sugeridos

---

## 📊 Estructura del Proyecto

```
bvs_framework/
├── 🎯 docker.sh                    # Script maestro (USAR ESTE)
├── ✅ check_docker.sh              # Verificar instalación
├── 🚀 start_containers.sh          # Inicio avanzado
├── ⚡ docker_quick.sh              # Comandos rápidos
├── 🛠️ docker_dev.sh                # Desarrollo
│
├── 📘 DOCKER_V2_GUIDE.md           # Guía completa
├── 🚀 DOCKER_START_GUIDE.md        # Guía rápida
├── 💻 install_docker_windows.md    # Instalación Docker
├── 📚 README_SCRIPTS.md            # Este archivo
│
├── 🔧 fix_apt_*.sh                 # Scripts de fix apt_pkg
├── 🐍 downgrade_python*.sh         # Scripts de Python
│
├── 🐳 docker-compose.yml           # Configuración Docker
├── 📝 .env                         # Variables de entorno
│
├── backend/
│   ├── Dockerfile                  # Con fix apt_pkg integrado
│   └── requirements.txt
│
└── frontend/
    ├── Dockerfile
    └── package.json
```

---

## 🆘 Ayuda Rápida

### Algo no funciona

```bash
# 1. Ver logs
./docker.sh logs backend

# 2. Verificar estado
./docker.sh status

# 3. Reiniciar
./docker.sh restart backend

# 4. Si todo falla
./docker.sh rebuild backend
```

### Error de apt_pkg

```bash
# Ya está solucionado en el Dockerfile
# Pero si reaparece:
./docker_quick.sh fix-apt
```

### Docker no está instalado

```bash
# 1. Verificar
./check_docker.sh

# 2. Leer guía de instalación
cat install_docker_windows.md

# 3. Descargar Docker Desktop
# https://www.docker.com/products/docker-desktop/
```

---

## 📞 Contacto y Soporte

Si tienes problemas:

1. Ejecuta: `./check_docker.sh` y revisa los errores
2. Lee: `cat DOCKER_V2_GUIDE.md` para solución de problemas
3. Verifica logs: `./docker.sh logs backend`

---

**Última actualización:** 2026-01-08
**Docker Compose:** V2
**Python recomendado:** 3.12.x
**Node recomendado:** 22.x
