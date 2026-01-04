#!/bin/bash

echo "========================================"
echo "  INICIANDO SERVIDOR DE DESARROLLO"
echo "  Frontend Next.js con Flipbook Preview"
echo "========================================"
echo ""

echo "Limpiando procesos anteriores..."
# Buscar y matar procesos de Next.js en puerto 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
# También matar cualquier proceso node relacionado con next dev
pkill -f "next dev" 2>/dev/null || true

echo "Limpiando lock files..."
rm -f frontend/.next/dev/lock 2>/dev/null

echo ""
echo "Iniciando servidor en puerto 3000..."
echo ""
echo "🌐 El servidor estará disponible en:"
echo "   - Local:   http://localhost:3000"
echo "   - Network: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📖 Para probar el Flipbook Preview:"
echo "   1. Ir a http://localhost:3000/library"
echo "   2. Hacer hover en la portada de un libro"
echo "   3. Click para ver el detalle"
echo "   4. Scroll down para ver la Vista Previa"
echo ""
echo "Presiona Ctrl+C para detener el servidor"
echo "=========================================="
echo ""

cd frontend
npm run dev
