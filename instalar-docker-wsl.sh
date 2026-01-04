#!/bin/bash

echo "============================================================"
echo "Script para Instalar Docker Engine en WSL"
echo "============================================================"
echo ""
echo "Este script debe ejecutarse dentro de WSL, no en Git Bash."
echo ""
echo "Pasos:"
echo "1. Abre una terminal de WSL (Ubuntu)"
echo "2. Navega a: cd /mnt/d/bvs_framework"
echo "3. Ejecuta: bash instalar-docker-wsl.sh"
echo ""
echo "============================================================"
echo "Instrucciones de Instalación Manual"
echo "============================================================"
echo ""
echo "Ejecuta estos comandos en WSL (Ubuntu):"
echo ""
echo "# 1. Descargar script de instalación de Docker"
echo "curl -fsSL https://get.docker.com -o get-docker.sh"
echo ""
echo "# 2. Ejecutar instalación"
echo "sudo sh get-docker.sh"
echo ""
echo "# 3. Agregar tu usuario al grupo docker"
echo "sudo usermod -aG docker \$USER"
echo ""
echo "# 4. Iniciar servicio Docker"
echo "sudo service docker start"
echo ""
echo "# 5. Verificar instalación"
echo "docker --version"
echo "docker compose version"
echo ""
echo "# 6. Ejecutar scripts del proyecto"
echo "cd /mnt/d/bvs_framework"
echo "./iniciar-sprint6.sh"
echo ""
echo "============================================================"
echo ""

# Si estamos en WSL, ejecutar instalación
if grep -qi microsoft /proc/version 2>/dev/null; then
    echo "Detectado: WSL"
    echo ""
    read -p "¿Deseas instalar Docker Engine ahora? (s/n): " respuesta

    if [[ "$respuesta" =~ ^[Ss]$ ]]; then
        echo ""
        echo "Instalando Docker Engine..."
        echo ""

        # Descargar script
        curl -fsSL https://get.docker.com -o /tmp/get-docker.sh

        # Ejecutar instalación
        sudo sh /tmp/get-docker.sh

        # Agregar usuario al grupo docker
        sudo usermod -aG docker $USER

        # Iniciar Docker
        sudo service docker start

        echo ""
        echo "============================================================"
        echo "Instalación completada!"
        echo "============================================================"
        echo ""
        echo "IMPORTANTE: Cierra y vuelve a abrir WSL para que los cambios tomen efecto."
        echo ""
        echo "Luego ejecuta:"
        echo "  sudo service docker start"
        echo "  cd /mnt/d/bvs_framework"
        echo "  ./iniciar-sprint6.sh"
        echo ""
    else
        echo "Instalación cancelada."
    fi
else
    echo "No estás en WSL. Este script debe ejecutarse en WSL (Ubuntu)."
    echo ""
    echo "Para abrir WSL:"
    echo "1. Abre el menú de inicio"
    echo "2. Busca 'Ubuntu' o 'WSL'"
    echo "3. Abre la aplicación"
    echo "4. Ejecuta: cd /mnt/d/bvs_framework && bash instalar-docker-wsl.sh"
fi

echo ""
