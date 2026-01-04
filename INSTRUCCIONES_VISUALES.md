# Instrucciones Visuales - Configuración 16GB

## 🎯 Un Solo Comando (Más Fácil)

```
┌─────────────────────────────────────────────────┐
│  WINDOWS (CMD o PowerShell)                     │
├─────────────────────────────────────────────────┤
│  > cd d:\bvs_framework                          │
│  > CONFIGURAR_TODO_16GB.bat                     │
│                                                 │
│  [Presiona Enter y espera 25-30 minutos]       │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  ✓ WSL configurado con 10GB                     │
│  ✓ Docker Compose v2 instalado                  │
│  ✓ Optimizaciones aplicadas                     │
│  ✓ Contenedores corriendo                       │
└─────────────────────────────────────────────────┘
```

---

## 🔀 Alternativa: Dos Pasos

### PASO 1: Configurar WSL (Desde Windows)

```
┌─────────────────────────────────────────────────┐
│  WINDOWS (CMD o PowerShell)                     │
├─────────────────────────────────────────────────┤
│  > cd d:\bvs_framework                          │
│  > CONFIGURAR_WSL_16GB.bat                      │
│                                                 │
│  [Espera 2 minutos]                             │
└─────────────────────────────────────────────────┘
                      │
                      ▼
           ┌──────────────────┐
           │  .wslconfig      │
           │  creado en:      │
           │  C:\Users\...    │
           └──────────────────┘
                      │
                      ▼
           ┌──────────────────┐
           │  WSL reiniciado  │
           │  con 10GB        │
           └──────────────────┘
```

### PASO 2: Instalar Docker (Desde WSL)

```
┌─────────────────────────────────────────────────┐
│  WSL / LINUX                                    │
├─────────────────────────────────────────────────┤
│  $ cd /mnt/d/bvs_framework                      │
│  $ chmod +x INSTALAR_Y_OPTIMIZAR.sh             │
│  $ ./INSTALAR_Y_OPTIMIZAR.sh                    │
│                                                 │
│  [Espera 20-25 minutos]                         │
└─────────────────────────────────────────────────┘
                      │
                      ▼
           ┌──────────────────┐
           │  Docker Compose  │
           │  v2 instalado    │
           └──────────────────┘
                      │
                      ▼
           ┌──────────────────┐
           │  Optimizaciones  │
           │  aplicadas       │
           └──────────────────┘
                      │
                      ▼
           ┌──────────────────┐
           │  Contenedores    │
           │  corriendo       │
           └──────────────────┘
```

---

## 📊 Distribución de Memoria

### Tu PC (16GB Total)

```
┌────────────────────────────────────────────────┐
│                   16GB RAM                     │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────┐                              │
│  │   Windows    │  4GB                         │
│  │   Sistema    │                              │
│  └──────────────┘                              │
│                                                │
│  ┌──────────────────────────────────────┐      │
│  │            WSL (10GB)                │      │
│  │  ┌──────────────────┐                │      │
│  │  │   Frontend       │  4GB           │      │
│  │  └──────────────────┘                │      │
│  │  ┌──────────┐                        │      │
│  │  │Elastic   │  2GB                   │      │
│  │  └──────────┘                        │      │
│  │  ┌─────┐                             │      │
│  │  │Back │  1GB                        │      │
│  │  └─────┘                             │      │
│  │  ┌───┐┌───┐                          │      │
│  │  │PG ││Red│  512MB + 256MB           │      │
│  │  └───┘└───┘                          │      │
│  │  ┌──────────┐                        │      │
│  │  │ Sistema  │  2GB                   │      │
│  │  └──────────┘                        │      │
│  └──────────────────────────────────────┘      │
│                                                │
│  ┌──────────────┐                              │
│  │   Reserva    │  2GB                         │
│  └──────────────┘                              │
└────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Instalación

### Opción 1: Todo Automático

```
   [TÚ]
     │
     │ Ejecutas: CONFIGURAR_TODO_16GB.bat
     ▼
┌─────────────────┐
│ Configurar WSL  │  ← Automático
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Reiniciar WSL   │  ← Automático
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Instalar Docker │  ← Automático
│   Compose v2    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Aplicar         │  ← Automático
│ Optimizaciones  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Reconstruir     │  ← Automático
│ Contenedores    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verificar       │  ← Automático
│ Todo OK         │
└────────┬────────┘
         │
         ▼
   [LISTO] ✓
```

### Opción 2: Manual (Dos Pasos)

```
   [TÚ]
     │
     │ Paso 1 (Windows)
     ▼
┌─────────────────┐
│ Configurar WSL  │  ← Manual
└────────┬────────┘
         │
         │ Paso 2 (WSL)
         ▼
┌─────────────────┐
│ INSTALAR_Y_     │  ← Manual
│ OPTIMIZAR.sh    │
└────────┬────────┘
         │
         │ (El script hace el resto)
         ▼
   [LISTO] ✓
```

---

## 📍 Ubicaciones de Archivos

### Windows

```
C:\Users\TuUsuario\
│
└── .wslconfig  ← Configuración WSL
    │
    ├── [wsl2]
    ├── memory=10GB
    ├── processors=4
    ├── swap=4GB
    └── localhostForwarding=true
```

### Proyecto

```
d:\bvs_framework\
│
├── CONFIGURAR_TODO_16GB.bat  ← Ejecuta desde Windows
├── CONFIGURAR_WSL_16GB.bat   ← Solo WSL
├── INSTALAR_Y_OPTIMIZAR.sh   ← Ejecuta desde WSL
│
├── docker-compose.yml        ← Optimizado para 16GB
│
└── Documentación/
    ├── LEEME_PRIMERO.md
    ├── INICIO_RAPIDO.md
    ├── GUIA_COMPLETA_CONFIGURACION_16GB.md
    └── ...
```

---

## ⚡ Antes vs Después

### ANTES (Sin .wslconfig)

```
WSL: 8GB (50% de 16GB - default)
│
├── Frontend:       3GB
├── Elasticsearch:  1.5GB
├── Backend:        1GB
├── PostgreSQL:     512MB
├── Redis:          256MB
└── Sistema:        1.7GB
```

### DESPUÉS (Con .wslconfig optimizado)

```
WSL: 10GB (configurado manualmente)
│
├── Frontend:       4GB    ▲ +33%
├── Elasticsearch:  2GB    ▲ +33%
├── Backend:        1GB
├── PostgreSQL:     512MB
├── Redis:          256MB
└── Sistema:        2GB
```

---

## 🎬 Secuencia de Comandos Visualizada

### Si estás en Windows

```
┌──────────────────────────────────────┐
│  1. Abre CMD o PowerShell            │
│                                      │
│  2. cd d:\bvs_framework              │
│                                      │
│  3. CONFIGURAR_TODO_16GB.bat         │
│                                      │
│  4. [Presiona Enter]                 │
│                                      │
│  5. [Espera 25-30 minutos]           │
│                                      │
│  6. [¡Listo!]                        │
└──────────────────────────────────────┘
```

### Si estás en WSL (Dos pasos)

```
┌─────────────────────────────────────────┐
│  PASO 1 (Windows):                      │
│                                         │
│  1. Abre PowerShell                     │
│  2. cd d:\bvs_framework                 │
│  3. CONFIGURAR_WSL_16GB.bat             │
│  4. [Espera 2 minutos]                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  PASO 2 (WSL):                          │
│                                         │
│  1. Abre WSL                            │
│  2. cd /mnt/d/bvs_framework             │
│  3. chmod +x INSTALAR_Y_OPTIMIZAR.sh    │
│  4. ./INSTALAR_Y_OPTIMIZAR.sh           │
│  5. [Espera 20-25 minutos]              │
└─────────────────────────────────────────┘
```

---

## 🔍 Cómo Verificar

### 1. Ver Configuración WSL (desde Windows)

```powershell
> type %USERPROFILE%\.wslconfig

Salida esperada:
[wsl2]
memory=10GB
processors=4
swap=4GB
localhostForwarding=true
```

### 2. Ver Memoria en WSL (desde WSL)

```bash
$ free -h

Salida esperada:
              total        used        free
Mem:           9.8Gi       2.1Gi       7.7Gi
              ^^^^
          Debe ser ~10GB
```

### 3. Ver Contenedores (desde WSL)

```bash
$ docker compose ps

Salida esperada:
NAME          STATUS
frontend      Up (healthy)
backend       Up (healthy)
postgres      Up (healthy)
redis         Up (healthy)
elasticsearch Up (healthy)
```

### 4. Ver Memoria de Contenedores (desde WSL)

```bash
$ docker stats --no-stream

Salida esperada:
CONTAINER      MEM USAGE / LIMIT
frontend       2.1GB / 4GB
elasticsearch  1.2GB / 2GB
backend        650MB / 1GB
postgres       320MB / 512MB
redis          45MB / 256MB
```

---

## ✅ Checklist Visual

```
Configuración Completa:

□ 1. Abrir CMD/PowerShell
      │
      ▼
□ 2. cd d:\bvs_framework
      │
      ▼
□ 3. CONFIGURAR_TODO_16GB.bat
      │
      ▼
□ 4. Esperar 25-30 minutos
      │
      ▼
□ 5. Verificar: docker compose ps
      │
      ▼
□ 6. Verificar: docker stats
      │
      ▼
□ 7. Verificar: free -h
      │
      ▼
□ 8. Abrir http://localhost:3000
      │
      ▼
☑ COMPLETADO ✓
```

---

## 🆘 Si Algo Falla

```
┌──────────────────────────────────────┐
│  ¿Error de apt_pkg?                  │
│  → Ignóralo, no afecta              │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  ¿Error de docker-compose Python?   │
│  → El script instala Docker         │
│     Compose v2 automáticamente      │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  ¿Backend unhealthy?                 │
│  → Espera 60 segundos               │
│  → Ver logs: docker compose logs    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│  ¿WSL no muestra 10GB?               │
│  1. wsl --shutdown (desde Windows)  │
│  2. Espera 10 segundos              │
│  3. Abre WSL de nuevo               │
│  4. free -h                         │
└──────────────────────────────────────┘
```

---

## 📚 Documentación de Referencia

Para más detalles:

1. **Inicio Rápido** → [LEEME_PRIMERO.md](LEEME_PRIMERO.md)
2. **Configuración WSL** → [CONFIGURAR_WSL_16GB.md](CONFIGURAR_WSL_16GB.md)
3. **Guía Completa** → [GUIA_COMPLETA_CONFIGURACION_16GB.md](GUIA_COMPLETA_CONFIGURACION_16GB.md)
4. **Índice** → [INDICE_DOCUMENTACION.md](INDICE_DOCUMENTACION.md)

---

**¡EMPIEZA AHORA!** 🚀

```batch
cd d:\bvs_framework
CONFIGURAR_TODO_16GB.bat
```
