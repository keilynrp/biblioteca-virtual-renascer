# Guía de Logging Centralizado (MON-001)

El sistema utiliza un sistema de logging estructurado en formato JSON para facilitar el diagnóstico de errores en producción y el monitoreo de eventos críticos.

## Ubicación de los Logs
Los logs se almacenan en el directorio `backend/logs/` dentro del contenedor (o localmente si no usas Docker):

- `django.log`: Logs generales del sistema (INFO y superiores).
- `errors.log`: Solo errores y excepciones críticas.
- `security.log`: Eventos de seguridad (fallos de login, problemas con Stripe, etc.).
- `performance.log`: Logs relacionados con el rendimiento de la aplicación.
- `daily.log`: Logs rotados diariamente.

## Formato de Log (JSON)
Cada entrada de log incluye información contextual útil:
```json
{
  "asctime": "2026-01-20 15:45:10",
  "name": "apps.payments.views",
  "levelname": "INFO",
  "message": "Payment confirmed for transaction pi_123",
  "correlation_id": "uuid-a1b2-c3d4",
  "pathname": "/app/apps/payments/views.py",
  "lineno": 105
}
```

### Elementos Clave:
- **correlation_id**: Permite rastrear todas las acciones realizadas durante una misma solicitud HTTP, incluso si generan múltiples entradas de log.
- **levelname**: Facilita el filtrado por severidad (DEBUG, INFO, WARNING, ERROR, CRITICAL).

## Cómo Consultar Logs en Docker
Para ver los logs en tiempo real mientras el sistema está corriendo:
```bash
docker-compose logs -f backend
```

Para buscar un error específico en los archivos persistentes:
```bash
docker exec bvs_backend cat /app/logs/errors.log | grep "Payment"
```

## Monitoreo Externo
El sistema está pre-configurado para enviar errores críticos a **Sentry** si se proporciona la variable `SENTRY_DSN` en el archivo `.env`.
