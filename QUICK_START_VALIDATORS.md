# 🚀 Inicio Rápido: Validación de PDFs

## ⚡ Instalación Rápida

### Opción 1: Script Automático (Recomendado)

**Windows:**
```bash
INSTALL_VALIDATORS.bat
```

**Linux/Mac:**
```bash
chmod +x install-validators.sh
./install-validators.sh
```

⚠️ **Nota**: Esto rebuildeará el contenedor backend (5-10 minutos)

### Opción 2: Manual

```bash
# 1. Rebuild backend con libmagic
docker compose build backend

# 2. Iniciar backend
docker compose up -d backend

# 3. Esperar 10 segundos
sleep 10  # Linux/Mac
# timeout /t 10  # Windows

# 4. Crear y aplicar migraciones
docker compose exec backend python manage.py makemigrations content
docker compose exec backend python manage.py migrate
```

---

## ✅ Validaciones Activas

| Tipo | Tamaño Max | Formatos | Validación MIME |
|------|-----------|----------|-----------------|
| **PDFs** | 50MB | .pdf | ✅ |
| **Imágenes** | 5MB | .jpg, .png, .webp, .gif | ✅ |

---

## 🔒 Protecciones de Seguridad

- ✅ Validación de tipo MIME real (no solo extensión)
- ✅ Límites de tamaño estrictos
- ✅ Sanitización de nombres de archivo
- ✅ Verificación de estructura PDF
- ✅ Detección de PDFs encriptados
- ✅ Prevención de directory traversal

---

## 🧪 Probar Validación

1. Ir al panel de administración: [http://localhost:3000/admin/books](http://localhost:3000/admin/books)
2. Click en "Nuevo Libro"
3. Intentar subir:
   - ✅ PDF válido < 50MB → **Aceptado**
   - ❌ PDF > 50MB → **Rechazado**
   - ❌ Archivo .exe renombrado a .pdf → **Rechazado**
   - ❌ PDF encriptado → **Rechazado**

---

## 📚 Documentación Completa

Ver: [VALIDACION_PDF_DOCUMENTACION.md](VALIDACION_PDF_DOCUMENTACION.md)

---

## ⚠️ Troubleshooting

**Error: "python-magic not installed"**
```bash
docker compose exec backend pip install python-magic python-magic-bin
docker compose restart backend
```

**Validación no funciona:**
```bash
# Verificar migraciones
docker compose exec backend python manage.py showmigrations content

# Aplicar si es necesario
docker compose exec backend python manage.py migrate
```

---

**Estado:** ✅ Listo para usar
