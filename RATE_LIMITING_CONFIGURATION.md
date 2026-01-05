# Configuración de Rate Limiting - BVS Backend

## 📋 Índice

1. [Resumen General](#resumen-general)
2. [Arquitectura](#arquitectura)
3. [Límites Configurados](#límites-configurados)
4. [Implementación](#implementación)
5. [Testing](#testing)
6. [Monitoreo](#monitoreo)
7. [Troubleshooting](#troubleshooting)
8. [Mejores Prácticas](#mejores-prácticas)

---

## Resumen General

### ✅ Estado de Implementación

**Rate Limiting**: ✅ 100% Completado

- ✅ django-ratelimit instalado y configurado
- ✅ Redis como backend de caché
- ✅ Middleware global implementado
- ✅ Decoradores reutilizables creados
- ✅ Aplicado a endpoints críticos
- ✅ Tests unitarios e integración
- ✅ Respuestas HTTP 429 personalizadas
- ✅ Logging de violaciones
- ✅ Whitelist de IPs configurada

### 🎯 Objetivos Cumplidos

1. **Protección contra abuse**: Prevenir ataques de fuerza bruta y DoS
2. **Preservar recursos**: Evitar sobrecarga del servidor
3. **Fair usage**: Distribuir recursos equitativamente entre usuarios
4. **Seguridad mejorada**: Límites estrictos en endpoints sensibles
5. **Experiencia del usuario**: Mensajes claros al exceder límites

---

## Arquitectura

### 📦 Stack Tecnológico

```yaml
Core:
  - django-ratelimit: ^4.1
  - Redis: Cache backend
  - Django REST Framework: API framework

Componentes:
  - Decorators: apps/core/decorators.py
  - Middleware: apps/core/middleware.py
  - Views: apps/core/views.py (rate_limit_exceeded)
  - Settings: config/settings.py (RATELIMIT_*)
  - Tests: apps/core/test_ratelimit.py
```

### 🔄 Flujo de Funcionamiento

```
1. Request → Middleware
2. Middleware → django-ratelimit decorator
3. django-ratelimit → Check Redis cache
4. Si limite OK → Continuar request
5. Si limite excedido → Raise Ratelimited exception
6. Middleware → Captura excepción
7. Middleware → Return HTTP 429 JSON response
8. Response → Cliente con Retry-After header
```

### 🏗️ Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────┐
│                    HTTP Request                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────┐
│           RateLimitMiddleware                        │
│  - Captura Ratelimited exceptions                   │
│  - Retorna HTTP 429                                 │
│  - Logging de violaciones                           │
└─────────────────┬───────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────┐
│           Rate Limit Decorators                      │
│  - @rate_limit_auth                                 │
│  - @rate_limit_api_read                             │
│  - @rate_limit_api_write                            │
│  - @rate_limit_search                               │
│  - etc.                                             │
└─────────────────┬───────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────┐
│           django-ratelimit                           │
│  - Check rate limit en Redis                        │
│  - Increment counter                                │
│  - Raise exception si excedido                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────┐
│           Redis Cache                                │
│  Key format: rl:{endpoint}:{ip}:{method}            │
│  TTL: según configuración (minutos/horas)           │
└─────────────────────────────────────────────────────┘
```

---

## Límites Configurados

### 🔐 Autenticación (Endpoints Críticos)

```python
# Configuración en settings.py

RATELIMIT_RATE_GROUPS = {
    'auth_login': '5/m',           # Login: 5 intentos por minuto
    'auth_register': '3/h',        # Registro: 3 por hora
    'auth_password_reset': '3/h',  # Reset password: 3 por hora
}
```

**Endpoints Protegidos**:
- `POST /api/auth/login/` → 5/minuto
- `POST /api/auth/register/` → 3/hora
- `POST /api/auth/password/reset/` → 3/hora
- `PUT /api/auth/password/change/` → 3/hora

**Justificación**:
- **Login**: Prevenir brute force attacks
- **Registro**: Prevenir spam de cuentas
- **Password Reset**: Prevenir abuse del sistema de email

### 📚 API Endpoints (Operaciones Normales)

```python
RATELIMIT_RATE_GROUPS = {
    'api_read': '100/m',    # GET requests: 100 por minuto
    'api_write': '30/m',    # POST/PUT/PATCH: 30 por minuto
    'api_delete': '10/m',   # DELETE: 10 por minuto
}
```

**Endpoints Protegidos**:
- `GET /api/books/` → 100/minuto
- `GET /api/books/{slug}/` → 100/minuto
- `GET /api/categories/` → 100/minuto
- `GET /api/authors/` → 100/minuto
- `POST /api/books/` → 30/minuto
- `PUT /api/books/{slug}/` → 30/minuto
- `DELETE /api/books/{slug}/` → 10/minuto

**Justificación**:
- **Read**: Alto límite para experiencia fluida
- **Write**: Moderado para prevenir spam
- **Delete**: Bajo para operaciones destructivas

### 🔍 Búsqueda (Operaciones Costosas)

```python
RATELIMIT_RATE_GROUPS = {
    'search': '60/m',  # Búsquedas: 60 por minuto
}
```

**Endpoints Protegidos**:
- `GET /api/books/search/` → 60/minuto
- `GET /api/books/autocomplete/` → 60/minuto

**Justificación**:
- Las búsquedas en Elasticsearch son costosas
- 60/min permite uso normal sin abuse

### 📤 Uploads (Operaciones de Archivos)

```python
RATELIMIT_RATE_GROUPS = {
    'upload': '10/h',  # Uploads: 10 por hora
}
```

**Endpoints Protegidos**:
- `POST /api/books/` (con PDF) → 10/hora
- `POST /api/profile/avatar/` → 10/hora

**Justificación**:
- Uploads consumen ancho de banda
- Límite bajo previene abuse de almacenamiento

### 👨‍💼 Admin (Operaciones Administrativas)

```python
RATELIMIT_RATE_GROUPS = {
    'admin_critical': '20/h',  # Acciones críticas: 20 por hora
}
```

**Uso**:
- Operaciones de borrado masivo
- Cambios de configuración crítica
- Operaciones de mantenimiento

---

## Implementación

### 1. Instalación

```bash
# Agregar a requirements.txt
django-ratelimit>=4.1

# Instalar
pip install -r requirements.txt
```

### 2. Configuración en settings.py

```python
# config/settings.py

# =============================================================================
# RATE LIMITING CONFIGURATION
# =============================================================================

# Use Redis for rate limiting cache
RATELIMIT_USE_CACHE = 'default'

# Enable rate limiting (can be disabled in development)
RATELIMIT_ENABLE = os.getenv('RATELIMIT_ENABLE', 'True').lower() == 'true'

# Default rate limit view for exceeded limits
RATELIMIT_VIEW = 'apps.core.views.rate_limit_exceeded'

# Rate limit groups
RATELIMIT_RATE_GROUPS = {
    'auth_login': '5/m',
    'auth_register': '3/h',
    'auth_password_reset': '3/h',
    'api_read': '100/m',
    'api_write': '30/m',
    'api_delete': '10/m',
    'search': '60/m',
    'upload': '10/h',
    'admin_critical': '20/h',
}

# IP whitelist
RATELIMIT_IP_WHITELIST = os.getenv('RATELIMIT_IP_WHITELIST', '').split(',')

# Headers for real IP (behind proxy)
RATELIMIT_IP_META_KEY = 'HTTP_X_FORWARDED_FOR'

# Log violations
RATELIMIT_LOG_VIOLATIONS = True
```

### 3. Agregar Middleware

```python
# config/settings.py

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Custom middleware
    'apps.core.middleware.RateLimitMiddleware',  # ← Agregar aquí
    'apps.core.middleware.RequestLoggingMiddleware',
]
```

### 4. Variables de Entorno

```bash
# .env

# Rate Limiting
RATELIMIT_ENABLE=True
RATELIMIT_IP_WHITELIST=192.168.1.100,10.0.0.1
```

### 5. Uso en Views

#### Class-Based Views (CBV)

```python
from django.utils.decorators import method_decorator
from apps.core.decorators import rate_limit_api_read, rate_limit_api_write

@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='post')
class BookListView(generics.ListCreateAPIView):
    """
    List and create books.

    Rate limits:
    - GET: 100 requests/min
    - POST: 30 requests/min
    """
    queryset = Book.objects.all()
    serializer_class = BookSerializer
```

#### Function-Based Views (FBV)

```python
from apps.core.decorators import rate_limit_search

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
@rate_limit_search
def search_books(request):
    """
    Search books endpoint.

    Rate limit: 60 requests/min
    """
    query = request.GET.get('q', '')
    results = Book.objects.filter(title__icontains=query)
    return Response(BookSerializer(results, many=True).data)
```

#### Custom Rate Limit

```python
from apps.core.decorators import custom_rate_limit

@custom_rate_limit(rate='50/m', methods=['GET', 'POST'])
def my_custom_view(request):
    """Custom rate limit: 50 requests/min"""
    pass
```

### 6. Decoradores Disponibles

```python
# apps/core/decorators.py

# Autenticación
@rate_limit_auth  # 5/min para login
@rate_limit_register  # 3/h para registro
@rate_limit_password_reset  # 3/h para password reset

# API
@rate_limit_api_read  # 100/min para GET
@rate_limit_api_write  # 30/min para POST/PUT/PATCH
@rate_limit_api_delete  # 10/min para DELETE

# Especializados
@rate_limit_search  # 60/min para búsquedas
@rate_limit_upload  # 10/h para uploads
@rate_limit_admin_critical  # 20/h para admin

# Personalizado
@custom_rate_limit(rate='50/m', methods=['GET'])
```

---

## Testing

### 🧪 Ejecutar Tests

```bash
# Asegurar que Redis esté corriendo
docker-compose up -d redis

# Ejecutar todos los tests de rate limiting
pytest apps/core/test_ratelimit.py -v

# Ejecutar test específico
pytest apps/core/test_ratelimit.py::RateLimitTestCase::test_registration_rate_limit -v

# Con coverage
pytest apps/core/test_ratelimit.py --cov=apps.core.decorators --cov=apps.core.middleware -v
```

### 📝 Tests Implementados

```python
# Test de límites de autenticación
test_registration_rate_limit  # Verifica 3/h
test_password_change_rate_limit  # Verifica 3/h

# Test de límites de API
test_api_read_rate_limit  # Verifica 100/m
test_api_write_rate_limit  # Verifica 30/m
test_search_rate_limit  # Verifica 60/m

# Test de respuestas
test_rate_limit_response_format  # Verifica JSON correcto
test_rate_limit_headers  # Verifica Retry-After header

# Test de whitelist
test_whitelisted_ip_exempt  # IPs whitelistadas no tienen límite

# Test de cache
test_rate_limit_uses_redis_cache  # Usa Redis correctamente

# Test de integración
test_different_methods_different_limits  # GET y POST separados
test_rate_limits_are_independent_per_endpoint  # Endpoints independientes
```

### 🔍 Test Manual con cURL

```bash
# Test básico de rate limit
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:8000/api/auth/register/ \
    -H "Content-Type: application/json" \
    -d '{"email":"test'$i'@example.com","password":"pass123"}' \
    -w "\nStatus: %{http_code}\n\n"
done

# Debería mostrar:
# Requests 1-3: 201 Created (o 400 Bad Request)
# Request 4+: 429 Too Many Requests
```

### 🧪 Test con Python Requests

```python
import requests
import time

url = "http://localhost:8000/api/auth/register/"

# Hacer 4 requests
for i in range(4):
    response = requests.post(url, json={
        "email": f"test{i}@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": f"User{i}"
    })

    print(f"Request {i+1}: Status {response.status_code}")

    if response.status_code == 429:
        print(f"Rate limited! Retry after: {response.headers.get('Retry-After')}s")
        print(f"Response: {response.json()}")
```

---

## Monitoreo

### 📊 Logging de Violaciones

El middleware registra automáticamente todas las violaciones de rate limit:

```python
# En logs/django.log
2026-01-05 10:30:15 WARNING Rate limit exceeded:
  IP=192.168.1.100,
  Method=POST,
  Path=/api/auth/register/,
  User=Anonymous
```

### 🔍 Ver Logs en Tiempo Real

```bash
# Logs de Django
tail -f logs/django.log | grep "Rate limit"

# Logs de Docker
docker-compose logs -f backend | grep "Rate limit"
```

### 📈 Métricas a Monitorear

1. **Violaciones por Endpoint**:
   ```bash
   grep "Rate limit exceeded" logs/django.log | awk -F'Path=' '{print $2}' | awk '{print $1}' | sort | uniq -c
   ```

2. **Violaciones por IP**:
   ```bash
   grep "Rate limit exceeded" logs/django.log | awk -F'IP=' '{print $2}' | awk -F',' '{print $1}' | sort | uniq -c
   ```

3. **Violaciones por Hora**:
   ```bash
   grep "Rate limit exceeded" logs/django.log | awk '{print $1" "$2}' | cut -d':' -f1 | sort | uniq -c
   ```

### 🚨 Alertas Recomendadas

Configurar en Sentry o sistema de monitoreo:

```yaml
Alert 1: High Rate Limit Violations
  Condición: rate_limit_exceeded > 100 en 10 minutos
  Acción: Notificar equipo de seguridad

Alert 2: Specific IP Abuse
  Condición: rate_limit_exceeded > 50 de misma IP en 1 hora
  Acción: Considerar bloqueo temporal

Alert 3: Endpoint Under Attack
  Condición: rate_limit_exceeded > 200 en mismo endpoint en 5 minutos
  Acción: Posible ataque DDoS, escalar
```

---

## Troubleshooting

### ❌ Problema 1: Rate Limit No Funciona

**Síntomas**:
- Requests no son bloqueados
- No se retorna HTTP 429

**Soluciones**:

1. **Verificar que Redis esté corriendo**:
   ```bash
   docker-compose ps redis
   # Debería mostrar "Up"

   # Test de conexión
   docker-compose exec redis redis-cli ping
   # Debería responder "PONG"
   ```

2. **Verificar configuración en settings.py**:
   ```python
   # Asegurar que esté habilitado
   RATELIMIT_ENABLE = True  # No False

   # Verificar cache
   CACHES = {
       'default': {
           'BACKEND': 'django.core.cache.backends.redis.RedisCache',
           'LOCATION': REDIS_URL,
       }
   }
   ```

3. **Verificar middleware está agregado**:
   ```python
   'apps.core.middleware.RateLimitMiddleware' in MIDDLEWARE
   ```

4. **Verificar decorador está aplicado**:
   ```python
   # Debe tener @rate_limit_* decorador
   @rate_limit_api_read
   def my_view(request):
       ...
   ```

### ❌ Problema 2: Rate Limit Demasiado Estricto

**Síntomas**:
- Usuarios legítimos bloqueados
- Muchas quejas de HTTP 429

**Soluciones**:

1. **Ajustar límites en settings.py**:
   ```python
   RATELIMIT_RATE_GROUPS = {
       'api_read': '200/m',  # Aumentar de 100 a 200
   }
   ```

2. **Agregar IPs a whitelist**:
   ```bash
   # .env
   RATELIMIT_IP_WHITELIST=192.168.1.100,10.0.0.50
   ```

3. **Usar rate limit basado en usuario en vez de IP**:
   ```python
   @custom_rate_limit(rate='1000/h', key_func='user')
   def my_view(request):
       ...
   ```

### ❌ Problema 3: Cache Lleno / Redis Out of Memory

**Síntomas**:
- Redis devuelve errores de memoria
- Rate limiting inconsistente

**Soluciones**:

1. **Aumentar memoria de Redis**:
   ```yaml
   # docker-compose.yml
   redis:
     deploy:
       resources:
         limits:
           memory: 512M  # Aumentar de 256M
   ```

2. **Configurar eviction policy**:
   ```bash
   # redis.conf
   maxmemory-policy allkeys-lru  # Evict least recently used
   ```

3. **Reducir TTL de keys**:
   ```python
   # Los rate limits se limpian automáticamente después del periodo
   # (ej: '5/m' → keys expire después de 1 minuto)
   ```

### ❌ Problema 4: Problemas con Proxy / Load Balancer

**Síntomas**:
- Todos los requests parecen venir de misma IP
- Rate limits globales en vez de por usuario

**Soluciones**:

1. **Configurar header correcto**:
   ```python
   # settings.py
   RATELIMIT_IP_META_KEY = 'HTTP_X_FORWARDED_FOR'
   ```

2. **Configurar proxy para pasar IP real**:
   ```nginx
   # nginx.conf
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Real-IP $remote_addr;
   ```

3. **Usar rate limit basado en usuario**:
   ```python
   @ratelimit(key='user', rate='100/m')
   def my_view(request):
       ...
   ```

### ❌ Problema 5: Tests Fallan

**Síntomas**:
- Tests de rate limiting fallan intermitentemente

**Soluciones**:

1. **Limpiar cache antes de tests**:
   ```python
   def setUp(self):
       cache.clear()  # Limpiar antes de cada test
   ```

2. **Asegurar Redis está corriendo**:
   ```bash
   docker-compose up -d redis
   pytest apps/core/test_ratelimit.py
   ```

3. **Usar override_settings para tests**:
   ```python
   @override_settings(RATELIMIT_ENABLE=False)
   def test_without_rate_limiting(self):
       ...
   ```

---

## Mejores Prácticas

### ✅ DO's

1. **Usar límites razonables**:
   - No tan estrictos que bloqueen usuarios legítimos
   - No tan laxos que no protejan contra abuse

2. **Mensajes claros**:
   ```python
   {
       "error": "rate_limit_exceeded",
       "message": "Too many requests. Please try again later.",
       "retry_after": 60
   }
   ```

3. **Whitelist para servicios internos**:
   ```bash
   RATELIMIT_IP_WHITELIST=10.0.0.0/24,192.168.1.100
   ```

4. **Diferentes límites para diferentes endpoints**:
   - Endpoints críticos: Límites estrictos
   - Endpoints públicos: Límites moderados

5. **Monitorear y ajustar**:
   - Revisar logs semanalmente
   - Ajustar límites según uso real

6. **Documentar límites en API docs**:
   ```python
   """
   Rate limit: 100 requests/minute

   Returns:
       429: Too many requests
       {
           "error": "rate_limit_exceeded",
           "retry_after": 60
       }
   """
   ```

### ❌ DON'Ts

1. **No usar rate limiting como única medida de seguridad**:
   - Complementar con autenticación
   - Validación de inputs
   - CSRF protection

2. **No bloquear IPs permanentemente**:
   - Rate limits son temporales
   - Para bloqueos permanentes usar firewall

3. **No usar límites demasiado bajos en desarrollo**:
   ```python
   # Deshabilitar en local si interfiere
   RATELIMIT_ENABLE = os.getenv('DJANGO_ENV') != 'development'
   ```

4. **No ignorar Retry-After header**:
   - Clientes deben respetarlo
   - Implementar exponential backoff

5. **No usar solo IP para rate limiting si hay proxy**:
   - Configurar X-Forwarded-For
   - O usar rate limit basado en usuario

---

## 📚 Referencias

- [django-ratelimit Docs](https://django-ratelimit.readthedocs.io/)
- [RFC 6585 - HTTP 429](https://tools.ietf.org/html/rfc6585)
- [OWASP Rate Limiting](https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks)

---

**Última actualización**: 2026-01-05
**Versión**: 1.0.0
**Sprint**: 7 - DevOps Crítico Parte 1
