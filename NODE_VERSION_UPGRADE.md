# ⚠️ Actualización Requerida: Node.js

## 🚨 Problema Detectado

**Versión Actual**: Node.js 18.19.1
**Versión Requerida**: Node.js >= 20.9.0
**Razón**: Next.js 16.1.0 requiere Node.js 20+

---

## 🔧 Soluciones

### Opción 1: Actualizar Node.js (RECOMENDADO)

#### Para Windows:

**Método A: Descargar Instalador Oficial**
1. Ir a: https://nodejs.org/
2. Descargar la versión **LTS** (Long Term Support) - Actualmente v20.x o v22.x
3. Ejecutar el instalador
4. Reiniciar la terminal
5. Verificar: `node --version` (debe mostrar >= 20.9.0)

**Método B: Usar Instalador MSI**
```bash
# Descargar desde:
https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi

# Instalar y verificar
node --version
npm --version
```

**Método C: Usar Chocolatey (si lo tienes instalado)**
```powershell
# PowerShell como Administrador
choco upgrade nodejs-lts -y

# Verificar
node --version
```

#### Para Linux:

**Usando nvm (Node Version Manager) - RECOMENDADO**
```bash
# Instalar nvm (si no lo tienes)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar shell
source ~/.bashrc  # o source ~/.zshrc

# Instalar Node.js 20 LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verificar
node --version
```

**Usando NodeSource**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
```

#### Para macOS:

**Usando Homebrew**
```bash
# Actualizar Homebrew
brew update

# Instalar Node.js 20
brew install node@20

# Vincular la versión
brew link --overwrite node@20

# Verificar
node --version
```

**Usando nvm (Recomendado)**
```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recargar shell
source ~/.zshrc  # o source ~/.bash_profile

# Instalar Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verificar
node --version
```

---

### Opción 2: Downgrade de Next.js (NO RECOMENDADO)

Si por alguna razón NO puedes actualizar Node.js, puedes usar una versión anterior de Next.js compatible con Node 18:

```bash
cd frontend

# Desinstalar Next.js 16
npm uninstall next

# Instalar Next.js 14 (compatible con Node 18)
npm install next@14.2.18

# Nota: Perderás algunas features de Next.js 16
```

**⚠️ Advertencia**: Esta opción puede causar:
- Pérdida de features de Next.js 16
- Posibles incompatibilidades con React 19
- Problemas con Turbopack

---

### Opción 3: Usar Docker (Alternativa)

Si no quieres cambiar tu Node.js global, puedes usar Docker:

```bash
# Usar Docker Compose (ya configurado en el proyecto)
docker compose up frontend

# O crear un contenedor específico
docker run -it --rm \
  -v ${PWD}/frontend:/app \
  -w /app \
  -p 3000:3000 \
  node:20-alpine \
  sh -c "npm install && npm run dev"
```

---

## ✅ Verificar la Instalación

Después de actualizar Node.js, verifica:

```bash
# Versión de Node.js (debe ser >= 20.9.0)
node --version

# Versión de npm (se actualiza automáticamente)
npm --version

# Limpiar caché y reinstalar dependencias
cd frontend
rm -rf node_modules package-lock.json
npm install

# Intentar iniciar el servidor
npm run dev
```

---

## 🎯 Versiones Recomendadas (2026)

| Herramienta | Versión Mínima | Versión Recomendada |
|-------------|----------------|---------------------|
| Node.js | 20.9.0 | 20.11.0+ (LTS) |
| npm | 10.0.0 | 10.2.4+ |
| Next.js | 16.1.0 | 16.1.0 (actual) |
| React | 19.0.0 | 19.2.3 (actual) |

---

## 🔍 Verificar Compatibilidad

### Comando rápido para verificar todo:

```bash
echo "Node.js version:"
node --version

echo "npm version:"
npm --version

echo "Next.js version:"
cd frontend && npm list next

echo "React version:"
npm list react
```

### Output esperado:
```
Node.js version:
v20.11.0

npm version:
10.2.4

Next.js version:
next@16.1.0

React version:
react@19.2.3
```

---

## 🚀 Después de Actualizar

1. **Reinstalar dependencias**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

2. **Limpiar caché de Next.js**:
```bash
rm -rf .next
```

3. **Iniciar servidor**:
```bash
npm run dev
```

O usar el script:
```bash
# Windows
START_FRONTEND_DEV.bat

# Linux/macOS
./START_FRONTEND_DEV.sh
```

---

## ❓ FAQ

### ¿Puedo tener múltiples versiones de Node.js?

**Sí, usando nvm:**
```bash
# Instalar múltiples versiones
nvm install 18
nvm install 20
nvm install 22

# Cambiar entre versiones
nvm use 20  # Para este proyecto
nvm use 18  # Para otros proyectos

# Ver versiones instaladas
nvm list
```

### ¿La actualización afectará otros proyectos?

**Con nvm**: No, puedes cambiar de versión por proyecto.
**Sin nvm**: Sí, todos los proyectos usarán la nueva versión.

### ¿Qué hacer si el instalador falla?

1. Desinstalar Node.js actual completamente
2. Limpiar caché: `npm cache clean --force`
3. Reiniciar el sistema
4. Instalar la nueva versión

---

## 📚 Referencias

- **Node.js Official**: https://nodejs.org/
- **nvm GitHub**: https://github.com/nvm-sh/nvm
- **Next.js Requirements**: https://nextjs.org/docs/getting-started/installation

---

## ✅ Checklist de Actualización

- [ ] Verificar versión actual: `node --version`
- [ ] Descargar Node.js 20 LTS
- [ ] Instalar nueva versión
- [ ] Reiniciar terminal/sistema
- [ ] Verificar nueva versión: `node --version`
- [ ] Ir a `frontend/`
- [ ] Eliminar `node_modules` y `package-lock.json`
- [ ] Ejecutar `npm install`
- [ ] Ejecutar `npm run dev`
- [ ] Verificar que funciona en http://localhost:3000

---

**Última actualización**: 01 de Enero de 2026
**Versión requerida**: Node.js >= 20.9.0
**Versión recomendada**: Node.js 20.11.0 LTS
