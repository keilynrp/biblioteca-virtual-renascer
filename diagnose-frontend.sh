#!/bin/bash

# Diagnóstico completo del frontend

echo "════════════════════════════════════════════════════════════"
echo "  DIAGNÓSTICO: Frontend"
echo "════════════════════════════════════════════════════════════"
echo ""

# 1. Estado del contenedor
echo "━━━ 1. ESTADO DEL CONTENEDOR ━━━"
docker compose ps frontend
echo ""

# 2. Uso de recursos
echo "━━━ 2. USO DE RECURSOS ━━━"
docker stats --no-stream frontend 2>/dev/null || echo "No se puede obtener stats"
echo ""

# 3. Logs recientes
echo "━━━ 3. ÚLTIMOS LOGS (50 líneas) ━━━"
docker compose logs frontend --tail=50
echo ""

# 4. Variables de entorno
echo "━━━ 4. VARIABLES DE ENTORNO ━━━"
docker compose exec -T frontend printenv | grep -E '(NODE|NEXT|API)' || echo "No se puede acceder al contenedor"
echo ""

# 5. Puerto 3000
echo "━━━ 5. VERIFICACIÓN DE PUERTO 3000 ━━━"
if curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3000; then
    echo "✓ Frontend responde"
else
    echo "✗ Frontend NO responde"
fi
echo ""

# 6. Procesos dentro del contenedor
echo "━━━ 6. PROCESOS DENTRO DEL CONTENEDOR ━━━"
docker compose exec -T frontend ps aux 2>/dev/null || echo "No se puede listar procesos"
echo ""

# 7. Red y conectividad
echo "━━━ 7. CONECTIVIDAD BACKEND ↔ FRONTEND ━━━"
docker compose exec -T frontend ping -c 2 backend 2>/dev/null || echo "No se puede hacer ping"
echo ""

# 8. Archivos Next.js
echo "━━━ 8. ESTRUCTURA DE ARCHIVOS NEXT.JS ━━━"
docker compose exec -T frontend ls -la /app 2>/dev/null || echo "No se puede listar archivos"
echo ""

# 9. Package.json
echo "━━━ 9. SCRIPTS DE PACKAGE.JSON ━━━"
docker compose exec -T frontend cat /app/package.json 2>/dev/null | grep -A 10 '"scripts"' || echo "No se puede leer package.json"
echo ""

# 10. Espacio en disco
echo "━━━ 10. ESPACIO EN DISCO ━━━"
df -h | grep -E '(Filesystem|/$)' || df -h
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  FIN DEL DIAGNÓSTICO"
echo "════════════════════════════════════════════════════════════"
echo ""

# Resumen
echo "RESUMEN:"
echo ""

# Estado
STATUS=$(docker compose ps frontend --format "{{.Status}}" 2>/dev/null)
if echo "$STATUS" | grep -q "Up"; then
    echo "✓ Contenedor: Running"
else
    echo "✗ Contenedor: $STATUS"
fi

# Puerto
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Puerto 3000: Respondiendo"
else
    echo "✗ Puerto 3000: No responde"
fi

# Logs
if docker compose logs frontend --tail=10 | grep -qi "error\|exception\|fatal"; then
    echo "⚠ Logs: Contienen errores (revisa arriba)"
else
    echo "✓ Logs: Sin errores obvios"
fi

echo ""
echo "ACCIONES RECOMENDADAS:"
echo ""

if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "1. Reiniciar frontend:"
    echo "   docker compose restart frontend"
    echo ""
    echo "2. Ver logs en tiempo real:"
    echo "   docker compose logs -f frontend"
    echo ""
    echo "3. Reconstruir si persiste:"
    echo "   bash fix-frontend-not-responding.sh"
fi

echo ""
