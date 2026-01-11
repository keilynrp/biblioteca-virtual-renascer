# Índice de Documentación - Optimización 16GB

## 📋 Guías de Inicio Rápido

### Para Comenzar AHORA

1. **[LEEME_PRIMERO.md](LEEME_PRIMERO.md)** ⭐ **EMPIEZA AQUÍ**
   - Resumen ejecutivo
   - La solución más fácil
   - Un solo comando para todo

2. **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)**
   - Guía de inicio rápido
   - Múltiples métodos
   - Scripts disponibles

3. **[GUIA_COMPLETA_CONFIGURACION_16GB.md](GUIA_COMPLETA_CONFIGURACION_16GB.md)**
   - Guía paso a paso completa
   - Verificación detallada
   - Solución de problemas

---

## 🔧 Configuración de WSL

### Documentación WSL

4. **[CONFIGURAR_WSL_16GB.md](CONFIGURAR_WSL_16GB.md)**
   - Métodos para configurar WSL
   - Desde Windows y desde Linux
   - Verificación post-configuración

5. **[RESUMEN_CONFIGURACION_WSL.md](RESUMEN_CONFIGURACION_WSL.md)**
   - ¿Qué es .wslconfig?
   - Parámetros explicados
   - Distribución de memoria

### Scripts WSL (Ejecutar desde Windows)

- **`CONFIGURAR_WSL_16GB.bat`** - Script batch para CMD
- **`CONFIGURAR_WSL_16GB.ps1`** - Script PowerShell
- **`configurar-wsl-16gb-helper.sh`** - Helper desde Linux

---

## 🐳 Instalación y Optimización de Docker

### Documentación Docker

6. **[INSTRUCCIONES_OPTIMIZACION_16GB.md](INSTRUCCIONES_OPTIMIZACION_16GB.md)**
   - Documentación técnica completa
   - Detalles de optimizaciones
   - Configuraciones aplicadas

7. **[OPTIMIZACION_16GB_APLICADA.md](OPTIMIZACION_16GB_APLICADA.md)**
   - Cambios aplicados
   - Antes vs Ahora
   - Impacto de rendimiento

8. **[COMPARACION_OPTIMIZACIONES.md](COMPARACION_OPTIMIZACIONES.md)**
   - Comparación de configuraciones
   - Compatibilidad con 8GB vs 16GB

### Scripts Docker (Ejecutar desde WSL/Linux)

- **`INSTALAR_Y_OPTIMIZAR.sh`** ⭐ **TODO-EN-UNO**
  - Instala Docker Compose v2
  - Aplica optimizaciones
  - Verifica instalación

- **`instalar-docker-compose-v2.sh`**
  - Solo instala Docker Compose v2
  - Múltiples métodos de instalación

- **`aplicar-optimizacion-16gb.sh`**
  - Solo aplica optimizaciones
  - Requiere Docker Compose v2

---

## 🚀 Script Todo-en-Uno (Desde Windows)

### Script Maestro

9. **`CONFIGURAR_TODO_16GB.bat`** ⭐ **LA FORMA MÁS FÁCIL**
   - Configura WSL
   - Instala Docker Compose v2
   - Aplica optimizaciones
   - Verifica todo
   - **Ejecutar desde:** CMD o PowerShell en Windows

---

## 🔍 Solución de Problemas

### Errores Comunes

10. **[SOLUCION_ERROR_DOCKER_COMPOSE.md](SOLUCION_ERROR_DOCKER_COMPOSE.md)**
    - Error de docker-compose con Python 3.13
    - Docker Compose v1 vs v2
    - Múltiples soluciones

11. **[FIX_BACKEND_UNHEALTHY.md](FIX_BACKEND_UNHEALTHY.md)**
    - Backend unhealthy o killed
    - Problemas de permisos
    - Timeout configuration

### Scripts de Solución

- **`fix-apt-pkg.sh`** - Solucionar error apt_pkg
- **`REINICIAR_SERVICIOS.bat`** - Reiniciar todo
- **`REBUILD_CONTAINERS.bat`** - Reconstruir contenedores

---

## 📊 Información Técnica

### Configuraciones Aplicadas

12. **docker-compose.yml** (optimizado para 16GB)
    - Frontend: 4GB
    - Elasticsearch: 2GB
    - Backend: 1GB
    - PostgreSQL: 512MB
    - Redis: 256MB

13. **C:\Users\TuUsuario\.wslconfig**
    ```ini
    [wsl2]
    memory=10GB
    processors=4
    swap=4GB
    localhostForwarding=true
    ```

### Recursos de Memoria

```
Sistema Completo (16GB):
├─ Windows: 4GB
├─ WSL: 10GB
│  ├─ Frontend: 4GB
│  ├─ Elasticsearch: 2GB
│  ├─ Backend: 1GB
│  ├─ PostgreSQL: 512MB
│  ├─ Redis: 256MB
│  └─ Sistema WSL: 2GB
└─ Reserva: 2GB
```

---

## 📁 Estructura de Scripts

### Scripts Windows (Ejecutar desde CMD/PowerShell)

```
CONFIGURAR_TODO_16GB.bat        ← TODO-EN-UNO (RECOMENDADO)
├─ CONFIGURAR_WSL_16GB.bat      ← Configura WSL
└─ INSTALAR_Y_OPTIMIZAR.sh      ← Llama a este desde WSL
   ├─ instalar-docker-compose-v2.sh
   └─ aplicar-optimizacion-16gb.sh
```

### Scripts Linux (Ejecutar desde WSL)

```
INSTALAR_Y_OPTIMIZAR.sh         ← TODO-EN-UNO para Linux
├─ instalar-docker-compose-v2.sh
└─ aplicar-optimizacion-16gb.sh
```

---

## 🎯 Rutas de Ejecución

### Ruta 1: La Más Fácil (Desde Windows)

```batch
cd d:\bvs_framework
CONFIGURAR_TODO_16GB.bat
```

**Hace:** TODO (WSL + Docker)
**Tiempo:** 25-30 minutos
**Requiere:** Nada, lo hace todo automático

### Ruta 2: Paso a Paso (Control Manual)

#### Paso 1: WSL (Desde Windows)

```batch
cd d:\bvs_framework
CONFIGURAR_WSL_16GB.bat
```

**Hace:** Solo configura WSL
**Tiempo:** 2 minutos

#### Paso 2: Docker (Desde WSL)

```bash
cd /mnt/d/bvs_framework
chmod +x INSTALAR_Y_OPTIMIZAR.sh
./INSTALAR_Y_OPTIMIZAR.sh
```

**Hace:** Instala Docker Compose v2 + optimizaciones
**Tiempo:** 20-25 minutos

### Ruta 3: Solo Optimización Docker (Si ya tienes Docker Compose v2)

```bash
# Desde WSL
cd /mnt/d/bvs_framework
chmod +x aplicar-optimizacion-16gb.sh
./aplicar-optimizacion-16gb.sh
```

**Hace:** Solo aplica optimizaciones
**Tiempo:** 10-15 minutos
**Requiere:** Docker Compose v2 ya instalado

---

## ✅ Checklist de Documentos

### Antes de Empezar

- [ ] Leer: [LEEME_PRIMERO.md](LEEME_PRIMERO.md)
- [ ] Decidir método: TODO-EN-UNO vs Paso a Paso

### Durante la Configuración

- [ ] Seguir: [INICIO_RAPIDO.md](INICIO_RAPIDO.md) o [GUIA_COMPLETA_CONFIGURACION_16GB.md](GUIA_COMPLETA_CONFIGURACION_16GB.md)
- [ ] Ejecutar scripts según método elegido

### Si Hay Problemas

- [ ] Consultar: [SOLUCION_ERROR_DOCKER_COMPOSE.md](SOLUCION_ERROR_DOCKER_COMPOSE.md)
- [ ] Consultar: [FIX_BACKEND_UNHEALTHY.md](FIX_BACKEND_UNHEALTHY.md)
- [ ] Verificar: [RESUMEN_CONFIGURACION_WSL.md](RESUMEN_CONFIGURACION_WSL.md)

### Después de Instalar

- [ ] Verificar: `docker compose ps`
- [ ] Verificar: `docker stats`
- [ ] Verificar: `free -h`
- [ ] Crear usuario: `./crear-superusuario.sh`
- [ ] Importar libros: `./importar-100-libros.sh`

---

## 🔗 Enlaces Rápidos por Tema

### "Quiero empezar YA"
→ [LEEME_PRIMERO.md](LEEME_PRIMERO.md)

### "¿Cómo configuro WSL?"
→ [CONFIGURAR_WSL_16GB.md](CONFIGURAR_WSL_16GB.md)
→ [RESUMEN_CONFIGURACION_WSL.md](RESUMEN_CONFIGURACION_WSL.md)

### "Tengo un error de docker-compose"
→ [SOLUCION_ERROR_DOCKER_COMPOSE.md](SOLUCION_ERROR_DOCKER_COMPOSE.md)

### "Backend unhealthy o killed"
→ [FIX_BACKEND_UNHEALTHY.md](FIX_BACKEND_UNHEALTHY.md)

### "Quiero ver los detalles técnicos"
→ [INSTRUCCIONES_OPTIMIZACION_16GB.md](INSTRUCCIONES_OPTIMIZACION_16GB.md)
→ [OPTIMIZACION_16GB_APLICADA.md](OPTIMIZACION_16GB_APLICADA.md)

### "¿Cómo se compara con la versión anterior?"
→ [COMPARACION_OPTIMIZACIONES.md](COMPARACION_OPTIMIZACIONES.md)

---

## 📝 Resumen Ejecutivo

**Objetivo:** Optimizar el sistema para usar 16GB de RAM de forma eficiente.

**Método más fácil:**
```batch
CONFIGURAR_TODO_16GB.bat
```

**Tiempo total:** 25-30 minutos

**Documentos clave:**
1. [LEEME_PRIMERO.md](LEEME_PRIMERO.md) - Empieza aquí
2. [CONFIGURAR_WSL_16GB.md](CONFIGURAR_WSL_16GB.md) - Configuración WSL
3. [SOLUCION_ERROR_DOCKER_COMPOSE.md](SOLUCION_ERROR_DOCKER_COMPOSE.md) - Solución de errores

**Scripts clave:**
- `CONFIGURAR_TODO_16GB.bat` (Windows) - TODO-EN-UNO
- `INSTALAR_Y_OPTIMIZAR.sh` (Linux) - TODO-EN-UNO desde WSL

**Resultado:**
- ✅ WSL con 10GB de memoria
- ✅ Docker optimizado para 16GB
- ✅ Frontend 33% más rápido
- ✅ Elasticsearch 33% más capacidad
- ✅ Sin errores de docker-compose

---

**¡Empieza con [LEEME_PRIMERO.md](LEEME_PRIMERO.md)!** 🚀
