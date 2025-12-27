# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a Biblioteca Virtual Renascer do Saber! Este documento proporciona guías y mejores prácticas para contribuir al proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Flujo de Trabajo Git](#flujo-de-trabajo-git)
- [Estándares de Código](#estándares-de-código)
- [Testing](#testing)
- [Documentación](#documentación)
- [Proceso de Revisión](#proceso-de-revisión)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamiento inaceptable a los maintainers del proyecto.

### Nuestros Estándares

- Usar lenguaje acogedor e inclusivo
- Ser respetuoso con diferentes puntos de vista y experiencias
- Aceptar crítica constructiva con gracia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros de la comunidad

## 🚀 Cómo Contribuir

### Reportar Bugs

1. Verifica que el bug no haya sido reportado anteriormente en [Issues](https://github.com/keilynrp/biblioteca-virtual-renascer/issues)
2. Si no existe, crea un nuevo issue usando el template de Bug Report
3. Incluye tanta información como sea posible:
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del sistema

### Sugerir Funcionalidades

1. Revisa los [Issues](https://github.com/keilynrp/biblioteca-virtual-renascer/issues) y [Projects](https://github.com/keilynrp/biblioteca-virtual-renascer/projects) existentes
2. Crea un nuevo issue usando el template de Feature Request
3. Describe claramente:
   - El problema que resuelve
   - Tu solución propuesta
   - Alternativas consideradas

### Pull Requests

1. Fork el repositorio
2. Crea una rama desde `main` con un nombre descriptivo
3. Realiza tus cambios
4. Escribe o actualiza tests
5. Asegúrate que todos los tests pasen
6. Actualiza la documentación si es necesario
7. Abre un Pull Request usando el template

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos

- Python 3.11+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker (opcional pero recomendado)

### Setup con Docker

```bash
# Clonar el repositorio
git clone https://github.com/keilynrp/biblioteca-virtual-renascer.git
cd biblioteca-virtual-renascer

# Copiar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Iniciar servicios
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser
```

### Setup Local

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🌿 Flujo de Trabajo Git

### Nombres de Ramas

Usa el formato: `tipo/descripcion-corta`

**Tipos:**
- `feature/` - Nueva funcionalidad
- `fix/` - Corrección de bugs
- `docs/` - Solo documentación
- `style/` - Cambios de estilo/formateo
- `refactor/` - Refactorización de código
- `test/` - Agregar o modificar tests
- `chore/` - Mantenimiento y tareas

**Ejemplos:**
```bash
feature/add-book-search
fix/login-validation-error
docs/update-api-documentation
```

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>[alcance opcional]: <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos de commit:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formateo, punto y comas, etc.
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas de mantenimiento

**Ejemplos:**
```
feat(auth): add password reset functionality
fix(api): resolve CORS issue on book endpoint
docs(readme): update installation instructions
test(payments): add Stripe webhook tests
```

### Commits con Emoji (Opcional)

```
✨ feat: Nueva funcionalidad
🐛 fix: Corrección de bug
📚 docs: Documentación
🎨 style: Formato/estilo
♻️ refactor: Refactorización
✅ test: Tests
🔧 chore: Mantenimiento
⚡ perf: Performance
🔒 security: Seguridad
```

## 📏 Estándares de Código

### Python (Backend)

- Sigue [PEP 8](https://pep8.org/)
- Usa `black` para formateo
- Usa `flake8` para linting
- Máximo 88 caracteres por línea (black default)
- Usa type hints cuando sea posible

```python
# Bueno
def get_book(book_id: int) -> Book:
    """Retorna un libro por su ID."""
    return Book.objects.get(id=book_id)

# Malo
def get_book(book_id):
    return Book.objects.get(id=book_id)
```

### TypeScript/JavaScript (Frontend)

- Sigue [Airbnb Style Guide](https://github.com/airbnb/javascript)
- Usa ESLint + Prettier
- Preferir arrow functions
- Usar TypeScript para todo
- Componentes funcionales con hooks

```typescript
// Bueno
interface BookCardProps {
  book: Book
  onSelect: (id: number) => void
}

export const BookCard: React.FC<BookCardProps> = ({ book, onSelect }) => {
  return <div onClick={() => onSelect(book.id)}>{book.title}</div>
}

// Malo
export function BookCard(props) {
  return <div onClick={() => props.onSelect(props.book.id)}>{props.book.title}</div>
}
```

### Nombres de Variables

- **Descriptivos y claros**: `userEmail` en lugar de `e`
- **CamelCase** en JavaScript/TypeScript
- **snake_case** en Python
- **PascalCase** para componentes React
- **UPPER_SNAKE_CASE** para constantes

### Comentarios

- Comenta **por qué**, no **qué**
- Usa docstrings en Python
- Usa JSDoc en TypeScript
- Mantén comentarios actualizados

```python
# Bueno
def calculate_discount(price: float, user: User) -> float:
    """
    Calcula el descuento aplicable basado en el tipo de suscripción del usuario.

    Usuarios premium reciben 20% de descuento, básicos reciben 10%.
    """
    return price * (0.8 if user.is_premium else 0.9)

# Malo
def calculate_discount(price, user):
    # Calcula descuento
    if user.is_premium:
        return price * 0.8
    return price * 0.9
```

## 🧪 Testing

### Backend

```bash
# Ejecutar todos los tests
pytest

# Con coverage
pytest --cov=apps --cov-report=html

# Test específico
pytest apps/authentication/tests.py::TestLogin
```

**Requisitos:**
- Coverage mínimo del 80%
- Tests para todas las funcionalidades nuevas
- Tests de integración para endpoints

### Frontend

```bash
# Ejecutar tests
npm test

# Con coverage
npm run test:coverage

# E2E tests (cuando estén configurados)
npm run test:e2e
```

**Requisitos:**
- Tests para componentes nuevos
- Tests de integración para flujos críticos
- Coverage mínimo del 70%

## 📚 Documentación

### Cuándo Documentar

- Nuevas funcionalidades
- Cambios en APIs
- Configuraciones complejas
- Decisiones arquitectónicas importantes

### Tipos de Documentación

1. **Código**: Docstrings y comentarios inline
2. **API**: Swagger/OpenAPI (auto-generado)
3. **README**: Instalación y uso básico
4. **Wiki**: Guías detalladas y tutoriales
5. **CHANGELOG**: Cambios por versión

### Formato

- Usa Markdown para documentación
- Incluye ejemplos de código
- Agrega screenshots cuando sea útil
- Mantén la documentación actualizada con el código

## 👀 Proceso de Revisión

### Para Autores de PR

1. **Auto-revisión**: Revisa tu propio código antes de solicitar revisión
2. **Tests**: Asegúrate que todos los tests pasen
3. **Descripción**: Completa el template de PR con toda la información
4. **Tamaño**: Mantén PRs pequeños y enfocados (ideal < 400 líneas)
5. **Responde**: Responde a comentarios de revisión promptamente

### Para Revisores

1. **Tiempo**: Intenta revisar PRs dentro de 2 días hábiles
2. **Constructivo**: Sé constructivo y específico en tus comentarios
3. **Pregunta**: Haz preguntas para entender el contexto
4. **Aprueba**: Solo aprueba cuando estés confiado en los cambios
5. **Testing**: Prueba los cambios localmente si es posible

### Criterios de Aceptación

- [ ] El código sigue los estándares del proyecto
- [ ] Todos los tests pasan (incluyendo los nuevos)
- [ ] La documentación está actualizada
- [ ] No hay merge conflicts
- [ ] Al menos 1 aprobación (2 para cambios críticos)
- [ ] CI/CD pasa exitosamente

## 🏷️ Labels

Usamos estos labels para organizar issues y PRs:

- `bug` - Algo no funciona
- `enhancement` - Nueva funcionalidad
- `documentation` - Mejoras en documentación
- `good first issue` - Bueno para nuevos contribuidores
- `help wanted` - Se necesita ayuda
- `priority: high` - Alta prioridad
- `priority: low` - Baja prioridad
- `wip` - Work in progress
- `needs review` - Necesita revisión

## 🎯 Sprints y Planning

El proyecto sigue metodología Scrum con sprints de 2 semanas. Consulta [PLANNING_SPRINTS_DETALLADO.md](PLANNING_SPRINTS_DETALLADO.md) para más información.

## 📞 Obtener Ayuda

- 💬 [Discussions](https://github.com/keilynrp/biblioteca-virtual-renascer/discussions) - Para preguntas generales
- 🐛 [Issues](https://github.com/keilynrp/biblioteca-virtual-renascer/issues) - Para bugs y features
- 📧 Email - Para asuntos privados o de seguridad

## 🎉 Reconocimientos

Todos los contribuidores serán reconocidos en nuestro README y en las release notes.

---

**¡Gracias por contribuir a Biblioteca Virtual Renascer do Saber!** ❤️
