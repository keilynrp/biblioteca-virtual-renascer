#!/bin/bash

# Script to setup and start services with SSL

set -e

echo "================================================"
echo "SSL Setup for BVS Framework"
echo "================================================"
echo ""

# Step 1: Check if certificates exist
if [ ! -f "ssl/localhost.crt" ]; then
    echo "[1/4] SSL certificates not found. Generating..."
    cd ssl
    bash generate-certs.sh
    cd ..
else
    echo "[1/4] ✅ SSL certificates already exist. Skipping generation."
fi

echo ""
echo "================================================"
echo "Certificate Information:"
echo "================================================"
openssl x509 -in ssl/localhost.crt -noout -subject -dates
echo ""

# Step 2: Stop existing containers
echo "[2/4] Stopping existing containers..."
docker compose down 2>/dev/null || true
echo ""

# Step 3: Copy SSL environment file
echo "[3/4] Configuring frontend for HTTPS..."
cp frontend/.env.ssl frontend/.env.local
echo "✅ Frontend configured for HTTPS"
echo ""

# Step 4: Start containers with SSL configuration
echo "[4/4] Starting containers with SSL..."
docker compose -f docker-compose.ssl.yml up -d
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

echo ""
echo "================================================"
echo "✅ SSL Setup Complete!"
echo "================================================"
echo ""
echo "Services are now running with HTTPS:"
echo ""
echo "  🌐 Frontend:       https://localhost"
echo "  🔌 Backend API:    https://localhost/api"
echo "  ⚙️  Django Admin:   https://localhost/admin"
echo "  🔍 Elasticsearch:  https://localhost:9201 (optional)"
echo ""
echo "⚠️  IMPORTANT:"
echo "  1. You must trust the SSL certificate in your browser"
echo "  2. On first visit, you'll see a security warning"
echo "  3. Click 'Advanced' and 'Proceed to localhost'"
echo ""
echo "🔐 To trust the certificate permanently:"
echo ""
echo "  Windows:"
echo "    1. Double-click ssl/localhost.crt"
echo "    2. Install to 'Trusted Root Certification Authorities'"
echo ""
echo "  Linux/WSL:"
echo "    sudo cp ssl/localhost.crt /usr/local/share/ca-certificates/"
echo "    sudo update-ca-certificates"
echo ""
echo "  macOS:"
echo "    sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ssl/localhost.crt"
echo ""
echo "📋 Useful commands:"
echo "  View logs:  docker compose -f docker-compose.ssl.yml logs -f"
echo "  Stop:       docker compose -f docker-compose.ssl.yml down"
echo "  Restart:    docker compose -f docker-compose.ssl.yml restart"
echo ""
echo "================================================"
