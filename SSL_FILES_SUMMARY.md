# SSL Configuration - Files Summary

## 📁 Files Created

### SSL Directory (`ssl/`)
```
ssl/
├── .gitignore                  ✅ Git ignore para certificados
├── README.md                   ✅ Documentación del directorio SSL
├── generate-certs.bat          ✅ Script Windows para generar certificados
├── generate-certs.sh           ✅ Script Linux/macOS para generar certificados
├── localhost.crt               ⚠️  Se genera al ejecutar los scripts
└── localhost.key               ⚠️  Se genera al ejecutar los scripts
```

### Nginx Directory (`nginx/`)
```
nginx/
└── nginx.conf                  ✅ Configuración Nginx con SSL
```

### Root Directory Scripts
```
bvs_framework/
├── setup-ssl.bat               ✅ Setup completo SSL (Windows)
├── setup-ssl.sh                ✅ Setup completo SSL (Linux/macOS)
├── disable-ssl.bat             ✅ Desactivar SSL y volver a HTTP
└── docker-compose.ssl.yml      ✅ Docker Compose con SSL
```

### Frontend Configuration
```
frontend/
└── .env.ssl                    ✅ Variables de entorno para HTTPS
```

### Documentation
```
docs/
└── SSL_SETUP.md                ✅ Documentación completa de SSL
```

## 🚀 Quick Start Guide

### Paso 1: Generar Certificados

**Windows:**
```bash
cd ssl
generate-certs.bat
```

**Linux/macOS:**
```bash
cd ssl
bash generate-certs.sh
```

### Paso 2: Confiar en el Certificado

**Windows:**
1. Doble clic en `ssl\localhost.crt`
2. Instalar certificado → Equipo local
3. Almacén: "Entidades de certificación raíz de confianza"

**Linux/WSL:**
```bash
sudo cp ssl/localhost.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates
```

**macOS:**
```bash
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain ssl/localhost.crt
```

### Paso 3: Iniciar con SSL

**Windows:**
```bash
setup-ssl.bat
```

**Linux/macOS:**
```bash
chmod +x setup-ssl.sh
./setup-ssl.sh
```

### Paso 4: Acceder a la Aplicación

```
https://localhost          → Frontend
https://localhost/api      → Backend API
https://localhost/admin    → Django Admin
```

## 📊 Architecture Overview

```
                    ┌─────────────────────┐
                    │   Browser (Client)  │
                    │   https://localhost │
                    └──────────┬──────────┘
                               │ HTTPS (443)
                               ▼
                    ┌─────────────────────┐
                    │   Nginx Proxy       │
                    │   - SSL Termination │
                    │   - Reverse Proxy   │
                    └─────┬──────────┬────┘
                          │          │
                    HTTP  │          │  HTTP
                          ▼          ▼
                   ┌──────────┐  ┌─────────┐
                   │ Frontend │  │ Backend │
                   │  :3000   │  │  :8000  │
                   └──────────┘  └─────────┘
```

## ✅ Checklist

- [x] SSL directory created
- [x] Certificate generation scripts (Windows & Linux)
- [x] Nginx configuration with SSL
- [x] Docker Compose SSL configuration
- [x] Frontend HTTPS configuration
- [x] Setup automation scripts
- [x] Complete documentation
- [ ] Generate certificates (run `generate-certs.bat/sh`)
- [ ] Trust certificate in OS
- [ ] Start services with SSL (`setup-ssl.bat/sh`)

## 🔧 Configuration Files

### docker-compose.ssl.yml
- Nginx service on ports 80 (redirect) and 443 (SSL)
- Frontend and Backend accessed via Nginx
- Shared network: `app-network`

### nginx/nginx.conf
- HTTP → HTTPS redirect on port 80
- SSL configuration on port 443
- Reverse proxy to frontend and backend
- Security headers (HSTS, X-Frame-Options, etc.)

### frontend/.env.ssl
```env
NEXT_PUBLIC_API_URL=https://localhost/api
NODE_TLS_REJECT_UNAUTHORIZED=0  # Development only
```

## 📝 Important Notes

1. **Development Only:** These are self-signed certificates for local development
2. **Validity:** Certificates expire after 365 days
3. **Security:** Private keys are in `.gitignore` and won't be committed
4. **Browser Warning:** First visit will show security warning until certificate is trusted
5. **Port Changes:**
   - Frontend: `3000` → `443` (via Nginx)
   - Backend: `8000` → `443` (via Nginx)

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Not Secure" in browser | Install certificate in trusted root store |
| Port 443 in use | Stop other service or change port in docker-compose.ssl.yml |
| Certificate error | Regenerate certificates: `rm ssl/*.crt ssl/*.key && bash ssl/generate-certs.sh` |
| Connection refused | Check `frontend/.env.local` uses `https://localhost/api` |

## 📚 Documentation

- **Complete Guide:** [docs/SSL_SETUP.md](docs/SSL_SETUP.md)
- **SSL Directory:** [ssl/README.md](ssl/README.md)
- **Nginx Config:** [nginx/nginx.conf](nginx/nginx.conf)

## 🔄 Revert to HTTP

To disable SSL and return to HTTP configuration:

**Windows:**
```bash
disable-ssl.bat
```

**Manual:**
```bash
docker compose -f docker-compose.ssl.yml down
docker compose up -d
```

---

**Created:** 2025-12-28
**Status:** ✅ Ready to use
**Next Step:** Run `setup-ssl.bat` or `setup-ssl.sh`
