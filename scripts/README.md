# 🔧 Scripts - Biblioteca Virtual SENASOFT

Colección de scripts para automatizar tareas comunes del proyecto.

## 📂 Estructura de Scripts

### 🐳 [Docker](./docker/)
Scripts relacionados con Docker y contenedores:
- `docker.sh` - Script principal de Docker
- `start_containers.sh` - Iniciar contenedores
- `check_docker.sh` - Verificar estado de Docker
- Scripts de diagnóstico y corrección

### ⚙️ [Setup](./setup/)
Scripts de instalación y configuración:
- Instalación de Docker
- Configuración de Python
- Setup de SSL
- Scripts de optimización

### 🔄 [Maintenance](./maintenance/)
Scripts de mantenimiento regular:
- Reinicio de servicios
- Migraciones de base de datos
- Importación de libros
- Gestión de usuarios

### 🩹 [Fixes](./fixes/)
Scripts de corrección y solución de problemas:
- Fixes de PDF reader
- Correcciones de errores
- Resets de servicios
- Scripts de debug

### 🛠️ [Utils](./utils/)
Utilidades y herramientas auxiliares:
- Scripts de diagnóstico
- Verificación de estado
- Herramientas de debug
- Instaladores rápidos

## 🚀 Uso Común

### Iniciar el proyecto
```bash
# Linux/Mac
./scripts/docker/start_containers.sh

# Windows
scripts\docker\start_containers.bat
```

### Verificar estado
```bash
./scripts/docker/check_docker.sh
```

### Crear usuario administrador
```bash
./scripts/maintenance/crear-superusuario.sh
```

### Importar libros
```bash
./scripts/maintenance/importar-libros-custom.sh
```

## 📝 Convenciones

- Scripts `.sh` para Linux/Mac/WSL
- Scripts `.bat` para Windows (CMD)
- Scripts `.ps1` para Windows (PowerShell)
- Todos los scripts tienen descripción en comentarios

## 🔗 Enlaces

- [Documentación](../docs/)
- [README Principal](../README.md)
