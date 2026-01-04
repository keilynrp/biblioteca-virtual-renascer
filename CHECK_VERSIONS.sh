#!/bin/bash

echo "========================================"
echo "  VERIFICACION DE VERSIONES"
echo "  Biblioteca Virtual - Flipbook Preview"
echo "========================================"
echo ""

echo "[1] Node.js Version:"
node --version
NODE_VERSION=$(node --version | cut -d'v' -f2)
echo ""

echo "[2] npm Version:"
npm --version
echo ""

echo "[3] Ubicacion de Node.js:"
which node
echo ""

echo "[4] Verificando Next.js..."
cd frontend
echo "Next.js version:"
npm list next 2>/dev/null | grep "next@"
echo ""

echo "[5] Verificando React..."
echo "React version:"
npm list react 2>/dev/null | grep "react@"
echo ""

echo "========================================"
echo "  REQUISITOS"
echo "========================================"
echo "Node.js:  >= 20.9.0 (Requerido)"
echo "npm:      >= 10.0.0 (Recomendado)"
echo "Next.js:  16.1.0 (Actual)"
echo "React:    19.2.3 (Actual)"
echo ""

echo "========================================"
echo "  ESTADO"
echo "========================================"

# Extraer version mayor
MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
MINOR=$(echo $NODE_VERSION | cut -d'.' -f2)

if [ "$MAJOR" -lt 20 ]; then
    echo "[X] Node.js: DESACTUALIZADO"
    echo "    Tu version: $NODE_VERSION"
    echo "    Necesitas:  20.9.0 o superior"
    echo ""
    echo "[!] ACCION REQUERIDA:"
    echo "    Opcion 1 - Usar nvm (Recomendado):"
    echo "      nvm install 20"
    echo "      nvm use 20"
    echo "      nvm alias default 20"
    echo ""
    echo "    Opcion 2 - Instalador oficial:"
    echo "      https://nodejs.org/"
    echo ""
    echo "    Ver detalles en: NODE_VERSION_UPGRADE.md"
elif [ "$MAJOR" -eq 20 ] && [ "$MINOR" -lt 9 ]; then
    echo "[!] Node.js: VERSION MINIMA"
    echo "    Tu version: $NODE_VERSION"
    echo "    Recomendado: 20.11.0 o superior"
    echo ""
    echo "[i] OPCIONAL: Considera actualizar a 20.11.0"
else
    echo "[OK] Node.js: COMPATIBLE ✓"
    echo "    Tu version: $NODE_VERSION"
fi

echo ""
echo "========================================"
