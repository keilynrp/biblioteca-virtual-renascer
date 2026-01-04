#!/bin/bash

echo "========================================"
echo "  SOLUCIONANDO ERROR apt_pkg"
echo "========================================"
echo ""

# Este error es común en WSL/Ubuntu y no afecta la funcionalidad principal
# Solo afecta el comando command-not-found

echo "El error 'ModuleNotFoundError: No module named apt_pkg' es común"
echo "en WSL/Ubuntu y NO afecta la instalación de paquetes."
echo ""
echo "Opciones de solución:"
echo ""
echo "1. Ignorarlo (recomendado) - No afecta funcionalidad"
echo "2. Desactivar cnf-update-db"
echo "3. Reinstalar python3-apt"
echo ""
echo -n "Selecciona una opción (1/2/3): "
read -r option

case $option in
    1)
        echo ""
        echo "✓ Correcto. Este error no afecta apt-get install."
        echo "Puedes continuar con la instalación de Docker Compose."
        echo ""
        ;;

    2)
        echo ""
        echo "Desactivando cnf-update-db..."
        sudo chmod -x /usr/lib/cnf-update-db 2>/dev/null
        echo "✓ Desactivado. El error ya no aparecerá."
        echo ""
        ;;

    3)
        echo ""
        echo "Reinstalando python3-apt..."

        # Detectar versión de Python
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
        echo "Versión de Python: $PYTHON_VERSION"

        # Reinstalar python3-apt
        sudo apt-get remove -y python3-apt
        sudo apt-get install -y python3-apt

        echo "✓ Reinstalado."
        echo ""
        ;;

    *)
        echo "Opción inválida"
        exit 1
        ;;
esac

echo "Puedes continuar con:"
echo "  chmod +x instalar-docker-compose-v2.sh"
echo "  ./instalar-docker-compose-v2.sh"
echo ""
