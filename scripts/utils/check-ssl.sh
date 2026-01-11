#!/bin/bash

# SSL Configuration Check Script

echo "================================================"
echo "SSL Configuration Diagnostic Tool"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✅ PASS${NC} - $1"
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC} - $1"
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC} - $1"
}

# 1. Check if certificates exist
echo "[1/8] Checking SSL certificates..."
if [ -f "ssl/localhost.crt" ] && [ -f "ssl/localhost.key" ]; then
    check_pass "SSL certificates found"

    # Check certificate validity
    if openssl x509 -checkend 86400 -noout -in ssl/localhost.crt >/dev/null 2>&1; then
        check_pass "Certificate is valid (not expiring in 24h)"
    else
        check_fail "Certificate expired or expiring soon"
        echo "         Run: cd ssl && bash generate-certs.sh"
    fi

    # Show expiry date
    EXPIRY=$(openssl x509 -enddate -noout -in ssl/localhost.crt | cut -d= -f2)
    echo "         Expires: $EXPIRY"
else
    check_fail "SSL certificates not found"
    echo "         Run: cd ssl && bash generate-certs.sh"
fi
echo ""

# 2. Check Nginx configuration
echo "[2/8] Checking Nginx configuration..."
if [ -f "nginx/nginx.conf" ]; then
    check_pass "Nginx config file exists"

    # Check if SSL paths are correct
    if grep -q "/etc/nginx/ssl/localhost.crt" nginx/nginx.conf; then
        check_pass "SSL certificate path configured"
    else
        check_fail "SSL certificate path not found in nginx.conf"
    fi
else
    check_fail "Nginx config file not found"
fi
echo ""

# 3. Check Docker Compose SSL config
echo "[3/8] Checking Docker Compose SSL configuration..."
if [ -f "docker-compose.ssl.yml" ]; then
    check_pass "docker-compose.ssl.yml exists"

    # Check if nginx service is defined
    if grep -q "nginx:" docker-compose.ssl.yml; then
        check_pass "Nginx service configured"
    else
        check_warn "Nginx service not found in docker-compose.ssl.yml"
    fi
else
    check_fail "docker-compose.ssl.yml not found"
fi
echo ""

# 4. Check if Docker is running
echo "[4/8] Checking Docker..."
if command -v docker &> /dev/null; then
    check_pass "Docker is installed"

    if docker info >/dev/null 2>&1; then
        check_pass "Docker daemon is running"
    else
        check_fail "Docker daemon is not running"
        echo "         Start Docker Desktop or Docker service"
    fi
else
    check_fail "Docker is not installed"
fi
echo ""

# 5. Check if SSL containers are running
echo "[5/8] Checking SSL containers..."
if docker compose -f docker-compose.ssl.yml ps 2>/dev/null | grep -q "nginx"; then
    check_pass "SSL containers are running"

    # Check nginx status
    if docker compose -f docker-compose.ssl.yml ps | grep nginx | grep -q "Up"; then
        check_pass "Nginx container is healthy"
    else
        check_warn "Nginx container may not be healthy"
    fi
else
    check_warn "SSL containers are not running"
    echo "         Run: ./setup-ssl.sh"
fi
echo ""

# 6. Check ports
echo "[6/8] Checking port availability..."
for port in 80 443; do
    if command -v nc &> /dev/null; then
        if nc -z localhost $port 2>/dev/null; then
            check_pass "Port $port is listening"
        else
            check_warn "Port $port is not listening"
        fi
    else
        check_warn "netcat not installed, skipping port check"
        break
    fi
done
echo ""

# 7. Check frontend configuration
echo "[7/8] Checking frontend configuration..."
if [ -f "frontend/.env.local" ]; then
    if grep -q "https://localhost" frontend/.env.local; then
        check_pass "Frontend configured for HTTPS"
    else
        check_warn "Frontend may not be configured for HTTPS"
        echo "         URL: $(grep NEXT_PUBLIC_API_URL frontend/.env.local | cut -d= -f2)"
    fi
else
    check_warn "Frontend .env.local not found"
fi
echo ""

# 8. Test HTTPS connection
echo "[8/8] Testing HTTPS connection..."
if command -v curl &> /dev/null; then
    if curl -k -s -o /dev/null -w "%{http_code}" https://localhost 2>/dev/null | grep -q "200\|301\|302"; then
        check_pass "HTTPS endpoint is responding"

        # Test certificate
        if curl --cacert ssl/localhost.crt -s -o /dev/null https://localhost 2>/dev/null; then
            check_pass "SSL certificate is valid"
        else
            check_warn "SSL certificate verification failed (may need to trust certificate)"
        fi
    else
        check_warn "HTTPS endpoint not responding"
        echo "         Make sure containers are running: ./setup-ssl.sh"
    fi
else
    check_warn "curl not installed, skipping HTTPS test"
fi
echo ""

# Summary
echo "================================================"
echo "Diagnostic Summary"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
if [ ! -f "ssl/localhost.crt" ]; then
    echo "1. Generate SSL certificates:"
    echo "   cd ssl && bash generate-certs.sh"
    echo ""
fi

if ! docker compose -f docker-compose.ssl.yml ps 2>/dev/null | grep -q "nginx"; then
    echo "2. Start SSL services:"
    echo "   ./setup-ssl.sh"
    echo ""
fi

if [ -f "ssl/localhost.crt" ] && docker compose -f docker-compose.ssl.yml ps 2>/dev/null | grep -q "nginx"; then
    echo "✅ All systems ready!"
    echo ""
    echo "Access your application:"
    echo "   🌐 Frontend:  https://localhost"
    echo "   🔌 API:       https://localhost/api"
    echo "   ⚙️  Admin:     https://localhost/admin"
    echo ""
fi

echo "================================================"
