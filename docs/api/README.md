# 🔧 Documentación de API

Documentación completa de los endpoints y APIs del proyecto Biblioteca Virtual Renascer do Saber.

## 📋 Índice

- [Visión General](#-visión-general)
- [Autenticación](#-autenticación)
- [Endpoints por Módulo](#-endpoints-por-módulo)
- [Modelos de Datos](#-modelos-de-datos)
- [Códigos de Estado](#-códigos-de-estado)
- [Rate Limiting](#-rate-limiting)
- [Ejemplos de Uso](#-ejemplos-de-uso)

---

## 🌐 Visión General

### URLs Base

| Ambiente | URL Base |
|----------|----------|
| Desarrollo | `http://localhost:8000/api` |
| Producción | `https://tu-dominio.com/api` |

### Documentación Interactiva

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`
- **OpenAPI Schema**: `http://localhost:8000/api/schema/`

### Formato de Respuesta

Todas las respuestas de la API siguen este formato:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "errors": null
}
```

En caso de error:

```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "errors": {
    "field": ["Error detail"]
  }
}
```

---

## 🔐 Autenticación

### JWT Authentication

La API utiliza JSON Web Tokens (JWT) para autenticación.

#### Obtener Token

```http
POST /api/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Respuesta:

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### Refresh Token

```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Usar Token

Incluye el access token en el header Authorization:

```http
GET /api/content/books/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## 📚 Endpoints por Módulo

### Authentication (`/api/auth/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login/` | Iniciar sesión | No |
| POST | `/auth/register/` | Registrar usuario | No |
| POST | `/auth/refresh/` | Refresh access token | No |
| GET | `/auth/user/` | Obtener perfil | Sí |
| PUT | `/auth/user/update/` | Actualizar perfil | Sí |
| POST | `/auth/password/change/` | Cambiar contraseña | Sí |

**Ver:** [Authentication API](authentication.md)

### Content (`/api/content/`)

#### Books

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/content/books/` | Listar libros | No |
| GET | `/content/books/{slug}/` | Detalle del libro | No |
| GET | `/content/books/{slug}/similar/` | Libros similares | No |
| GET | `/content/books/{book_id}/file/` | Descargar PDF | Sí |

#### Reviews

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/content/books/{slug}/reviews/` | Listar reseñas | No |
| POST | `/content/books/{slug}/reviews/` | Crear reseña | Sí |
| PUT | `/content/reviews/{id}/` | Actualizar reseña | Sí |
| DELETE | `/content/reviews/{id}/` | Eliminar reseña | Sí |
| POST | `/content/reviews/{id}/helpful/` | Marcar útil | Sí |

#### Favorites

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/content/user/favorites/` | Listar favoritos | Sí |
| POST | `/content/user/favorites/{book_id}/` | Toggle favorito | Sí |

#### Reading History

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/content/user/reading-history/` | Listar historial | Sí |
| POST | `/content/user/readings/start/{book_id}/` | Iniciar lectura | Sí |
| POST | `/content/user/readings/{book_id}/progress/` | Actualizar progreso | Sí |

#### Annotations

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/content/user/bookmarks/` | Listar marcadores | Sí |
| POST | `/content/user/bookmarks/` | Crear marcador | Sí |
| GET | `/content/user/highlights/` | Listar resaltados | Sí |
| POST | `/content/user/highlights/` | Crear resaltado | Sí |
| GET | `/content/user/annotations/` | Listar anotaciones | Sí |
| POST | `/content/user/annotations/` | Crear anotación | Sí |

#### Search

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/content/search/` | Búsqueda avanzada | No |
| GET | `/content/search/autocomplete/` | Autocompletado | No |

**Ver:** [Content API](content.md)

### Subscriptions (`/api/subscriptions/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/subscriptions/plans/` | Listar planes | No |
| GET | `/subscriptions/subscription/` | Suscripción actual | Sí |
| POST | `/subscriptions/subscription/` | Crear suscripción | Sí |
| POST | `/subscriptions/subscription/cancel/` | Cancelar suscripción | Sí |

**Ver:** [Subscriptions API](subscriptions.md)

### Payments (`/api/payments/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/payments/stripe-config/` | Config pública Stripe | No |
| POST | `/payments/checkout/` | Crear checkout | Sí |
| POST | `/payments/confirm-payment/` | Confirmar pago | Sí |
| POST | `/payments/webhook/` | Webhook Stripe | No* |

*Requiere firma de Stripe

**Ver:** [Payments API](payments.md)

### Loans (`/api/loans/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/loans/` | Listar préstamos | Sí |
| POST | `/loans/borrow/` | Solicitar préstamo | Sí |
| POST | `/loans/{id}/return/` | Devolver libro | Sí |
| POST | `/loans/{id}/renew/` | Renovar préstamo | Sí |
| GET | `/loans/history/` | Historial de préstamos | Sí |

**Ver:** [Loans API](loans.md)

### Communities (`/api/communities/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/communities/clubs/` | Listar clubes | No |
| POST | `/communities/clubs/` | Crear club | Sí |
| GET | `/communities/clubs/{id}/` | Detalle del club | No |
| POST | `/communities/clubs/{id}/join/` | Unirse al club | Sí |
| GET | `/communities/clubs/{id}/discussions/` | Listar discusiones | No |
| POST | `/communities/clubs/{id}/discussions/` | Crear discusión | Sí |

**Ver:** [Communities API](communities.md)

### Notifications (`/api/notifications/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/notifications/` | Listar notificaciones | Sí |
| POST | `/notifications/{id}/mark-as-read/` | Marcar como leída | Sí |
| POST | `/notifications/mark-all-read/` | Marcar todas leídas | Sí |

**Ver:** [Notifications API](notifications.md)

### Dashboard (`/api/content/dashboard/`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/content/dashboard/stats/` | Estadísticas usuario | Sí |

---

## 📊 Modelos de Datos

### User

```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "user_type": "student",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "Biography text",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-01",
  "is_active": true,
  "date_joined": "2024-01-01T00:00:00Z"
}
```

### Book

```json
{
  "id": 1,
  "title": "Book Title",
  "slug": "book-title",
  "description": "Book description",
  "author": {
    "id": 1,
    "name": "Author Name",
    "bio": "Author biography"
  },
  "category": {
    "id": 1,
    "name": "Category Name",
    "slug": "category-slug"
  },
  "cover_image": "https://example.com/cover.jpg",
  "pdf_file": "https://example.com/book.pdf",
  "isbn": "978-3-16-148410-0",
  "published_date": "2024-01-01",
  "is_premium": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Review

```json
{
  "id": 1,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John"
  },
  "book": 1,
  "rating": 5,
  "title": "Great book!",
  "comment": "This book was amazing...",
  "helpful_count": 10,
  "is_verified_reader": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Plan

```json
{
  "id": 1,
  "name": "Premium",
  "description": "Premium plan description",
  "price": "19.99",
  "currency": "USD",
  "duration_days": 30,
  "plan_type": "individual",
  "features": {
    "books_per_month": 10,
    "premium_content": true,
    "offline_reading": true
  },
  "is_active": true
}
```

**Ver más modelos en:** [Data Models](models.md)

---

## 🚦 Códigos de Estado

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Operación exitosa sin respuesta |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no encontrado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

---

## ⏱️ Rate Limiting

La API implementa rate limiting para prevenir abuso:

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/auth/login/` | 5 requests | 15 minutos |
| `/content/search/` | 30 requests | 1 minuto |
| Otros endpoints | 100 requests | 1 minuto |

Cuando se excede el límite, la respuesta es:

```json
{
  "detail": "Request was throttled. Expected available in 59 seconds."
}
```

Headers de respuesta:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1609459200
```

---

## 💡 Ejemplos de Uso

### Python (Requests)

```python
import requests

# Login
response = requests.post(
    'http://localhost:8000/api/auth/login/',
    json={
        'email': 'user@example.com',
        'password': 'password123'
    }
)
data = response.json()
access_token = data['access']

# Usar token
headers = {'Authorization': f'Bearer {access_token}'}
books = requests.get(
    'http://localhost:8000/api/content/books/',
    headers=headers
)
print(books.json())
```

### JavaScript (Fetch)

```javascript
// Login
const response = await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const data = await response.json();
const accessToken = data.access;

// Usar token
const books = await fetch('http://localhost:8000/api/content/books/', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const booksData = await books.json();
console.log(booksData);
```

### cURL

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Usar token
curl -X GET http://localhost:8000/api/content/books/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

## 🔄 Paginación

Los endpoints que retornan listas implementan paginación:

```http
GET /api/content/books/?page=2&page_size=20
```

Respuesta:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/content/books/?page=3",
  "previous": "http://localhost:8000/api/content/books/?page=1",
  "results": [...]
}
```

Parámetros:
- `page`: Número de página (default: 1)
- `page_size`: Elementos por página (default: 10, max: 100)

---

## 🔍 Filtros y Búsqueda

### Filtros Comunes

```http
GET /api/content/books/?category=programming&is_premium=false
```

### Ordenamiento

```http
GET /api/content/books/?ordering=-created_at
```

- Ascendente: `ordering=field`
- Descendente: `ordering=-field`

### Búsqueda

```http
GET /api/content/search/?q=python&category=programming&limit=20
```

---

## 📖 Documentación Detallada

Para documentación detallada de cada módulo, consulta:

- [Authentication API](authentication.md)
- [Content API](content.md)
- [Subscriptions API](subscriptions.md)
- [Payments API](payments.md)
- [Loans API](loans.md)
- [Communities API](communities.md)
- [Notifications API](notifications.md)
- [Data Models](models.md)

---

## 🛠️ Herramientas de Testing

### Postman Collection

Descarga la colección de Postman: [BVS API Collection](../postman/BVS_API_Collection.json)

### Swagger UI

Accede a la interfaz interactiva: http://localhost:8000/api/docs/

---

## 📞 Soporte

¿Encontraste un bug o tienes una pregunta?

- 🐛 [Reportar Issue](https://github.com/tu-usuario/bvs_framework/issues)
- 💬 [Discussions](https://github.com/tu-usuario/bvs_framework/discussions)
- 📖 [Documentación Principal](../README.md)

---

<div align="center">

[⬆ Volver arriba](#-documentación-de-api)

**Desarrollado con ❤️ para la comunidad de Renascer do Saber**

</div>
