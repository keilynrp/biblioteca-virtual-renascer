# Configuración SSL/HTTPS para Desarrollo Local

Este documento describe cómo configurar certificados SSL autofirmados para ejecutar toda la aplicación con HTTPS en desarrollo local.

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Requisitos](#requisitos)
- [Instalación Rápida](#instalación-rápida)
- [Configuración Detallada](#configuración-detallada)
- [Arquitectura](#arquitectura)
- [Troubleshooting](#troubleshooting)
- [Desactivar SSL](#desactivar-ssl)

## 🎯 Descripción General

La configuración SSL incluye:

- **Nginx** como reverse proxy con SSL/TLS
- Certificados autofirmados para `localhost`
- Redirección automática de HTTP → HTTPS
- Configuración de seguridad headers
- Soporte para todos los servicios (Frontend, Backend, Elasticsearch)

### URLs después de SSL

| Servicio | HTTP (Antes) | HTTPS (Después) |
|----------|-------------|-----------------|
| Frontend | `http://localhost:3000` | `https://localhost` |
| Backend API | `http://localhost:8000/api` | `https://localhost/api` |
| Django Admin | `http://localhost:8000/admin` | `https://localhost/admin` |
| Elasticsearch | `http://localhost:9200` | `https://localhost:9201` |

## ✅ Requisitos

- Docker y Docker Compose instalados
- OpenSSL (incluido en Git Bash en Windows)
- Privilegios de administrador (para instalar certificado en Windows)

## 🚀 Instalación Rápida

### Windows

```bash
# 1. Ejecutar el script de configuración SSL
setup-ssl.bat

# 2. Confiar en el certificado (doble clic en el archivo)
ssl\localhost.crt

# 3. En el asistente de instalación:
#    - Seleccionar "Máquina local" o "Usuario actual"
#    - Elegir "Colocar todos los certificados en el siguiente almacén"
#    - Buscar "Entidades de certificación raíz de confianza"
#    - Finalizar

# 4. Acceder a la aplicación
https://localhost
```

### Linux/WSL/macOS

```bash
# 1. Dar permisos de ejecución
chmod +x setup-ssl.sh
chmod +x ssl/generate-certs.sh

# 2. Ejecutar el script de configuración
./setup-ssl.sh

# 3. Confiar en el certificado
# Linux/WSL:
sudo cp ssl/localhost.crt /usr/local/share/ca-certificates/
sudo update-ca-certificates

# macOS:
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ssl/localhost.crt

# 4. Acceder a la aplicación
https://localhost
```

## 🔧 Configuración Detallada

### 1. Generación de Certificados

Los certificados se generan automáticamente con `setup-ssl.bat/sh`, pero también puedes generarlos manualmente:

```bash
# Windows
cd ssl
generate-certs.bat

# Linux/macOS
cd ssl
bash generate-certs.sh
```

**Archivos generados:**
- `ssl/localhost.crt` - Certificado público
- `ssl/localhost.key` - Clave privada

**Propiedades del certificado:**
- Dominio: `localhost`, `*.localhost`
- IPs: `127.0.0.1`, `::1`
- Validez: 365 días
- Algoritmo: RSA 2048 bits
- SAN (Subject Alternative Names): Sí

### 2. Estructura de Archivos

```
bvs_framework/
├── ssl/
│   ├── generate-certs.bat       # Script Windows para generar certificados
│   ├── generate-certs.sh        # Script Linux/macOS para generar certificados
│   ├── localhost.crt            # Certificado SSL (generado)
│   └── localhost.key            # Clave privada (generado)
├── nginx/
│   └── nginx.conf               # Configuración Nginx con SSL
├── frontend/
│   ├── .env.local               # Config actual (HTTP)
│   └── .env.ssl                 # Config SSL (HTTPS)
├── docker-compose.yml           # Config Docker sin SSL
├── docker-compose.ssl.yml       # Config Docker con SSL
├── setup-ssl.bat                # Script setup SSL (Windows)
├── setup-ssl.sh                 # Script setup SSL (Linux/macOS)
├── disable-ssl.bat              # Script para desactivar SSL
└── docs/
    └── SSL_SETUP.md             # Esta documentación
```

### 3. Configuración de Nginx

El archivo `nginx/nginx.conf` incluye:

**HTTP → HTTPS Redirect:**
```nginx
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

**HTTPS Server:**
```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/nginx/ssl/localhost.crt;
    ssl_certificate_key /etc/nginx/ssl/localhost.key;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
}
```

**Proxy Configuration:**
- Frontend (`/`) → `http://frontend:3000`
- Backend API (`/api/`) → `http://backend:8000`
- Admin (`/admin/`) → `http://backend:8000`
- Static/Media (`/static/`, `/media/`) → `http://backend:8000`

### 4. Docker Compose SSL

El archivo `docker-compose.ssl.yml` añade:

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"      # HTTP (redirect)
    - "443:443"    # HTTPS
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./ssl:/etc/nginx/ssl:ro
```

**Cambios en servicios:**
- Backend y Frontend ya no exponen puertos directamente
- Todo el tráfico pasa por Nginx
- Red compartida: `app-network`

### 5. Configuración Frontend

**Antes (HTTP):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Después (HTTPS):**
```env
NEXT_PUBLIC_API_URL=https://localhost/api
NODE_TLS_REJECT_UNAUTHORIZED=0  # Solo para desarrollo
```

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│  Cliente (Navegador)                                │
│  https://localhost                                   │
└────────────────┬────────────────────────────────────┘
                 │ HTTPS (443)
                 ▼
┌─────────────────────────────────────────────────────┐
│  Nginx (Reverse Proxy)                              │
│  - SSL Termination                                  │
│  - Security Headers                                 │
│  - Load Balancing                                   │
└─────┬──────────────────┬────────────────────────────┘
      │ HTTP             │ HTTP
      ▼                  ▼
┌──────────────┐   ┌──────────────────────────────────┐
│  Frontend    │   │  Backend                         │
│  Next.js     │   │  Django REST Framework           │
│  :3000       │   │  :8000                           │
└──────────────┘   └─────┬──────┬──────┬──────────────┘
                         │      │      │
                         ▼      ▼      ▼
                    ┌────────┬────────┬──────────┐
                    │   DB   │ Redis  │  ES      │
                    │  :5432 │ :6379  │  :9200   │
                    └────────┴────────┴──────────┘
```

## 🔍 Troubleshooting

### El navegador muestra "No es seguro"

**Causa:** El certificado autofirmado no es confiable.

**Solución:**
1. Haz clic en "Avanzado" → "Continuar a localhost"
2. O instala el certificado en "Entidades de certificación raíz de confianza"

### Error: "SSL certificate problem"

**Causa:** El certificado no se generó correctamente.

**Solución:**
```bash
# Regenerar certificados
cd ssl
rm localhost.crt localhost.key
bash generate-certs.sh  # o generate-certs.bat en Windows
```

### Error: "Connection refused" en el frontend

**Causa:** El frontend intenta conectar al backend en HTTP en lugar de HTTPS.

**Solución:**
```bash
# Verificar que .env.local usa HTTPS
cat frontend/.env.local
# Debe ser: NEXT_PUBLIC_API_URL=https://localhost/api

# Si no, copiar el archivo SSL
cp frontend/.env.ssl frontend/.env.local

# Reiniciar frontend
docker compose -f docker-compose.ssl.yml restart frontend
```

### Error: "Nginx failed to start"

**Causa:** Certificados no encontrados o configuración incorrecta.

**Solución:**
```bash
# Verificar que existen los certificados
ls -la ssl/

# Ver logs de Nginx
docker compose -f docker-compose.ssl.yml logs nginx

# Verificar configuración de Nginx
docker compose -f docker-compose.ssl.yml exec nginx nginx -t
```

### El puerto 443 ya está en uso

**Causa:** Otro servicio usa el puerto 443.

**Solución:**
```bash
# Windows
netstat -ano | findstr :443

# Linux/macOS
sudo lsof -i :443

# Detener el servicio que usa el puerto o cambiar el puerto en docker-compose.ssl.yml
ports:
  - "8443:443"  # Usar puerto alternativo
```

### Certificado expirado

**Causa:** El certificado tiene validez de 365 días.

**Solución:**
```bash
# Verificar expiración
openssl x509 -in ssl/localhost.crt -noout -dates

# Regenerar si expiró
cd ssl
rm localhost.crt localhost.key
bash generate-certs.sh
```

## 🔄 Desactivar SSL

Para volver a la configuración HTTP:

```bash
# Windows
disable-ssl.bat

# Linux/macOS
docker compose -f docker-compose.ssl.yml down
docker compose up -d
```

**Nota:** Recuerda actualizar `frontend/.env.local` con la URL HTTP:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📊 Comandos Útiles

### Gestión de contenedores

```bash
# Iniciar con SSL
docker compose -f docker-compose.ssl.yml up -d

# Ver logs
docker compose -f docker-compose.ssl.yml logs -f

# Ver logs de un servicio específico
docker compose -f docker-compose.ssl.yml logs -f nginx

# Reiniciar un servicio
docker compose -f docker-compose.ssl.yml restart nginx

# Detener
docker compose -f docker-compose.ssl.yml down
```

### Verificación de certificados

```bash
# Ver información del certificado
openssl x509 -in ssl/localhost.crt -text -noout

# Ver fechas de validez
openssl x509 -in ssl/localhost.crt -noout -dates

# Ver Subject Alternative Names
openssl x509 -in ssl/localhost.crt -noout -text | grep -A1 "Subject Alternative Name"

# Verificar que el certificado y la clave coinciden
openssl x509 -noout -modulus -in ssl/localhost.crt | openssl md5
openssl rsa -noout -modulus -in ssl/localhost.key | openssl md5
```

### Testing de SSL

```bash
# Curl con certificado autofirmado
curl -k https://localhost

# Curl verificando certificado
curl --cacert ssl/localhost.crt https://localhost

# Test de conexión SSL
openssl s_client -connect localhost:443 -servername localhost
```

## 🔐 Seguridad

### Para desarrollo local

✅ **Usar certificados autofirmados**
✅ **No commitear claves privadas**
✅ **Regenerar certificados periódicamente**

### Para producción

❌ **NO usar certificados autofirmados**
✅ **Usar Let's Encrypt o certificados comerciales**
✅ **Configurar HSTS con preload**
✅ **Habilitar OCSP stapling**
✅ **Usar SSL Labs para auditar configuración**

## 📝 Notas Adicionales

1. **Gitignore:** Los archivos `ssl/*.crt` y `ssl/*.key` están en `.gitignore`
2. **Validez:** Los certificados son válidos por 365 días
3. **Compatibilidad:** Funciona en todos los navegadores modernos
4. **Performance:** SSL termination en Nginx es más eficiente que en cada servicio
5. **Hot Reload:** Next.js HMR funciona correctamente con HTTPS

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker compose -f docker-compose.ssl.yml logs -f`
2. Verifica la configuración: `docker compose -f docker-compose.ssl.yml config`
3. Regenera los certificados: `cd ssl && bash generate-certs.sh`
4. Consulta la documentación oficial de Nginx: https://nginx.org/en/docs/

---

**Fecha de creación:** 2025-12-28
**Autor:** Claude Code
**Versión:** 1.0
**Stack:** Docker + Nginx + Next.js + Django + SSL
