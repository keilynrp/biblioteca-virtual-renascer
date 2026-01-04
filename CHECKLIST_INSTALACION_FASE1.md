# ✅ Checklist de Instalación - Fase 1: Validación de PDFs

## 📋 Instrucciones

Marca cada item cuando lo completes usando `[x]` en lugar de `[ ]`

---

## 🔧 Pre-requisitos

- [ ] Docker está instalado y corriendo
- [ ] Los contenedores del proyecto están activos (`docker compose up`)
- [ ] Tienes acceso al backend container
- [ ] El frontend está accesible en http://localhost:3000

---

## 📦 Instalación

### Opción A: Instalación Automática (Recomendado)

- [ ] **Windows**: Ejecutar `INSTALL_VALIDATORS.bat`
- [ ] **Linux/Mac**: Ejecutar `chmod +x install-validators.sh && ./install-validators.sh`

⚠️ **Nota**: Este proceso rebuildeará el contenedor backend (puede tomar 5-10 minutos)

### Opción B: Instalación Manual

Si prefieres hacerlo paso a paso:

#### 1. Rebuild Backend Container

```bash
docker compose build backend
```

- [ ] Build completado sin errores
- [ ] Libmagic instalado en el contenedor

#### 2. Reiniciar Backend

```bash
docker compose up -d backend
```

- [ ] Backend reiniciado
- [ ] Esperado 10 segundos para que inicie

#### 3. Verificar python-magic

```bash
docker compose exec backend python -c "import magic; print('OK')"
```

- [ ] Imprime "OK" sin errores

#### 4. Crear Migraciones

```bash
docker compose exec backend python manage.py makemigrations content
```

- [ ] Migraciones creadas
- [ ] No hay errores

#### 5. Aplicar Migraciones

```bash
docker compose exec backend python manage.py migrate
```

- [ ] Migraciones aplicadas correctamente

---

## ✅ Verificación

### 1. Verificar Instalación de Dependencias

```bash
docker compose exec backend python -c "import magic; print('✅ python-magic instalado correctamente')"
```

- [ ] Imprime mensaje de éxito
- [ ] No hay errores de importación

### 2. Verificar Migraciones

```bash
docker compose exec backend python manage.py showmigrations content
```

- [ ] Todas las migraciones muestran `[X]`
- [ ] No hay migraciones pendientes

### 3. Ejecutar Tests

```bash
docker compose exec backend pytest apps/content/tests/test_validators.py -v
```

- [ ] Todos los tests pasan (verde)
- [ ] No hay fallos o errores

### 4. Verificar Configuración

```bash
docker compose exec backend python manage.py shell -c "from apps.content.validators import validate_pdf_file; print('✅ Validadores cargados')"
```

- [ ] Imprime mensaje de éxito
- [ ] No hay errores de importación

---

## 🧪 Prueba Manual

### Test 1: Upload de PDF Válido

1. Ir a: http://localhost:3000/admin/books
2. Click en "Nuevo Libro"
3. Llenar campos requeridos
4. Subir un PDF válido < 50MB

- [ ] PDF subido exitosamente
- [ ] No hay errores en consola
- [ ] Archivo visible en libro creado

### Test 2: Rechazo de PDF Grande

1. Intentar subir un PDF > 50MB
2. Observar mensaje de error

- [ ] Upload rechazado
- [ ] Mensaje indica "tamaño máximo: 50MB"
- [ ] No se crea el libro

### Test 3: Rechazo de Archivo No-PDF

1. Renombrar un archivo .txt a .pdf
2. Intentar subirlo

- [ ] Upload rechazado
- [ ] Mensaje indica "tipo de archivo no permitido"
- [ ] No se crea el libro

### Test 4: Sanitización de Nombre

1. Subir PDF con nombre: `../../../Mi Libro (2024).pdf`
2. Verificar nombre guardado

- [ ] Nombre sanitizado correctamente
- [ ] No contiene `../`
- [ ] Caracteres especiales reemplazados

---

## 🔍 Troubleshooting

### Si python-magic no se instala:

```bash
docker compose exec backend pip uninstall python-magic python-magic-bin -y
docker compose exec backend pip install --no-cache-dir python-magic python-magic-bin
docker compose restart backend
```

- [ ] Problema resuelto

### Si las migraciones fallan:

```bash
# Ver el error completo
docker compose exec backend python manage.py makemigrations content --verbosity 3

# Si hay conflictos, listar todas las migraciones
docker compose exec backend python manage.py showmigrations
```

- [ ] Error identificado
- [ ] Solución aplicada

### Si los tests fallan:

```bash
# Ejecutar tests con más detalle
docker compose exec backend pytest apps/content/tests/test_validators.py -vvs

# Verificar que pytest está instalado
docker compose exec backend pip install pytest pytest-django
```

- [ ] Tests pasan correctamente

---

## 📊 Estado Final

Verifica que TODOS estos items estén completos:

- [ ] ✅ python-magic instalado
- [ ] ✅ python-magic-bin instalado
- [ ] ✅ Migraciones creadas
- [ ] ✅ Migraciones aplicadas
- [ ] ✅ Backend reiniciado
- [ ] ✅ Tests pasan
- [ ] ✅ Validadores importan sin errores
- [ ] ✅ Upload de PDF válido funciona
- [ ] ✅ Rechazo de PDF grande funciona
- [ ] ✅ Rechazo de archivo no-PDF funciona
- [ ] ✅ Sanitización de nombres funciona

---

## 🎉 ¡Completado!

Si todos los items están marcados, **la Fase 1 está instalada y funcionando correctamente**.

### Próximos Pasos:

1. Leer [VALIDACION_PDF_DOCUMENTACION.md](VALIDACION_PDF_DOCUMENTACION.md) para detalles completos
2. Revisar [FASE1_RESUMEN_VALIDACIONES.md](FASE1_RESUMEN_VALIDACIONES.md) para el resumen ejecutivo
3. Prepararse para **Fase 2: Sistema de Permisos Premium**

---

## 📞 ¿Necesitas Ayuda?

Si algún paso falló:

1. Revisa los logs: `docker compose logs backend --tail=100`
2. Consulta la sección Troubleshooting arriba
3. Revisa [VALIDACION_PDF_DOCUMENTACION.md](VALIDACION_PDF_DOCUMENTACION.md) sección "Troubleshooting"

---

**Última Actualización:** 2026-01-02
**Versión:** 1.0.0
