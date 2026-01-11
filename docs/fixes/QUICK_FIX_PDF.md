# ⚡ Quick Fix: PDF Reader

## 🎯 Solución en 3 Pasos

### 1️⃣ Ejecuta el Script

```bash
# Dale permisos (solo primera vez)
chmod +x fix-pdf-reader-todo.sh

# Ejecútalo
./fix-pdf-reader-todo.sh
```

### 2️⃣ Espera

El script tardará aproximadamente **45-60 segundos**:
- ⏳ Aplicando cambios... (10s)
- ⏳ Migraciones... (10s)
- ⏳ Reiniciando backend... (10s)
- ⏳ Reiniciando frontend... (20s)
- ⏳ Verificando... (5s)

### 3️⃣ Prueba

```bash
# El script te mostrará una URL como esta:
# http://localhost:3000/reader/1

# 1. Abre esa URL en tu navegador
# 2. Presiona Ctrl+Shift+R (hard refresh)
# 3. ¡Listo! El PDF debería cargar
```

---

## ✅ ¿Funcionó?

Si ves el PDF cargando → **¡Éxito! ✨**

Si ves errores → Revisa:

```bash
# Logs del frontend
docker compose logs frontend --tail=30

# Logs del backend
docker compose logs backend --tail=30

# Estado de contenedores
docker compose ps
```

---

## 🆘 Ayuda Rápida

| Problema | Solución |
|----------|----------|
| "Permission denied" | `chmod +x *.sh` |
| "docker: command not found" | Inicia Docker Desktop |
| Cambios no se ven | Hard refresh: Ctrl+Shift+R |
| Aún hay errores | Lee [SCRIPTS_PDF_READER_README.md](./SCRIPTS_PDF_READER_README.md) |

---

## 📚 Documentación Completa

- 📖 [SCRIPTS_PDF_READER_README.md](./SCRIPTS_PDF_READER_README.md) - Guía completa de scripts
- 🔧 [SOLUCION_ERROR_PDF_READER.md](./SOLUCION_ERROR_PDF_READER.md) - Solución detallada técnica
- 🔍 [DIAGNOSTICO_ERROR_READING.md](./DIAGNOSTICO_ERROR_READING.md) - Diagnóstico paso a paso

---

**¿Listo? Ejecuta:** `./fix-pdf-reader-todo.sh` 🚀
