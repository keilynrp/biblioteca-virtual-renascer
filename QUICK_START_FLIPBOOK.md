# 🚀 Inicio Rápido - Flipbook Preview

Esta guía te ayudará a iniciar el servidor de desarrollo para probar la nueva funcionalidad de Vista Previa Flipbook.

---

## 📋 Requisitos Previos

- ✅ Node.js instalado (v18+)
- ✅ npm o yarn
- ✅ Proyecto clonado y dependencias instaladas (`npm install`)

---

## 🖥️ Para Windows

### Ejecutar el script automático:

```bash
START_FRONTEND_DEV.bat
```

O manualmente:

```bash
cd frontend
npm run dev
```

---

## 🐧 Para Linux / macOS

### Ejecutar el script automático:

```bash
./START_FRONTEND_DEV.sh
```

**Si obtienes error de permisos**:

```bash
chmod +x START_FRONTEND_DEV.sh
./START_FRONTEND_DEV.sh
```

O manualmente:

```bash
# Limpiar procesos anteriores
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
rm -f frontend/.next/dev/lock

# Iniciar servidor
cd frontend
npm run dev
```

---

## 🌐 Acceder al Servidor

Una vez iniciado, el servidor estará disponible en:

- **Local**: http://localhost:3000
- **Network**: http://[tu-ip]:3000

---

## ✅ Verificar que Funciona

### 1. Abrir la biblioteca
```
http://localhost:3000/library
```

### 2. Verificar el badge
- Hacer **hover** sobre la portada de un libro
- Debe aparecer el badge verde **"LEER AHORA"** en la parte inferior

### 3. Ver la vista previa
- **Click** en un libro para abrir el detalle
- **Scroll down** hasta la sección "Vista Previa del Libro"
- Debe mostrar las primeras 10 páginas del PDF

### 4. Probar navegación
- Usar los botones **◀️ Anterior** y **Siguiente ▶️**
- O usar las flechas del teclado **←** **→**

### 5. Ver el CTA final
- Navegar hasta la **página 10**
- Debe aparecer el mensaje "¿Te gusta lo que has visto?"
- Botón **"Leer libro completo"**

---

## ⚠️ Problemas Comunes

### Puerto 3000 en uso

**Windows**:
```bash
# Buscar proceso en puerto 3000
netstat -ano | findstr :3000

# Matar proceso (reemplaza <PID> con el número)
taskkill /PID <PID> /F
```

**Linux/macOS**:
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

### Lock file bloqueado

**Windows**:
```bash
del /F /Q frontend\.next\dev\lock
```

**Linux/macOS**:
```bash
rm -f frontend/.next/dev/lock
```

### Dependencias faltantes

```bash
cd frontend
npm install
```

---

## 📚 Documentación Adicional

- **[TEST_FLIPBOOK_GUIDE.md](TEST_FLIPBOOK_GUIDE.md)** - Guía completa de testing
- **[FLIPBOOK_PREVIEW_IMPLEMENTATION.md](FLIPBOOK_PREVIEW_IMPLEMENTATION.md)** - Documentación técnica

---

## 🎯 Checklist Rápido

- [ ] Servidor iniciado en puerto 3000
- [ ] Biblioteca accesible en /library
- [ ] Badge "LEER AHORA" aparece en hover
- [ ] Vista previa se muestra en detalle del libro
- [ ] Navegación con botones funciona
- [ ] Navegación con teclado funciona
- [ ] CTA aparece en página 10

---

## 💡 Tips

### Reiniciar Rápido (Windows)
```bash
START_FRONTEND_DEV.bat
```

### Reiniciar Rápido (Linux/macOS)
```bash
./START_FRONTEND_DEV.sh
```

### Ver Logs en Tiempo Real
Los logs aparecen automáticamente en la terminal donde ejecutaste el script.

### Detener el Servidor
Presiona **Ctrl + C** en la terminal

---

## 🐛 ¿Encontraste un Bug?

Reporta usando este formato:

```markdown
**Descripción**: [Breve descripción del problema]
**Pasos para reproducir**:
1. Paso 1
2. Paso 2
3. Paso 3

**Resultado esperado**: [Qué debería pasar]
**Resultado actual**: [Qué pasa]
**Screenshot**: [Si aplica]
**Navegador**: [Chrome, Firefox, etc.]
**OS**: [Windows, Linux, macOS]
```

---

## ✨ ¡Listo!

Una vez que el servidor esté corriendo, disfruta explorando la nueva funcionalidad de Vista Previa Flipbook estilo Scribd/Amazon.

**Happy Testing!** 🎉

---

**Creado**: 01 de Enero de 2026
**Versión**: 1.0
**Scripts Disponibles**:
- `START_FRONTEND_DEV.bat` (Windows)
- `START_FRONTEND_DEV.sh` (Linux/macOS)
