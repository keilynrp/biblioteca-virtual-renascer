# Testing Guide - Biblioteca Virtual

Este documento explica cómo ejecutar los tests del proyecto.

## Configuración Inicial

### 1. Instalar Dependencias de Testing

```bash
pip install -r requirements.txt
```

Esto instalará:
- `pytest` - Framework de testing
- `pytest-django` - Plugin de pytest para Django
- `pytest-cov` - Coverage reporting
- `factory-boy` - Factories para crear datos de test
- `faker` - Datos fake para tests
- `freezegun` - Control de tiempo en tests

### 2. Configurar Base de Datos de Test

Los tests usan una base de datos SQLite temporal por defecto. No necesitas configuración adicional.

---

## Ejecutar Tests

### Ejecutar Todos los Tests

```bash
cd backend
pytest
```

### Ejecutar Tests con Coverage

```bash
pytest --cov=apps --cov-report=html --cov-report=term
```

Esto generará:
- Reporte en terminal con líneas faltantes
- Reporte HTML en `htmlcov/index.html`

### Ejecutar Tests de un Módulo Específico

```bash
# Solo tests de autenticación
pytest apps/authentication/

# Solo tests de pagos
pytest apps/payments/

# Solo tests de contenido
pytest apps/content/
```

### Ejecutar un Test Específico

```bash
# Por clase
pytest apps/authentication/test_authentication.py::TestUserRegistration

# Por método
pytest apps/authentication/test_authentication.py::TestUserRegistration::test_register_user_success
```

### Ejecutar Tests con Salida Verbose

```bash
pytest -v
```

### Ejecutar Tests y Parar en Primer Fallo

```bash
pytest -x
```

### Ejecutar Tests Marcados

```bash
# Solo tests rápidos
pytest -m "not slow"

# Solo tests de integración
pytest -m integration

# Solo tests unitarios
pytest -m unit
```

---

## Estructura de Tests

```
backend/
├── conftest.py                          # Fixtures globales
├── pytest.ini                           # Configuración de pytest
├── apps/
│   ├── authentication/
│   │   └── test_authentication.py       # Tests de auth
│   ├── payments/
│   │   ├── conftest.py                  # Fixtures de pagos
│   │   └── test_payments.py             # Tests de pagos
│   └── content/
│       ├── conftest.py                  # Fixtures de contenido
│       └── test_content.py              # Tests de contenido
```

---

## Fixtures Disponibles

### Fixtures Globales (conftest.py raíz)

- `api_client` - Cliente API de DRF
- `user_data` - Datos de usuario de ejemplo
- `create_user` - Factory para crear usuarios
- `user` - Usuario estándar
- `admin_user` - Usuario administrador
- `authenticated_client` - Cliente autenticado
- `admin_client` - Cliente admin autenticado
- `get_tokens_for_user` - Genera tokens JWT

### Fixtures de Pagos (apps/payments/conftest.py)

- `basic_plan` - Plan básico de suscripción
- `premium_plan` - Plan premium
- `create_transaction` - Factory para transacciones

### Fixtures de Contenido (apps/content/conftest.py)

- `category` - Categoría de ejemplo
- `another_category` - Segunda categoría
- `author` - Autor de ejemplo
- `another_author` - Segundo autor
- `create_book` - Factory para crear libros
- `book` - Libro estándar
- `premium_book` - Libro premium

---

## Cobertura de Tests

### Objetivo de Cobertura

El proyecto tiene como objetivo >80% de cobertura en código crítico:
- Autenticación: >90%
- Pagos: >90%
- Contenido: >80%
- Core utilities: >70%

### Ver Reporte de Coverage

Después de ejecutar tests con coverage:

```bash
# Ver en terminal
pytest --cov=apps --cov-report=term-missing

# Generar y abrir reporte HTML
pytest --cov=apps --cov-report=html
# Luego abrir htmlcov/index.html en navegador
```

### Configuración de Coverage

La configuración está en `pytest.ini`:

```ini
addopts =
    --cov=apps
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=80
```

Esto significa:
- Cubrir apps/ directory
- Generar reportes HTML y terminal
- **Fallar si coverage < 80%**

---

## Tests Implementados

### ✅ Authentication (`apps/authentication/test_authentication.py`)

**TestUserRegistration** - 6 tests
- ✅ Registro exitoso
- ✅ Email duplicado falla
- ✅ Email inválido falla
- ✅ Contraseña débil falla
- ✅ Campos faltantes fallan
- ✅ User type inválido falla

**TestUserLogin** - 5 tests
- ✅ Login exitoso
- ✅ Contraseña incorrecta falla
- ✅ Usuario inexistente falla
- ✅ Credenciales faltantes fallan
- ✅ Contraseña vacía falla

**TestTokenRefresh** - 3 tests
- ✅ Refresh exitoso
- ✅ Token inválido falla
- ✅ Token faltante falla

**TestUserProfile** - 4 tests
- ✅ Get profile autenticado
- ✅ Get profile no autenticado falla
- ✅ Update profile exitoso
- ✅ Update profile no autenticado falla

**TestPasswordChange** - 4 tests
- ✅ Cambio de contraseña exitoso
- ✅ Contraseña antigua incorrecta falla
- ✅ Nueva contraseña débil falla
- ✅ No autenticado falla

**Total: 22 tests de autenticación**

---

### ✅ Payments (`apps/payments/test_payments.py`)

**TestPaymentIntentCreation** - 4 tests
- ✅ Crear payment intent exitoso (con mock de Stripe)
- ✅ No autenticado falla
- ✅ Plan inválido falla
- ✅ Error de Stripe se maneja correctamente

**TestPaymentConfirmation** - 3 tests
- ✅ Confirmación exitosa crea suscripción
- ✅ Intent ID inválido falla
- ✅ Pago ya completado se maneja

**TestStripeWebhook** - 3 tests
- ✅ Webhook de pago exitoso actualiza transacción
- ✅ Webhook de pago fallido marca como failed
- ✅ Firma inválida es rechazada

**TestTransactionModel** - 2 tests
- ✅ Crear transacción
- ✅ String representation

**TestSubscriptionCreation** - 2 tests
- ✅ Suscripción desde transacción
- ✅ Cálculo de fecha de expiración

**TestPlanModel** - 3 tests
- ✅ Crear plan
- ✅ Features como JSON
- ✅ String representation

**Total: 17 tests de pagos**

---

### ✅ Content (`apps/content/test_content.py`)

**TestBookList** - 6 tests
- ✅ Listar libros público
- ✅ Paginación funciona
- ✅ Filtrar por categoría
- ✅ Filtrar por autor
- ✅ Filtrar premium
- ✅ Buscar por título

**TestBookDetail** - 2 tests
- ✅ Get detalles de libro
- ✅ Libro inexistente retorna 404

**TestBookCreation** - 2 tests
- ✅ Crear libro autenticado
- ✅ Crear libro no autenticado falla

**TestCategoryEndpoints** - 3 tests
- ✅ Listar categorías
- ✅ Get detalles de categoría
- ✅ Crear categoría

**TestAuthorEndpoints** - 3 tests
- ✅ Listar autores
- ✅ Get detalles de autor
- ✅ Crear autor

**TestDashboardStats** - 2 tests
- ✅ Get stats autenticado
- ✅ Get stats no autenticado falla

**TestBookModel** - 2 tests
- ✅ Slug auto-generado
- ✅ String representation

**TestCategoryModel** - 2 tests
- ✅ Slug auto-generado
- ✅ String representation

**TestAuthorModel** - 2 tests
- ✅ String representation
- ✅ Relación con libros

**Total: 24 tests de contenido**

---

## Resumen Total

- **Total de tests**: 63 tests
- **Autenticación**: 22 tests
- **Pagos**: 17 tests
- **Contenido**: 24 tests

---

## Buenas Prácticas

### 1. Escribir Tests Antes o Durante Desarrollo

```python
# Test-Driven Development (TDD)
def test_new_feature():
    # Arrange
    user = create_user()

    # Act
    result = some_function(user)

    # Assert
    assert result.status == 'success'
```

### 2. Usar Fixtures para DRY (Don't Repeat Yourself)

```python
@pytest.fixture
def setup_data(db):
    # Setup complejo reutilizable
    return setup_complex_scenario()

def test_scenario(setup_data):
    assert setup_data.is_valid()
```

### 3. Nombrar Tests Descriptivamente

❌ Mal: `test_1`, `test_user`
✅ Bien: `test_user_can_login_with_valid_credentials`

### 4. Organizar Tests en Classes

```python
@pytest.mark.django_db
class TestUserRegistration:
    """Agrupa todos los tests relacionados con registro"""

    def test_success(self): ...
    def test_duplicate_email(self): ...
    def test_invalid_data(self): ...
```

### 5. Mockear Servicios Externos

```python
@patch('stripe.PaymentIntent.create')
def test_payment(mock_stripe):
    mock_stripe.return_value = MagicMock(id='pi_123')
    # Test sin llamar a Stripe real
```

---

## Debugging Tests

### Test Que Falla

```bash
# Ejecutar con output detallado
pytest -vv apps/authentication/test_authentication.py::TestUserLogin::test_login_success

# Mostrar prints
pytest -s

# Entrar en debugger cuando falla
pytest --pdb
```

### Ver Output de Queries SQL

```python
@pytest.mark.django_db
def test_with_query_debug(django_assert_num_queries):
    with django_assert_num_queries(2):
        # Code que debería ejecutar exactamente 2 queries
        User.objects.all()
```

---

## CI/CD

### GitHub Actions

Los tests se ejecutan automáticamente en cada push/PR:

```yaml
# .github/workflows/tests.yml
- name: Run tests
  run: |
    cd backend
    pytest --cov=apps --cov-fail-under=80
```

### Pre-commit Hook (Opcional)

```bash
# .git/hooks/pre-commit
#!/bin/bash
cd backend
pytest --cov=apps --cov-fail-under=80
```

---

## Troubleshooting

### "No module named 'apps'"

Asegúrate de estar en el directorio `backend/`:
```bash
cd backend
pytest
```

### "Database access not allowed"

Agrega el decorador:
```python
@pytest.mark.django_db
def test_that_uses_db():
    ...
```

### "Fixture 'X' not found"

Verifica que:
1. El fixture esté en `conftest.py`
2. El `conftest.py` esté en el directorio correcto
3. El nombre del fixture sea correcto

### Tests Muy Lentos

```bash
# Ver cuáles tests son lentos
pytest --durations=10

# Marcar tests lentos
@pytest.mark.slow
def test_slow_operation():
    ...

# Ejecutar sin tests lentos
pytest -m "not slow"
```

---

## Próximos Pasos

- [ ] Agregar tests E2E con Selenium/Playwright
- [ ] Tests de performance/carga
- [ ] Tests de seguridad
- [ ] Mejorar coverage a >90% en módulos críticos

---

**Última actualización**: 26 de Diciembre de 2025
