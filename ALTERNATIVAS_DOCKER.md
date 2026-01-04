# 🐋 Alternativas a Docker Desktop (Más Ligeras)

## Problema
Docker Desktop consume muchos recursos y ralentiza la PC.

---

## ✅ Alternativas Ligeras

### **1. Podman Desktop** (Recomendado)

**Ventajas:**
- ✅ Más ligero que Docker Desktop
- ✅ Compatible con comandos de Docker (`docker` y `docker compose`)
- ✅ No requiere daemon corriendo constantemente
- ✅ Gratuito y open source
- ✅ Funciona en Windows, macOS y Linux

**Instalación:**
1. Descarga desde: https://podman-desktop.io/
2. Instala normalmente
3. Los comandos `docker` y `docker compose` funcionarán automáticamente

**Compatibilidad con este proyecto:** ✅ 100% compatible

---

### **2. Rancher Desktop** (También buena opción)

**Ventajas:**
- ✅ Ligero
- ✅ Compatible con Docker y Kubernetes
- ✅ Open source
- ✅ Consume menos RAM que Docker Desktop

**Instalación:**
1. Descarga desde: https://rancherdesktop.io/
2. Durante la instalación, elige "dockerd (moby)" como container runtime
3. Los comandos de Docker funcionarán normalmente

**Compatibilidad con este proyecto:** ✅ 100% compatible

---

### **3. Colima (Solo macOS/Linux)**

Para usuarios de macOS o Linux con WSL.

**Instalación en WSL:**
```bash
# Instalar colima
brew install colima docker docker-compose

# Iniciar colima
colima start

# Usar docker normalmente
docker ps
```

**No disponible para Windows nativo.**

---

### **4. WSL 2 + Docker Engine (Sin Docker Desktop)**

Instalar Docker directamente en WSL sin usar Docker Desktop.

**Ventajas:**
- ✅ Más ligero
- ✅ Gratuito
- ✅ No consume recursos cuando no lo usas

**Instalación en WSL (Ubuntu):**

```bash
# 1. Actualizar paquetes
sudo apt-get update

# 2. Instalar dependencias
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 3. Agregar repositorio de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Instalar Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Agregar tu usuario al grupo docker
sudo usermod -aG docker $USER

# 6. Iniciar Docker
sudo service docker start

# 7. Verificar instalación
docker --version
docker compose version
```

**Usar Docker en WSL:**
```bash
# Iniciar Docker (cada vez que abras WSL)
sudo service docker start

# O agregar al .bashrc para que inicie automáticamente
echo 'sudo service docker start' >> ~/.bashrc
```

**Luego usar los scripts .sh:**
```bash
cd /mnt/d/bvs_framework
./iniciar-sprint6.sh
```

---

### **5. Ejecutar Servicios Nativamente (Sin Docker)**

Si Docker es demasiado pesado, puedes ejecutar los servicios directamente en Windows.

**Necesitarías instalar:**
- PostgreSQL para Windows
- Elasticsearch para Windows
- Python + Django
- Node.js + Next.js

**Ventajas:**
- ✅ Muy ligero
- ✅ No necesitas Docker

**Desventajas:**
- ❌ Configuración más compleja
- ❌ Posibles conflictos de versiones
- ❌ Más difícil de mantener

---

## 📊 Comparación de Recursos

| Solución | RAM Usada | CPU | Complejidad |
|----------|-----------|-----|-------------|
| Docker Desktop | ~2-4 GB | Alta | Baja |
| Podman Desktop | ~1-2 GB | Media | Baja |
| Rancher Desktop | ~1-2 GB | Media | Baja |
| WSL + Docker Engine | ~500 MB - 1 GB | Baja | Media |
| Servicios Nativos | ~300-500 MB | Muy Baja | Alta |

---

## 🎯 Recomendación para tu Caso

### **Opción A: Podman Desktop** (Más fácil)
1. Desinstala Docker Desktop
2. Instala Podman Desktop: https://podman-desktop.io/
3. Ejecuta: `.\iniciar-sprint6.ps1` (funcionará igual)

### **Opción B: WSL + Docker Engine** (Más ligero)
1. Sigue la guía de instalación arriba
2. Usa los scripts `.sh` en WSL:
   ```bash
   cd /mnt/d/bvs_framework
   ./iniciar-sprint6.sh
   ```

### **Opción C: Rancher Desktop** (Alternativa)
1. Instala Rancher Desktop: https://rancherdesktop.io/
2. Selecciona "dockerd (moby)" durante la instalación
3. Ejecuta: `.\iniciar-sprint6.ps1`

---

## ⚡ La Más Rápida: Podman Desktop

**Pasos:**
1. Ve a: https://podman-desktop.io/downloads
2. Descarga la versión para Windows
3. Instala (siguiente, siguiente, finalizar)
4. Abre PowerShell y ejecuta:
   ```powershell
   cd d:\bvs_framework
   .\iniciar-sprint6.ps1
   ```

Los comandos `docker` y `docker compose` funcionarán automáticamente con Podman.

---

## 🔧 Si Quieres Mantener Docker Desktop pero Reducir Consumo

Puedes configurar Docker Desktop para usar menos recursos:

1. Abre Docker Desktop
2. Settings → Resources
3. Reduce:
   - **CPUs**: Baja a 2 CPUs
   - **Memory**: Baja a 2 GB
   - **Swap**: Baja a 1 GB
4. Apply & Restart

Esto hará que Docker Desktop consuma menos recursos.

---

## 📚 Enlaces Útiles

- **Podman Desktop**: https://podman-desktop.io/
- **Rancher Desktop**: https://rancherdesktop.io/
- **Docker Engine en WSL**: https://docs.docker.com/engine/install/ubuntu/
- **Comparación**: https://www.docker.com/blog/comparing-docker-desktop-to-alternatives/

---

**¿Cuál prefieres probar primero?**
