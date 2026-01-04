#!/bin/bash

# Fix: Frontend no responde

clear
echo "════════════════════════════════════════════════════════════"
echo "  FIX: Frontend No Responde"
echo "════════════════════════════════════════════════════════════"
echo ""

# Verificar Docker
echo "→ Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Inicia Docker Desktop."
    exit 1
fi
echo "✓ Docker corriendo"
echo ""

# Ver estado del frontend
echo "→ Estado del contenedor frontend:"
docker compose ps frontend
echo ""

# Ver logs recientes
echo "→ Últimos logs del frontend:"
docker compose logs frontend --tail=30
echo ""

# Verificar si el puerto 3000 está ocupado
echo "→ Verificando puerto 3000..."
if command -v netstat &> /dev/null; then
    netstat -ano | grep ":3000" || echo "Puerto 3000 libre"
elif command -v lsof &> /dev/null; then
    lsof -i :3000 || echo "Puerto 3000 libre"
else
    echo "No se puede verificar (netstat/lsof no disponible)"
fi
echo ""

# Detener frontend
echo "→ Deteniendo frontend..."
docker compose stop frontend
sleep 2
echo "✓ Frontend detenido"
echo ""

# Limpiar posibles procesos en el puerto 3000
echo "→ Limpiando puerto 3000..."
if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp 2>/dev/null || echo "  No hay procesos que matar"
fi
echo ""

# Verificar espacio en disco
echo "→ Verificando espacio en disco..."
df -h | grep -E '(Filesystem|/$|/var)' || df -h
echo ""

# Limpiar caché de Docker (solo imágenes dangling)
echo "→ Limpiando imágenes Docker no utilizadas..."
docker image prune -f
echo ""

# Reconstruir frontend
echo "→ Reconstruyendo frontend..."
docker compose build --no-cache frontend
echo ""

# Iniciar frontend
echo "→ Iniciando frontend..."
docker compose up -d frontend
echo ""

# Esperar a que inicie
echo "→ Esperando a que el frontend esté listo..."
MAX_WAIT=60
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✓ Frontend respondiendo!"
        break
    fi

    echo -n "."
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo ""
echo ""

# Verificar estado final
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "════════════════════════════════════════════════════════════"
    echo "  ✅ FRONTEND FUNCIONANDO"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "Frontend disponible en: http://localhost:3000"
    echo ""
    echo "Próximos pasos:"
    echo "  1. Abre http://localhost:3000 en tu navegador"
    echo "  2. Limpia la caché del navegador (Ctrl+Shift+R)"
    echo "  3. Inicia sesión y prueba el visor PDF"
else
    echo "════════════════════════════════════════════════════════════"
    echo "  ⚠️  FRONTEND AÚN NO RESPONDE"
    echo "════════════════════════════════════════════════════════════"
    echo ""
    echo "Ver logs en tiempo real:"
    echo "  docker compose logs -f frontend"
    echo ""
    echo "Ver estado:"
    echo "  docker compose ps frontend"
    echo ""
    echo "Posibles causas:"
    echo "  1. Error en el código (revisa logs arriba)"
    echo "  2. Puerto 3000 ocupado por otro proceso"
    echo "  3. Falta de recursos (RAM/CPU)"
    echo "  4. Error en la compilación de Next.js"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
