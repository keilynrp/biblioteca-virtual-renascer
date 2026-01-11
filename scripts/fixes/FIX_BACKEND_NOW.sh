#!/bin/bash
# =============================================================================
# EMERGENCY FIX - Backend Not Working
# =============================================================================
# Quick fix for Sprint 7 dependency issues
# Run this if backend shows "unhealthy" or "ModuleNotFoundError"
# =============================================================================

echo "🚨 EMERGENCY BACKEND FIX - Starting..."
echo ""

# Stop backend
echo "⏹️  Stopping backend..."
docker compose stop backend

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p backend/logs
chmod 755 backend/logs

# Rebuild with new dependencies
echo "🔨 Rebuilding backend (this may take 2-3 minutes)..."
docker compose build --no-cache backend

# Start backend
echo "▶️  Starting backend..."
docker compose up -d backend

# Wait
echo "⏳ Waiting for backend to initialize..."
sleep 10

# Run migrations
echo "🗄️  Running migrations..."
docker compose exec -T backend python manage.py migrate --noinput

# Final check
echo "✅ Checking if backend is working..."
sleep 5

if curl -f http://localhost:8000/api/ &> /dev/null; then
    echo ""
    echo "✅ SUCCESS! Backend is now working!"
    echo "🌐 API is available at: http://localhost:8000/api/"
    echo ""
    echo "📋 New features enabled:"
    echo "   - JSON structured logging"
    echo "   - Correlation ID tracking"
    echo "   - Rate limiting"
    echo ""
    echo "📝 View logs: tail -f backend/logs/django.log"
else
    echo ""
    echo "❌ Backend still not responding"
    echo "📋 Check logs: docker compose logs backend"
    echo ""
    echo "🔧 Try comprehensive fix:"
    echo "   bash scripts/diagnose_and_fix_backend.sh"
fi

echo ""
