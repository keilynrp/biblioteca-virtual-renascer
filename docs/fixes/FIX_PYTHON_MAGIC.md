# 🔧 Fix: Instalación de python-magic en Linux

## ❌ Problema Encontrado

Durante la instalación inicial, encontramos dos errores:

1. **`python-magic-bin` no está disponible para Linux**
   - Este paquete solo existe para Windows
   - En Linux, necesitamos instalar `libmagic` a nivel del sistema operativo

2. **`ModuleNotFoundError: No module named 'magic'`**
   - `python-magic` requiere la librería del sistema `libmagic1`
   - No estaba instalada en el contenedor Docker

---

## ✅ Solución Aplicada

### 1. Actualizado `backend/Dockerfile`

**Antes:**
```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*
```

**Después:**
```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    libmagic1 \        # ← Agregado
    libmagic-dev \     # ← Agregado
    && rm -rf /var/lib/apt/lists/*
```

### 2. Actualizado `backend/requirements.txt`

**Antes:**
```
python-magic>=0.4.27
python-magic-bin>=0.4.14  # ← Causaba error en Linux
```

**Después:**
```
python-magic>=0.4.27
```

### 3. Actualizados Scripts de Instalación

Ahora los scripts:
1. **Rebuildan el contenedor** con las nuevas dependencias del sistema
2. Verifican que `python-magic` funcione correctamente
3. Crean y aplican las migraciones

---

## 🚀 Cómo Instalar Ahora

### Método Rápido (Automático):

**Windows:**
```bash
INSTALL_VALIDATORS.bat
```

**Linux/Mac:**
```bash
chmod +x install-validators.sh
./install-validators.sh
```

⚠️ **Importante**: El proceso ahora hace rebuild del contenedor (5-10 minutos)

### Método Manual:

```bash
# 1. Rebuild el contenedor backend
docker compose build backend

# 2. Iniciar el backend
docker compose up -d backend

# 3. Esperar 10 segundos
sleep 10  # Linux/Mac
timeout /t 10  # Windows

# 4. Verificar python-magic
docker compose exec backend python -c "import magic; print('✅ OK')"

# 5. Crear migraciones
docker compose exec backend python manage.py makemigrations content

# 6. Aplicar migraciones
docker compose exec backend python manage.py migrate
```

---

## ✅ Verificación

Después de la instalación, verifica que todo funcione:

```bash
# Test 1: python-magic funciona
docker compose exec backend python -c "import magic; print('OK')"
# Debe imprimir: OK

# Test 2: Validadores se importan correctamente
docker compose exec backend python -c "from apps.content.validators import validate_pdf_file; print('OK')"
# Debe imprimir: OK

# Test 3: Migraciones aplicadas
docker compose exec backend python manage.py showmigrations content
# Todas deben tener [X]
```

---

## 📋 Archivos Modificados en el Fix

1. ✅ [backend/Dockerfile](d:\bvs_framework\backend\Dockerfile) - Agregadas libmagic1 y libmagic-dev
2. ✅ [backend/requirements.txt](d:\bvs_framework\backend\requirements.txt) - Removido python-magic-bin
3. ✅ [INSTALL_VALIDATORS.bat](d:\bvs_framework\INSTALL_VALIDATORS.bat) - Actualizado con rebuild
4. ✅ [install-validators.sh](d:\bvs_framework\install-validators.sh) - Actualizado con rebuild
5. ✅ [CHECKLIST_INSTALACION_FASE1.md](d:\bvs_framework\CHECKLIST_INSTALACION_FASE1.md) - Actualizado proceso

---

## 💡 Por Qué Este Approach

### Opción 1: Instalar en tiempo de ejecución (Rechazada)
```bash
docker compose exec backend apt-get install libmagic1
docker compose exec backend pip install python-magic
```
❌ **Problema**: Los cambios se pierden al reiniciar el contenedor

### Opción 2: Rebuild con dependencias del sistema (Elegida) ✅
```dockerfile
RUN apt-get install libmagic1 libmagic-dev
```
✅ **Ventaja**: Los cambios son permanentes en la imagen Docker

---

## 🎯 Estado Actual

- ✅ Dockerfile actualizado con libmagic
- ✅ requirements.txt corregido
- ✅ Scripts de instalación actualizados
- ✅ Documentación actualizada
- ⏳ **Siguiente paso**: Ejecutar INSTALL_VALIDATORS.bat

---

## 🐛 Troubleshooting

### Si el build falla:

```bash
# Limpiar cache de Docker
docker compose down
docker system prune -a

# Rebuild desde cero
docker compose build --no-cache backend
docker compose up -d backend
```

### Si python-magic aún no funciona:

```bash
# Verificar que libmagic está instalado en el contenedor
docker compose exec backend dpkg -l | grep libmagic

# Debe mostrar:
# ii  libmagic1       ... File type determination library using "magic" numbers
# ii  libmagic-dev    ... File type determination library using "magic" numbers (development)
```

---

**Fix Aplicado:** 2026-01-02
**Estado:** ✅ Listo para instalar
**Tiempo estimado:** 5-10 minutos (rebuild incluido)
