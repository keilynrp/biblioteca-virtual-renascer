#!/bin/bash

# Reinicio rápido del frontend

echo "Reiniciando frontend..."
echo ""

# Detener
echo "→ Deteniendo..."
docker compose stop frontend

# Esperar
sleep 3

# Iniciar
echo "→ Iniciando..."
docker compose up -d frontend

# Esperar respuesta
echo "→ Esperando respuesta..."
sleep 5

MAX_WAIT=30
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo ""
        echo "✅ Frontend respondiendo en http://localhost:3000"
        exit 0
    fi

    echo -n "."
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo ""
echo "⚠️  Frontend no responde después de $MAX_WAIT segundos"
echo ""
echo "Ver logs:"
echo "  docker compose logs frontend --tail=30"
echo ""
echo "Reconstruir:"
echo "  bash fix-frontend-not-responding.sh"
