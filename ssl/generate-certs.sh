#!/bin/bash

# Script to generate self-signed SSL certificates for local development
# Creates certificates valid for 365 days

DOMAIN="localhost"
CERT_DIR="$(dirname "$0")"
DAYS=365

echo "================================================"
echo "Generating SSL Certificates for Local Development"
echo "================================================"
echo ""
echo "Domain: $DOMAIN"
echo "Certificate Directory: $CERT_DIR"
echo "Validity: $DAYS days"
echo ""

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out "$CERT_DIR/localhost.key" 2048

# Generate certificate signing request (CSR)
echo "📝 Generating certificate signing request..."
openssl req -new -key "$CERT_DIR/localhost.key" -out "$CERT_DIR/localhost.csr" -subj "/C=BR/ST=State/L=City/O=Renascer Saber/OU=Development/CN=localhost"

# Create config file for SAN (Subject Alternative Names)
cat > "$CERT_DIR/localhost.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Generate self-signed certificate
echo "📝 Generating self-signed certificate..."
openssl x509 -req -in "$CERT_DIR/localhost.csr" -signkey "$CERT_DIR/localhost.key" -out "$CERT_DIR/localhost.crt" -days $DAYS -extfile "$CERT_DIR/localhost.ext"

# Clean up temporary files
rm "$CERT_DIR/localhost.csr" "$CERT_DIR/localhost.ext"

# Set proper permissions
chmod 644 "$CERT_DIR/localhost.crt"
chmod 600 "$CERT_DIR/localhost.key"

echo ""
echo "✅ SSL Certificates generated successfully!"
echo ""
echo "Files created:"
echo "  - Certificate: $CERT_DIR/localhost.crt"
echo "  - Private Key: $CERT_DIR/localhost.key"
echo ""
echo "⚠️  IMPORTANT: Trust the certificate"
echo ""
echo "Windows:"
echo "  1. Double-click 'localhost.crt'"
echo "  2. Click 'Install Certificate'"
echo "  3. Select 'Local Machine' → Next"
echo "  4. Select 'Place all certificates in the following store'"
echo "  5. Click 'Browse' → Select 'Trusted Root Certification Authorities'"
echo "  6. Click 'Next' → 'Finish'"
echo ""
echo "WSL/Linux:"
echo "  sudo cp localhost.crt /usr/local/share/ca-certificates/"
echo "  sudo update-ca-certificates"
echo ""
echo "Certificate Details:"
openssl x509 -in "$CERT_DIR/localhost.crt" -noout -subject -dates -fingerprint
echo ""
echo "================================================"
