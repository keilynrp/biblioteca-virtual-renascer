# Solución - Error de Conexión a OpenLibrary

## 🔴 Problema Identificado

```
HTTPSConnectionPool(host='openlibrary.org', port=443): Max retries exceeded
Connection to openlibrary.org timed out
```

**Causa:** El contenedor de Docker no puede conectarse a internet, probablemente por:
- Problemas de DNS
- Firewall bloqueando Docker
- Red de Docker mal configurada
- WSL sin acceso a internet

---

## 🚀 Soluciones (En Orden de Prioridad)

### Solución 1: Reiniciar Red de Docker (Más Rápido)

```bash
FIX_DOCKER_NETWORK.bat
```

Este script:
1. Limpia redes antiguas de Docker
2. Reinicia Docker Desktop
3. Reconstruye contenedores con DNS correcto
4. Prueba conectividad

---

### Solución 2: Configurar DNS Manualmente en docker-compose.yml

Edita `docker-compose.yml` y agrega DNS a los servicios:

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    # ... resto de configuración ...
    dns:
      - 8.8.8.8
      - 8.8.4.4
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Luego reinicia:

```bash
docker compose down
docker compose up -d
```

---

### Solución 3: Usar Datos de Prueba Locales (Alternativa)

Si OpenLibrary sigue sin funcionar, crea datos manualmente:

#### Opción A: Crear libros desde Django Admin

1. Abre http://localhost:8000/admin
2. Login con tu superusuario
3. Ve a "Books" → "Add Book"
4. Crea libros manualmente

#### Opción B: Usar Script de Datos de Prueba

Crea un archivo `backend/scripts/create_sample_data.py`:

```python
from apps.content.models import Book, Author, Category
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # Crear categorías
        philosophy, _ = Category.objects.get_or_create(
            name="Filosofía",
            slug="filosofia"
        )
        science, _ = Category.objects.get_or_create(
            name="Ciencia",
            slug="ciencia"
        )

        # Crear autores
        plato, _ = Author.objects.get_or_create(
            name="Platón",
            bio="Filósofo griego clásico"
        )
        einstein, _ = Author.objects.get_or_create(
            name="Albert Einstein",
            bio="Físico teórico"
        )

        # Crear libros
        Book.objects.get_or_create(
            title="La República",
            slug="la-republica",
            author=plato,
            category=philosophy,
            description="Obra fundamental sobre justicia y política",
            is_premium=False
        )

        Book.objects.get_or_create(
            title="Sobre la Teoría de la Relatividad",
            slug="teoria-relatividad",
            author=einstein,
            category=science,
            description="Explicación de la teoría de la relatividad",
            is_premium=True
        )

        self.stdout.write(self.style.SUCCESS('Datos de prueba creados'))
```

Ejecutar:

```bash
docker compose exec backend python manage.py create_sample_data
```

---

### Solución 4: Verificar Firewall/Antivirus

#### Windows Defender Firewall:

1. Abre "Windows Security"
2. Ve a "Firewall & network protection"
3. Click en "Allow an app through firewall"
4. Busca "Docker Desktop" y asegúrate que esté marcado en Private y Public
5. Click OK

#### Si usas otro antivirus:

- Agrega Docker Desktop a la lista blanca
- Permite conexiones salientes en puertos 80 y 443

---

### Solución 5: Configurar DNS en WSL2 (Si usas WSL)

Si estás usando WSL2, edita `/etc/resolv.conf`:

```bash
# En WSL
sudo nano /etc/resolv.conf
```

Cambia el contenido a:

```
nameserver 8.8.8.8
nameserver 8.8.4.4
```

Guarda y prueba:

```bash
ping openlibrary.org
```

**IMPORTANTE:** Este cambio se pierde al reiniciar WSL. Para hacerlo permanente:

```bash
# En WSL
sudo nano /etc/wsl.conf
```

Agrega:

```ini
[network]
generateResolvConf = false
```

Reinicia WSL:

```powershell
# En PowerShell
wsl --shutdown
```

---

### Solución 6: Usar Proxy (Si estás detrás de un proxy corporativo)

Si estás en una red corporativa con proxy, configúralo en Docker:

#### Docker Desktop Settings:

1. Abre Docker Desktop
2. Settings → Resources → Proxies
3. Configura:
   - HTTP Proxy: http://proxy.empresa.com:puerto
   - HTTPS Proxy: https://proxy.empresa.com:puerto
4. Apply & Restart

#### O en docker-compose.yml:

```yaml
services:
  backend:
    environment:
      - HTTP_PROXY=http://proxy.empresa.com:puerto
      - HTTPS_PROXY=https://proxy.empresa.com:puerto
      - NO_PROXY=localhost,127.0.0.1
```

---

## 🔍 Diagnóstico Manual

### Verificar conectividad desde el backend:

```bash
# Probar DNS
docker compose exec backend nslookup openlibrary.org

# Probar ping
docker compose exec backend ping -c 3 openlibrary.org

# Probar curl
docker compose exec backend curl -I https://openlibrary.org

# Probar con timeout
docker compose exec backend curl --connect-timeout 10 https://openlibrary.org/subjects/programming.json
```

### Verificar DNS del host:

```bash
# En Windows (PowerShell)
nslookup openlibrary.org

# Probar conectividad
curl -I https://openlibrary.org
```

### Ver configuración de red de Docker:

```bash
# Ver redes
docker network ls

# Inspeccionar red del proyecto
docker network inspect bvs_framework_default

# Ver DNS configurado
docker inspect backend | findstr /i dns
```

---

## 🛠️ Solución Alternativa: Timeout Más Largo

Si la conexión es muy lenta pero funcional, aumenta el timeout:

Edita `backend/apps/content/management/commands/import_openlibrary.py`:

```python
# Busca la línea con requests.get() y agrega timeout=30
response = requests.get(url, timeout=30)  # Aumentado de 10 a 30 segundos
```

---

## 📋 Checklist de Verificación

- [ ] Docker Desktop está corriendo
- [ ] Docker tiene acceso a internet desde Windows: `curl https://openlibrary.org`
- [ ] Firewall permite Docker
- [ ] DNS configurado en docker-compose.yml (8.8.8.8)
- [ ] Backend puede resolver DNS: `docker compose exec backend nslookup google.com`
- [ ] Backend puede hacer HTTP: `docker compose exec backend curl -I https://google.com`

---

## 🎯 Workaround Rápido

Si necesitas datos AHORA y no puedes esperar a solucionar la red:

### Método 1: Importar SQL con Datos

Descarga un dump SQL con datos de prueba y cárgalo:

```bash
# Copiar archivo SQL al contenedor
docker cp datos_prueba.sql bvs_framework_backend:/tmp/

# Importar a PostgreSQL
docker compose exec db psql -U postgres -d biblioteca -f /tmp/datos_prueba.sql
```

### Método 2: Crear Manualmente desde Admin

1. http://localhost:8000/admin
2. Login
3. Crear 10-20 libros manualmente (toma ~15 minutos)

### Método 3: Script Python Local

Ejecuta el script de importación desde tu máquina (no Docker):

```bash
# Instalar requests en tu máquina
pip install requests

# Ejecutar script localmente
python scripts/import_from_openlibrary_local.py
```

---

## 📞 Próximos Pasos

1. **Ejecuta:** `FIX_DOCKER_NETWORK.bat`
2. **Prueba:** `docker compose exec backend curl https://openlibrary.org`
3. **Si funciona:** Intenta importar de nuevo
4. **Si no funciona:** Usa datos de prueba locales (Solución 3)

---

**Fecha:** 2025-12-28
**Error:** Connection timeout to openlibrary.org
**Causa:** Problemas de DNS/Red en Docker
**Solución Principal:** FIX_DOCKER_NETWORK.bat
**Alternativa:** Crear datos de prueba manualmente
