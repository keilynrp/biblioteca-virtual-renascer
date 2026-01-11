# 🐳 Guía de Instalación de Docker en Windows

Docker no está instalado en tu sistema. Necesitas instalarlo para poder usar los contenedores.

## 📦 Opción 1: Docker Desktop (RECOMENDADO para Windows)

### Requisitos:
- Windows 10/11 64-bit: Pro, Enterprise o Education (Build 19041 o superior)
- O Windows 10/11 Home con WSL 2
- Virtualización habilitada en BIOS

### Pasos de instalación:

1. **Descargar Docker Desktop:**
   - Ve a: https://www.docker.com/products/docker-desktop/
   - Descarga: "Docker Desktop for Windows"

2. **Instalar:**
   - Ejecuta el instalador descargado
   - Acepta la configuración predeterminada
   - **Importante:** Marca "Use WSL 2 instead of Hyper-V" (si está disponible)
   - Reinicia tu computadora cuando se te solicite

3. **Verificar instalación:**
   Abre PowerShell o CMD y ejecuta:
   ```cmd
   docker --version
   docker-compose --version
   ```

4. **Iniciar Docker Desktop:**
   - Busca "Docker Desktop" en el menú de inicio
   - Espera a que el icono de Docker en la bandeja del sistema muestre "Docker Desktop is running"

---

## 🐧 Opción 2: Usar WSL 2 con Docker (Alternativa)

Si ya tienes WSL 2 instalado, puedes instalar Docker dentro de WSL:

### En PowerShell como Administrador:

```powershell
# Habilitar WSL 2 (si no lo tienes)
wsl --install

# Reiniciar la computadora
```

### Después del reinicio, en WSL (Ubuntu):

```bash
# Actualizar paquetes
sudo apt-get update

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt-get install docker-compose-plugin

# Verificar
docker --version
docker compose version
```

---

## ✅ Después de instalar Docker

Una vez instalado Docker Desktop o Docker en WSL, puedes usar estos scripts:

### Usando Windows (con Docker Desktop):

```bash
# Levantar contenedores
bash start_containers_v1.sh

# O usar comandos directos
docker-compose up -d

# Ver estado
docker-compose ps
```

### Usando WSL:

```bash
# Navegar al proyecto
cd /mnt/d/bvs_framework

# Levantar contenedores
./start_containers_v1.sh

# O comandos rápidos
./docker_commands_v1.sh start
```

---

## 🛠️ Verificación de Docker

Después de instalar, verifica que todo funcione:

```bash
# Verificar Docker
docker --version

# Verificar Docker Compose
docker-compose --version

# Probar Docker
docker run hello-world

# Si todo está bien, deberías ver:
# "Hello from Docker!"
```

---

## 📋 Configuración Recomendada de Docker Desktop

1. **Abrir Docker Desktop → Settings:**

2. **Resources → Advanced:**
   - CPUs: Al menos 4
   - Memory: Al menos 8 GB
   - Swap: 2 GB
   - Disk image size: 60 GB

3. **Docker Engine:**
   Agregar esta configuración para mejor rendimiento:
   ```json
   {
     "builder": {
       "gc": {
         "defaultKeepStorage": "20GB",
         "enabled": true
       }
     },
     "experimental": false,
     "features": {
       "buildkit": true
     }
   }
   ```

4. **Apply & Restart**

---

## 🚨 Solución de Problemas Comunes

### Error: "WSL 2 installation is incomplete"

```powershell
# En PowerShell como Administrador
wsl --update
wsl --set-default-version 2
```

### Error: "Hardware assisted virtualization and data execution protection must be enabled in the BIOS"

1. Reinicia tu PC
2. Entra al BIOS/UEFI (usualmente presionando F2, F10, F12 o Del al iniciar)
3. Busca "Virtualization Technology" o "VT-x" o "AMD-V"
4. Habilítalo
5. Guarda y reinicia

### Docker Desktop no inicia

1. Verifica que Hyper-V o WSL 2 estén habilitados
2. Reinicia Docker Desktop
3. Reinicia tu computadora
4. Verifica antivirus (puede bloquear Docker)

### Error: "Cannot connect to the Docker daemon"

```bash
# Verifica que Docker Desktop esté corriendo
# Busca el icono de Docker en la bandeja del sistema

# Si está corriendo, intenta:
docker context use default
```

---

## 🎯 Una vez instalado Docker

Regresa a ejecutar los scripts:

```bash
# Script completo para levantar todo
./start_containers_v1.sh

# O comandos individuales
./docker_commands_v1.sh start
./docker_commands_v1.sh logs backend
./docker_commands_v1.sh migrate
```

---

## 📚 Recursos Adicionales

- [Documentación oficial de Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
- [Guía de WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Nota:** Docker Desktop incluye Docker Compose automáticamente, por lo que no necesitas instalarlo por separado.
