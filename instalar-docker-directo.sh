#!/bin/bash

echo "============================================================"
echo "Instalando Docker Engine en WSL (sin Docker Desktop)"
echo "============================================================"
echo ""

# Verificar que estamos en WSL
if ! grep -qi microsoft /proc/version 2>/dev/null; then
    echo "ERROR: Este script debe ejecutarse en WSL, no en Git Bash."
    echo ""
    echo "Para abrir WSL:"
    echo "  1. Presiona Windows + R"
    echo "  2. Escribe: wsl"
    echo "  3. Presiona Enter"
    echo "  4. Ejecuta: cd /mnt/d/bvs_framework && bash instalar-docker-directo.sh"
    exit 1
fi

echo "Detectado: WSL - Procediendo con la instalacion..."
echo ""

# Paso 1: Actualizar paquetes
echo "[1/7] Actualizando lista de paquetes..."
sudo apt-get update -qq

# Paso 2: Instalar dependencias
echo "[2/7] Instalando dependencias necesarias..."
sudo apt-get install -y -qq \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    apt-transport-https \
    software-properties-common

# Paso 3: Agregar clave GPG de Docker
echo "[3/7] Agregando clave GPG de Docker..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Paso 4: Agregar repositorio de Docker
echo "[4/7] Agregando repositorio de Docker..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Paso 5: Actualizar lista de paquetes nuevamente
echo "[5/7] Actualizando lista de paquetes..."
sudo apt-get update -qq

# Paso 6: Instalar Docker Engine
echo "[6/7] Instalando Docker Engine y Docker Compose..."
sudo apt-get install -y -qq \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

# Paso 7: Configurar permisos
echo "[7/7] Configurando permisos de usuario..."
sudo usermod -aG docker $USER

# Intentar iniciar Docker
echo ""
echo "Iniciando servicio Docker..."
sudo service docker start

# Verificar instalación
echo ""
echo "============================================================"
echo "Verificando instalacion..."
echo "============================================================"
echo ""

if docker --version 2>/dev/null; then
    echo "OK Docker instalado:"
    docker --version
    echo ""
    docker compose version
    echo ""
    echo "============================================================"
    echo "Instalacion completada exitosamente!"
    echo "============================================================"
    echo ""
    echo "IMPORTANTE:"
    echo "1. Cierra esta ventana de WSL"
    echo "2. Vuelve a abrir WSL (escribe 'wsl' en PowerShell)"
    echo "3. Ejecuta estos comandos:"
    echo ""
    echo "   sudo service docker start"
    echo "   cd /mnt/d/bvs_framework"
    echo "   ./iniciar-sprint6.sh"
    echo ""
    echo "NOTA: Cada vez que abras WSL, debes ejecutar:"
    echo "      sudo service docker start"
    echo ""
    echo "Para que se inicie automaticamente, ejecuta:"
    echo "      echo 'sudo service docker start' >> ~/.bashrc"
    echo ""
else
    echo "ERROR: Docker no se instalo correctamente."
    echo "Por favor, revisa los mensajes de error arriba."
fi

echo ""
