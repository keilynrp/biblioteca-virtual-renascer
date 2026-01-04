# SSL Certificates Directory

This directory contains SSL certificates for local HTTPS development.

## Quick Start

### Generate Certificates

**Windows:**
```bash
generate-certs.bat
```

**Linux/macOS/WSL:**
```bash
bash generate-certs.sh
```

## Generated Files

After running the script, you'll have:

- `localhost.crt` - SSL certificate (365 days validity)
- `localhost.key` - Private key (keep secret!)

## Certificate Details

- **Common Name (CN):** localhost
- **Subject Alternative Names:**
  - DNS: localhost
  - DNS: *.localhost
  - IP: 127.0.0.1
  - IP: ::1
- **Key Size:** 2048 bits RSA
- **Validity:** 365 days
- **Self-signed:** Yes

## Trust Certificate

### Windows

1. Double-click `localhost.crt`
2. Click "Install Certificate"
3. Choose "Local Machine" or "Current User"
4. Select "Place all certificates in the following store"
5. Browse to "Trusted Root Certification Authorities"
6. Click "Next" and "Finish"

### Linux/WSL

```bash
sudo cp localhost.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

### macOS

```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain localhost.crt
```

## Verify Certificate

```bash
# View certificate details
openssl x509 -in localhost.crt -text -noout

# Check validity dates
openssl x509 -in localhost.crt -noout -dates

# View Subject Alternative Names
openssl x509 -in localhost.crt -noout -text | grep -A1 "Subject Alternative Name"
```

## Security Notes

⚠️ **IMPORTANT:**

- These certificates are for **development only**
- Never use self-signed certificates in production
- Never commit private keys (`.key` files) to git
- Regenerate certificates if they expire or are compromised

## Regenerate Certificates

If certificates expire or need renewal:

```bash
# Remove old certificates
rm localhost.crt localhost.key

# Generate new ones
bash generate-certs.sh  # or generate-certs.bat on Windows
```

## Troubleshooting

### "Certificate not trusted" in browser

The certificate needs to be installed in the trusted root store. Follow the trust instructions above.

### "Private key does not match certificate"

Regenerate both files together:
```bash
rm localhost.crt localhost.key
bash generate-certs.sh
```

### Certificate expired

Certificates are valid for 365 days. Check expiry:
```bash
openssl x509 -in localhost.crt -noout -dates
```

Regenerate if expired.

## Additional Resources

- [Docker SSL Setup Guide](../docs/SSL_SETUP.md)
- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Let's Encrypt](https://letsencrypt.org/) - For production certificates

---

**Last updated:** 2025-12-28
