# 📂 Reorganización del Repositorio

Este documento describe la reorganización del repositorio realizada el 2026-01-10 para mejorar la estructura y seguir las mejores prácticas de GitHub.

## ✅ Cambios Realizados

### 1. Estructura de Carpetas Creada

```
bvs_framework/
├── 📂 docs/                    # Toda la documentación (218 archivos)
│   ├── setup/                  # Instalación y configuración
│   ├── guides/                 # Guías de uso
│   ├── fixes/                  # Soluciones y correcciones
│   ├── sprint-docs/            # Documentación de sprints
│   ├── architecture/           # Arquitectura técnica
│   └── troubleshooting/        # Diagnóstico y soluciones
│
├── 📂 scripts/                 # Todos los scripts (284 archivos)
│   ├── docker/                 # Scripts de Docker
│   ├── setup/                  # Scripts de instalación
│   ├── maintenance/            # Scripts de mantenimiento
│   ├── fixes/                  # Scripts de corrección
│   └── utils/                  # Utilidades
│
├── 📂 docker/
│   └── variants/               # Variantes de docker-compose
│
├── 📂 backend/                 # Código backend (sin cambios)
├── 📂 frontend/                # Código frontend (sin cambios)
├── 📂 backups/                 # Backups
├── 📂 logs/                    # Logs
│
├── README.md                   # README principal actualizado
├── CONTRIBUTING.md             # Guía de contribución
├── LICENSE                     # Licencia MIT
├── .gitignore                  # Actualizado
├── docker-compose.yml          # Docker compose principal
└── package-lock.json           # Package lock
```

### 2. Raíz del Proyecto Limpia

**Antes**: ~300+ archivos en la raíz  
**Después**: Solo 5 archivos esenciales

Archivos en la raíz:
- `README.md` - Documentación principal
- `CONTRIBUTING.md` - Guía de contribución
- `LICENSE` - Licencia
- `docker-compose.yml` - Configuración de Docker
- `package-lock.json` - Lock de dependencias

### 3. Documentación Organizada

#### docs/setup/ (Instalación)
- Guías de Docker
- Configuración de WSL
- Instalación de dependencias
- Guías de inicio rápido

#### docs/guides/ (Guías de Uso)
- Cómo hacer login
- Gestión de usuarios
- Importación de libros
- Tutoriales

#### docs/fixes/ (Soluciones)
- Fixes de PDF viewer
- Soluciones de errores
- Documentación de patches
- Diagnósticos

#### docs/sprint-docs/ (Sprints)
- Documentación de sprints 1-8
- Backlog estratégico
- Roadmaps
- Planificación

#### docs/architecture/ (Arquitectura)
- Arquitectura técnica
- Integraciones
- Migraciones
- Configuraciones

#### docs/troubleshooting/ (Diagnóstico)
- Problemas comunes
- Optimizaciones
- Análisis de rendimiento

### 4. Scripts Organizados

#### scripts/docker/
- Scripts de gestión de Docker
- Inicio de contenedores
- Diagnóstico de Docker

#### scripts/setup/
- Scripts de instalación
- Configuración de entorno
- Setup de SSL

#### scripts/maintenance/
- Gestión de usuarios
- Migraciones
- Importación de datos

#### scripts/fixes/
- Correcciones automáticas
- Scripts de reparación

#### scripts/utils/
- Utilidades de diagnóstico
- Verificación de estado
- Herramientas auxiliares

### 5. .gitignore Actualizado

Se agregaron reglas para:
- Archivos temporales extraños (`=*`, `d:bvs_framework*`)
- Backups de Docker (`docker-backup-*/`)
- Certificados SSL (mantener ejemplos)

## 🔗 Navegación

### Puntos de Entrada Principales

1. **[README.md](README.md)** - Documentación principal del proyecto
2. **[docs/README.md](docs/README.md)** - Índice de toda la documentación
3. **[scripts/README.md](scripts/README.md)** - Índice de scripts disponibles

### Guías Rápidas

- **Instalación**: [docs/setup/](docs/setup/)
- **Uso**: [docs/guides/](docs/guides/)
- **Problemas**: [docs/troubleshooting/](docs/troubleshooting/)
- **Scripts**: [scripts/README.md](scripts/README.md)

## 📊 Estadísticas

- **Archivos documentación movidos**: 218
- **Scripts organizados**: 284
- **Archivos en raíz antes**: ~300+
- **Archivos en raíz después**: 5
- **Reducción en raíz**: ~98%

## ✨ Beneficios

1. **Mejor Navegación**: Estructura clara y organizada
2. **Fácil Mantenimiento**: Todo está categorizado
3. **GitHub Friendly**: Sigue mejores prácticas
4. **Búsqueda Rápida**: Fácil encontrar documentación y scripts
5. **Contribuciones**: Más fácil para nuevos colaboradores

## 🚀 Próximos Pasos Recomendados

1. Revisar y actualizar documentación obsoleta
2. Crear índices dentro de cada subcarpeta
3. Consolidar documentación duplicada
4. Agregar ejemplos a las guías
5. Crear workflows de CI/CD

## 📝 Notas

- Todos los scripts mantienen su funcionalidad
- Las rutas relativas fueron actualizadas donde era necesario
- Los backups de Docker se movieron a la carpeta `backups/`
- Se limpiaron archivos temporales de la raíz

---

**Reorganización completada el**: 2026-01-10  
**Resultado**: Repositorio más limpio, organizado y profesional
