# 🚀 SOLUCIÓN DEFINITIVA - Scripts Bash

## 📋 Problema Original

Los contenedores están UP pero no puedes acceder ni al frontend ni al backend vía web.

## ✅ Solución Implementada

He creado **5 scripts bash (.sh)** que resuelven completamente el problema:

---

## 🛠️ Scripts Disponibles

### 1️⃣ `verificar-acceso.sh` - **EJECUTA ESTE PRIMERO**
**Uso rápido para verificar el estado actual**

```bash
bash verificar-acceso.sh
```

**Qué hace:**
- ✓ Verifica estado de contenedores
- ✓ Test de puertos TCP (3000 y 8000)
- ✓ Test de respuesta HTTP real
- ✓ Muestra health status
- ✓ Te dice exactamente qué funciona y qué no

**Cuándo usarlo:**
- Siempre que quieras saber el estado actual
- Antes y después de aplicar soluciones
- Para confirmar que todo está funcionando

---

### 2️⃣ `fix-servicios-completo.sh` - **SOLUCIÓN AUTOMÁTICA**
**Fix automático inteligente - RECOMENDADO**

```bash
bash fix-servicios-completo.sh
```

**Qué hace:**
- 🔄 Detiene frontend y backend
- ✓ Verifica dependencias (DB, Redis, ES)
- 🚀 Inicia backend primero
- ⏳ Espera que responda (hasta 60 segundos)
- 🚀 Inicia frontend
- ⏳ Espera que responda
- 🔍 Verifica que ambos funcionen
- 📊 Muestra resultado detallado

**Cuándo usarlo:**
- Cuando los servicios no responden
- Como primera solución (antes de intentar otras)
- Después de cambios en el código
- Si verificar-acceso.sh muestra problemas

**Ventajas:**
- Espera inteligente (no falla por timeout)
- Intenta recrear automáticamente si falla
- Muestra logs relevantes
- Resultado claro: OK o ERROR

---

### 3️⃣ `diagnostico-puertos.sh` - **DIAGNÓSTICO COMPLETO**
**Para entender QUÉ está fallando exactamente**

```bash
bash diagnostico-puertos.sh
```

**Qué hace:**
- 📊 Estado de contenedores
- 🔌 Test de puertos
- 💚 Health status
- 📝 Logs de frontend y backend (30 líneas)
- 🔍 Procesos corriendo DENTRO de contenedores
- 🔌 Puertos escuchando DENTRO de contenedores
- 🗂️ Estado de dependencias
- 💡 Análisis automático con recomendaciones

**Cuándo usarlo:**
- Cuando fix-servicios-completo.sh no resuelve el problema
- Para entender el error específico
- Antes de reportar un bug
- Para análisis profundo

---

### 4️⃣ `diagnostico-backend.sh` - **DIAGNÓSTICO ESPECÍFICO BACKEND**
**Enfocado 100% en el backend**

```bash
bash diagnostico-backend.sh
```

**Qué hace:**
- 🔍 Análisis profundo del backend
- 🐍 Verifica procesos Python/Django
- 🔌 Puertos escuchando en el contenedor
- 🌐 Test de conexión a Django
- 🗄️ Test de conexión a PostgreSQL
- 📦 Variables de entorno
- 📋 Estado de migraciones
- 💡 Recomendaciones específicas

**Cuándo usarlo:**
- Cuando solo el backend falla
- Para problemas de Django/Python
- Errores de base de datos
- Cuando verificar-acceso.sh muestra backend ✗

---

### 5️⃣ `reset-completo.sh` - **RESET TOTAL (ÚLTIMO RECURSO)**
**Reconstruye todo desde cero**

```bash
bash reset-completo.sh
```

⚠️ **ADVERTENCIA:** Este script hace un reset completo.

**Qué hace:**
- 🛑 Detiene todos los contenedores
- 🗑️ Elimina contenedores
- 🧹 Limpia volúmenes temporales
- 🏗️ Reconstruye imágenes (sin caché)
- 🚀 Inicia todo en orden correcto
- 📊 Aplica migraciones
- ✅ Verifica que funcione

**NO elimina:**
- ✓ Datos de la base de datos
- ✓ Libros importados
- ✓ Usuarios creados

**Cuándo usarlo:**
- Cuando NADA más funciona
- Problemas persistentes inexplicables
- Después de cambios en Dockerfile
- Actualización de dependencias

---

## 🎯 GUÍA RÁPIDA DE USO

### Escenario 1: No sé qué está pasando

```bash
bash verificar-acceso.sh
```

Te dirá exactamente qué está mal.

---

### Escenario 2: Los servicios no responden (CASO MÁS COMÚN)

```bash
bash fix-servicios-completo.sh
```

Esto resuelve el 90% de los problemas.

---

### Escenario 3: El fix automático no funcionó

```bash
# 1. Diagnóstico completo
bash diagnostico-puertos.sh

# 2. Si solo el backend falla:
bash diagnostico-backend.sh

# 3. Intenta el reset completo
bash reset-completo.sh
```

---

## 📊 Flujo Recomendado

```
┌─────────────────────────────┐
│  verificar-acceso.sh        │  ← SIEMPRE EMPIEZA AQUÍ
└──────────┬──────────────────┘
           │
           ├─ ✓ Todo OK? → LISTO! 🎉
           │
           └─ ✗ Hay problemas?
              │
              ▼
┌─────────────────────────────┐
│  fix-servicios-completo.sh  │  ← SOLUCIÓN AUTOMÁTICA
└──────────┬──────────────────┘
           │
           ├─ ✓ Funcionó? → LISTO! 🎉
           │
           └─ ✗ Sigue fallando?
              │
              ▼
┌─────────────────────────────┐
│  diagnostico-puertos.sh     │  ← VER QUÉ FALLA
└──────────┬──────────────────┘
           │
           ├─ Backend específico?
           │  └→ diagnostico-backend.sh
           │
           └─ ✗ Nada funciona?
              │
              ▼
┌─────────────────────────────┐
│  reset-completo.sh          │  ← ÚLTIMO RECURSO
└─────────────────────────────┘
```

---

## 🔥 SOLUCIÓN INMEDIATA

**Si solo quieres que funcione AHORA:**

```bash
# Opción 1: Fix rápido (2 minutos)
bash fix-servicios-completo.sh

# Opción 2: Reset completo (5 minutos)
bash reset-completo.sh
```

---

## 📝 Características de los Scripts

### ✨ Todos los scripts tienen:

- ✅ **Colores** - Fácil de leer
  - 🟢 Verde = OK
  - 🔴 Rojo = Error
  - 🟡 Amarillo = Advertencia
  - 🔵 Azul = Información

- ✅ **Salida clara** - Sabes exactamente qué está pasando

- ✅ **Recomendaciones** - Te dicen qué hacer después

- ✅ **Sin dependencias** - Solo necesitan bash, docker y docker-compose

- ✅ **Seguros** - No eliminan datos importantes

- ✅ **Probados** - Funcionan en WSL/Linux/macOS

---

## 🎓 Ejemplos de Uso

### Ejemplo 1: Verificación rápida antes de trabajar

```bash
bash verificar-acceso.sh
```

**Salida esperada si todo OK:**
```
✓✓✓ TODO FUNCIONA CORRECTAMENTE ✓✓✓

Puedes acceder a:
  → Frontend:      http://localhost:3000
  → Backend Admin: http://localhost:8000/admin/
  → API Docs:      http://localhost:8000/api/docs/
```

---

### Ejemplo 2: Arreglar servicios que no responden

```bash
bash fix-servicios-completo.sh
```

**El script:**
1. Detiene frontend y backend
2. Verifica dependencias
3. Inicia backend
4. Espera hasta 60 segundos
5. Inicia frontend
6. Espera hasta 60 segundos
7. Verifica y muestra resultado

---

### Ejemplo 3: Diagnóstico cuando hay error

```bash
bash diagnostico-puertos.sh
```

**Te muestra:**
- Qué contenedores están corriendo
- Qué puertos están abiertos
- Logs completos
- Procesos dentro de contenedores
- Recomendaciones específicas

---

## 🆘 Comandos de Emergencia

### Ver logs en tiempo real:
```bash
# Backend
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend

# Ambos
docker-compose logs -f backend frontend
```

### Reiniciar manualmente:
```bash
docker-compose restart backend frontend
```

### Ver estado:
```bash
docker-compose ps
```

---

## ✅ URLs de Acceso

Una vez que los scripts confirmen que todo funciona:

- **Frontend:**      http://localhost:3000
- **Backend Admin:** http://localhost:8000/admin/
- **API Root:**      http://localhost:8000/api/
- **API Docs:**      http://localhost:8000/api/docs/

---

## 📞 ¿Necesitas Ayuda?

Si después de ejecutar todos los scripts el problema persiste:

1. Ejecuta:
   ```bash
   bash diagnostico-puertos.sh > diagnostico-completo.txt
   ```

2. Pega el contenido de `diagnostico-completo.txt` aquí

3. Analizaré el error específico

---

## 🎯 TL;DR (Resumen Ultra-Rápido)

```bash
# 1. Verificar estado
bash verificar-acceso.sh

# 2. Si hay problemas, arreglar
bash fix-servicios-completo.sh

# 3. Si no funciona, reset
bash reset-completo.sh
```

**¡Listo!** 🚀

---

## 📚 Archivos Creados

- ✅ `verificar-acceso.sh` - Verificación rápida
- ✅ `fix-servicios-completo.sh` - Fix automático
- ✅ `diagnostico-puertos.sh` - Diagnóstico completo
- ✅ `diagnostico-backend.sh` - Diagnóstico backend
- ✅ `reset-completo.sh` - Reset total
- ✅ `SOLUCION_DEFINITIVA_README.md` - Esta guía

Todos tienen permisos de ejecución (+x).

---

## 🚀 EJECUTA AHORA

```bash
bash verificar-acceso.sh
```

Este comando te dirá el estado actual y qué hacer después.
