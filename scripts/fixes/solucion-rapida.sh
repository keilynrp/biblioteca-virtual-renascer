#!/bin/bash

# Script maestro de solución rápida
# Una sola ejecución para resolver todo

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

clear

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                                ║${NC}"
echo -e "${CYAN}║        🚀 SOLUCIÓN RÁPIDA - Frontend y Backend 🚀             ║${NC}"
echo -e "${CYAN}║                                                                ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Función para test de puerto
test_port() {
    timeout 2 bash -c "echo >/dev/tcp/localhost/$1" 2>/dev/null
}

# PASO 1: Verificación inicial
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[PASO 1/4] Verificación inicial${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Probando acceso actual..."
FRONTEND_OK=0
BACKEND_OK=0

if test_port 3000; then
    echo -e "  Frontend (3000): ${GREEN}✓ Funcionando${NC}"
    FRONTEND_OK=1
else
    echo -e "  Frontend (3000): ${RED}✗ No responde${NC}"
fi

if test_port 8000; then
    echo -e "  Backend (8000):  ${GREEN}✓ Funcionando${NC}"
    BACKEND_OK=1
else
    echo -e "  Backend (8000):  ${RED}✗ No responde${NC}"
fi

echo ""

if [ $FRONTEND_OK -eq 1 ] && [ $BACKEND_OK -eq 1 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ TODO YA ESTÁ FUNCIONANDO CORRECTAMENTE${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Puedes acceder a:"
    echo -e "  ${CYAN}→${NC} Frontend:      http://localhost:3000"
    echo -e "  ${CYAN}→${NC} Backend Admin: http://localhost:8000/admin/"
    echo ""
    exit 0
fi

echo -e "${YELLOW}Necesitamos arreglar los servicios. Continuando...${NC}"
echo ""
sleep 2

# PASO 2: Aplicar solución
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[PASO 2/4] Aplicando solución automática${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Ejecutando fix-servicios-completo.sh..."
echo ""

bash fix-servicios-completo.sh

echo ""

# PASO 3: Re-verificación
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[PASO 3/4] Re-verificación${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Probando acceso nuevamente..."
sleep 2

FRONTEND_OK=0
BACKEND_OK=0

if test_port 3000; then
    echo -e "  Frontend (3000): ${GREEN}✓ Funcionando${NC}"
    FRONTEND_OK=1
else
    echo -e "  Frontend (3000): ${RED}✗ No responde${NC}"
fi

if test_port 8000; then
    echo -e "  Backend (8000):  ${GREEN}✓ Funcionando${NC}"
    BACKEND_OK=1
else
    echo -e "  Backend (8000):  ${RED}✗ No responde${NC}"
fi

echo ""

# PASO 4: Resultado final
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}[PASO 4/4] Resultado Final${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $FRONTEND_OK -eq 1 ] && [ $BACKEND_OK -eq 1 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}║               ✓✓✓ PROBLEMA RESUELTO ✓✓✓                      ║${NC}"
    echo -e "${GREEN}║                                                                ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}Ambos servicios están funcionando correctamente.${NC}"
    echo ""
    echo "Puedes acceder a:"
    echo ""
    echo -e "  ${CYAN}→${NC} Frontend:      ${MAGENTA}http://localhost:3000${NC}"
    echo -e "  ${CYAN}→${NC} Backend Admin: ${MAGENTA}http://localhost:8000/admin/${NC}"
    echo -e "  ${CYAN}→${NC} API Docs:      ${MAGENTA}http://localhost:8000/api/docs/${NC}"
    echo ""
    echo -e "${GREEN}¡Todo listo para usar! 🎉${NC}"
    echo ""
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                ║${NC}"
    echo -e "${RED}║            ⚠ Requiere Diagnóstico Profundo ⚠                 ║${NC}"
    echo -e "${RED}║                                                                ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    if [ $FRONTEND_OK -eq 0 ] && [ $BACKEND_OK -eq 0 ]; then
        echo -e "${RED}Ambos servicios siguen sin responder.${NC}"
        echo ""
        echo "Opciones:"
        echo ""
        echo -e "  ${YELLOW}1.${NC} Diagnóstico completo:"
        echo "     bash diagnostico-puertos.sh"
        echo ""
        echo -e "  ${YELLOW}2.${NC} Reset completo (reconstruir todo):"
        echo "     bash reset-completo.sh"
        echo ""
    elif [ $FRONTEND_OK -eq 0 ]; then
        echo -e "Frontend: ${RED}✗ No responde${NC}"
        echo -e "Backend:  ${GREEN}✓ Funciona${NC}"
        echo ""
        echo "Diagnóstico del frontend:"
        echo "  bash diagnostico-puertos.sh"
    else
        echo -e "Frontend: ${GREEN}✓ Funciona${NC}"
        echo -e "Backend:  ${RED}✗ No responde${NC}"
        echo ""
        echo "Diagnóstico del backend:"
        echo "  bash diagnostico-backend.sh"
    fi
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
