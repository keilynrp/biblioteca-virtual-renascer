# Guía de Downgrade de Python 3.13 a 3.12

Esta guía te ayudará a hacer downgrade de Python 3.13 a Python 3.12 para resolver problemas de estabilidad en el proyecto.

## 🚨 ¿Por qué hacer downgrade?

Python 3.13 es muy nuevo y tiene problemas conocidos:
- Crashes en Windows (`Fatal Python error: _PyEval_EvalFrameDefault`)
- Incompatibilidades con algunas librerías
- Bugs no resueltos en el runtime

Python 3.12 es la versión estable recomendada actualmente.

---

## 📋 Scripts Disponibles

| Script | Descripción | Sistema |
|--------|-------------|---------|
| `downgrade_python.sh` | Downgrade completo con soporte para múltiples distribuciones Linux | Linux (Ubuntu/Debian/RedHat/CentOS) |
| `downgrade_python_wsl.sh` | Optimizado para Windows Subsystem for Linux | WSL/Ubuntu |
| `setup_python_env.sh` | Reinstala dependencias después del downgrade | Linux/WSL/macOS |
| `fix_apt_error.sh` | Soluciona el error de apt_pkg en Docker | Docker/Linux |

---

## 🔧 Instrucciones por Sistema Operativo

### Windows (Recomendado: Opción A - Instalador Manual)

**Opción A: Instalador oficial (Más fácil)**

1. **Descarga Python 3.12.12:**
   - Ir a: https://www.python.org/downloads/release/python-31212/
   - Descargar: "Windows installer (64-bit)"

2. **Desinstalar Python 3.13:**
   - Configuración → Aplicaciones
   - Buscar "Python 3.13.2"
   - Desinstalar

3. **Instalar Python 3.12:**
   - Ejecutar el instalador descargado
   - ✅ **IMPORTANTE:** Marcar "Add Python 3.12 to PATH"
   - Click "Install Now"

4. **Verificar:**
   ```cmd
   python --version
   ```
   Debería mostrar: `Python 3.12.12`

5. **Reinstalar dependencias:**
   ```cmd
   cd backend
   pip install -r requirements.txt
   ```

**Opción B: Usar WSL (Windows Subsystem for Linux)**

Si tienes WSL instalado, puedes usar el script automatizado:

```bash
# Abrir WSL/Ubuntu
wsl

# Navegar al proyecto
cd /mnt/d/bvs_framework

# Dar permisos de ejecución
chmod +x downgrade_python_wsl.sh setup_python_env.sh

# Ejecutar downgrade
./downgrade_python_wsl.sh

# Configurar entorno
./setup_python_env.sh
```

---

### Linux (Ubuntu/Debian)

```bash
# Dar permisos de ejecución
chmod +x downgrade_python.sh setup_python_env.sh

# Ejecutar downgrade
./downgrade_python.sh

# Configurar entorno y reinstalar dependencias
./setup_python_env.sh
```

---

### Linux (RedHat/CentOS/Fedora)

El script `downgrade_python.sh` detecta automáticamente tu distribución:

```bash
chmod +x downgrade_python.sh setup_python_env.sh
./downgrade_python.sh
./setup_python_env.sh
```

---

### macOS

**Con Homebrew:**

```bash
# Desinstalar Python 3.13
brew uninstall python@3.13

# Instalar Python 3.12
brew install python@3.12
brew link --overwrite python@3.12

# Verificar
python3 --version

# Reinstalar dependencias
cd backend
pip3 install -r requirements.txt
```

**O usar el script automático:**

```bash
chmod +x downgrade_python.sh setup_python_env.sh
./downgrade_python.sh
./setup_python_env.sh
```

---

## 🐳 Alternativa: Usar Docker (No requiere cambiar Python local)

Si no quieres tocar tu instalación local de Python, usa Docker:

```bash
# Construir el contenedor
docker-compose build backend

# Iniciar el backend
docker-compose up backend
```

El Dockerfile ya está configurado con Python 3.13-slim (versión Linux estable) y el fix de apt_pkg.

---

## ✅ Verificación Post-Instalación

Después de hacer el downgrade, verifica que todo funcione:

```bash
# 1. Verificar versión de Python
python3 --version
# Debería mostrar: Python 3.12.x

# 2. Verificar pip
pip3 --version

# 3. Navegar al backend
cd backend

# 4. Verificar Django
python manage.py check

# 5. Ejecutar migraciones (si es necesario)
python manage.py migrate

# 6. Iniciar servidor
python manage.py runserver
```

---

## 🛠️ Solución de Problemas

### Error: "command not found: python3"

```bash
# Linux/WSL
sudo ln -sf /usr/bin/python3.12 /usr/bin/python3

# Windows - Reinstala Python y marca "Add to PATH"
```

### Error: "No module named 'apt_pkg'" (en Docker)

```bash
# Ejecutar dentro del contenedor
docker exec -it <container_name> bash
./fix_apt_error.sh
```

### Error: "ModuleNotFoundError: No module named 'magic'"

```bash
# Windows
pip install python-magic python-magic-bin

# Linux/macOS
pip install python-magic
sudo apt-get install libmagic1  # Linux
brew install libmagic  # macOS
```

### Servidor no inicia después del downgrade

```bash
# Limpiar caché de Python
cd backend
find . -type d -name __pycache__ -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

# Reinstalar dependencias
pip install -r requirements.txt

# Verificar
python manage.py check
```

---

## 📚 Recursos Adicionales

- [Python 3.12 Releases](https://www.python.org/downloads/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Docker Documentation](https://docs.docker.com/)
- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)

---

## 🆘 ¿Necesitas Ayuda?

Si encuentras problemas:

1. Verifica los logs de error completos
2. Asegúrate de estar usando la versión correcta de Python
3. Limpia el caché de Python y reinstala dependencias
4. Considera usar Docker como alternativa

---

## 📝 Notas

- Los scripts requieren permisos de superusuario (sudo) en Linux
- En Windows, el instalador puede requerir permisos de administrador
- Los entornos virtuales (venv) deben recrearse después del downgrade
- Las dependencias del proyecto deben reinstalarse

---

**Última actualización:** 2026-01-08
