# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a **Biblioteca Virtual Renascer do Saber**! Este documento proporciona guías completas, mejores prácticas y estándares para contribuir al proyecto de manera efectiva.

## 📋 Tabla de Contenidos

- [Código de Conducta](#-código-de-conducta)
- [Cómo Empezar](#-cómo-empezar)
- [Formas de Contribuir](#-formas-de-contribuir)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Flujo de Trabajo Git](#-flujo-de-trabajo-git)
- [Estándares de Código](#-estándares-de-código)
- [Testing](#-testing)
- [Documentación](#-documentación)
- [Proceso de Pull Request](#-proceso-de-pull-request)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Preguntas Frecuentes](#-preguntas-frecuentes)

---

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta para garantizar una comunidad acogedora y profesional. Al participar, te comprometes a mantener estos estándares.

### Nuestros Valores

- **Respeto**: Trata a todos con dignidad y profesionalismo
- **Inclusión**: Acoge diferentes perspectivas y experiencias
- **Colaboración**: Trabaja constructivamente con otros
- **Transparencia**: Comunica abiertamente tus intenciones y decisiones
- **Excelencia**: Esfuérzate por código de alta calidad

### Comportamientos Esperados

✅ Usar lenguaje acogedor e inclusivo
✅ Ser respetuoso con diferentes puntos de vista
✅ Aceptar crítica constructiva con gracia
✅ Enfocarse en lo mejor para la comunidad
✅ Mostrar empatía hacia otros miembros

### Comportamientos Inaceptables

❌ Lenguaje o imágenes sexualizadas
❌ Comentarios insultantes o despectivos
❌ Acoso público o privado
❌ Publicar información privada de otros
❌ Conducta poco ética o no profesional

### Reporte de Incidentes

Si presencias o experimentas comportamiento inaceptable, por favor contacta a los maintainers del proyecto. Todas las quejas serán revisadas e investigadas y resultarán en una respuesta apropiada.

---

## 🚀 Cómo Empezar

### Para Nuevos Contribuidores

1. **Lee la documentación**: Familiarízate con el [README.md](README.md) y la [documentación técnica](docs/README.md)
2. **Configura tu entorno**: Sigue la [guía de configuración](#-configuración-del-entorno)
3. **Explora el código**: Navega por la estructura del proyecto
4. **Encuentra una tarea**: Busca issues etiquetados como `good first issue`
5. **Haz preguntas**: No dudes en preguntar en [Discussions](https://github.com/tu-usuario/bvs_framework/discussions)

### ¿Qué habilidades necesito?

**Backend:**
- Python 3.13+
- Django REST Framework
- PostgreSQL
- API REST design

**Frontend:**
- TypeScript / React 19
- Next.js 16
- TailwindCSS
- Gestión de estado (Zustand)

**DevOps:**
- Docker
- Git
- CI/CD (GitHub Actions)

**No necesitas saber todo**. Puedes contribuir en áreas específicas donde tengas experiencia.

---

## 💡 Formas de Contribuir

### 1. Reportar Bugs

Encontraste un bug? Ayúdanos a solucionarlo:

1. **Verifica** que no exista ya un issue similar en [Issues](https://github.com/tu-usuario/bvs_framework/issues)
2. **Crea un nuevo issue** usando el template de Bug Report
3. **Incluye**:
   - Título descriptivo
   - Pasos detallados para reproducir
   - Comportamiento esperado vs actual
   - Screenshots o videos (si aplica)
   - Información del sistema (OS, navegador, versiones)
   - Logs relevantes

**Ejemplo de buen reporte:**

```markdown
**Título**: Login falla con credenciales válidas en Safari

**Descripción**:
Al intentar iniciar sesión con credenciales correctas en Safari 17,
la página se recarga sin autenticar al usuario.

**Pasos para reproducir**:
1. Abrir Safari 17 en macOS
2. Navegar a http://localhost:3000/login
3. Ingresar email: test@example.com, password: Test123!
4. Click en "Iniciar Sesión"

**Resultado esperado**: Usuario autenticado y redirigido al dashboard
**Resultado actual**: Página se recarga sin autenticar

**Ambiente**:
- macOS Sonoma 14.0
- Safari 17.0
- Frontend versión 0.1.0
```

### 2. Sugerir Funcionalidades

Tienes una idea para mejorar el proyecto?

1. **Revisa** los [Issues](https://github.com/tu-usuario/bvs_framework/issues) y el [Roadmap](docs/roadmap/)
2. **Crea un issue** usando el template de Feature Request
3. **Describe**:
   - Problema que resuelve
   - Solución propuesta
   - Alternativas consideradas
   - Mockups o ejemplos (si aplica)

### 3. Mejorar Documentación

La documentación es crucial:

- Corregir typos o errores
- Mejorar claridad de explicaciones
- Agregar ejemplos de código
- Traducir documentación
- Crear tutoriales o guías

### 4. Contribuir con Código

- Implementar nuevas features
- Corregir bugs
- Mejorar performance
- Refactorizar código
- Agregar tests

### 5. Revisar Pull Requests

Ayuda revisando código de otros:

- Verifica que siga los estándares
- Prueba los cambios localmente
- Sugiere mejoras
- Aprueba cuando esté listo

---

## 🛠️ Configuración del Entorno

### Prerequisitos

**Obligatorios:**
- [Git](https://git-scm.com/) 2.30+
- [Docker](https://www.docker.com/get-started) 20.10+ y Docker Compose 2.0+

**Opcional (desarrollo local sin Docker):**
- [Python](https://www.python.org/) 3.13+
- [Node.js](https://nodejs.org/) 22+
- [PostgreSQL](https://www.postgresql.org/) 16+
- [Redis](https://redis.io/) 7+
- [Meilisearch](https://www.meilisearch.com/) 0.31+

### Opción 1: Setup con Docker (Recomendado)

```bash
# 1. Fork y clonar tu fork
git clone https://github.com/TU-USUARIO/bvs_framework.git
cd bvs_framework

# 2. Agregar upstream remote
git remote add upstream https://github.com/ORIGINAL-USER/bvs_framework.git

# 3. Copiar variables de entorno
cp .env.example .env

# 4. Editar .env con tus configuraciones
# (usa tu editor favorito)

# 5. Iniciar contenedores
./scripts/docker/start_containers.sh  # Linux/Mac/WSL
# o
scripts\docker\start_containers.ps1   # Windows PowerShell

# 6. Ejecutar migraciones
docker exec -it bvs-backend python manage.py migrate

# 7. Crear superusuario
docker exec -it bvs-backend python manage.py createsuperuser

# 8. Importar datos de prueba (opcional)
docker exec -it bvs-backend python manage.py import_openlibrary --query "programming" --limit 50

# 9. Verificar que todo funcione
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api
# Admin: http://localhost:8000/admin
```

### Opción 2: Setup Local

#### Backend Setup

```bash
cd backend

# Crear y activar entorno virtual
python -m venv .venv

# Activar
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar y configurar .env
cp .env.example .env
# Edita .env con tus configuraciones de DB, Redis, etc.

# Ejecutar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Instalar dependencias
npm install

# Copiar y configurar .env.local
cp .env.example .env.local
# Edita .env.local con la URL del backend

# Iniciar servidor de desarrollo
npm run dev
```

### Verificar Instalación

```bash
# Backend
curl http://localhost:8000/api/health/

# Frontend
curl http://localhost:3000

# Ejecutar tests
# Backend
docker exec -it bvs-backend python manage.py test
# Frontend
docker exec -it bvs-frontend npm run test:ci
```

---

## 🌿 Flujo de Trabajo Git

### Estructura de Ramas

```
main (rama principal, siempre estable)
  ├── develop (desarrollo activo)
  │   ├── feature/nueva-funcionalidad
  │   ├── fix/correccion-bug
  │   ├── docs/actualizar-readme
  │   └── refactor/mejorar-estructura
  └── hotfix/parche-critico (solo para producción)
```

### Convenciones de Nombres de Ramas

Formato: `tipo/descripcion-corta-en-kebab-case`

**Tipos:**
- `feature/` - Nueva funcionalidad
- `fix/` - Corrección de bugs
- `docs/` - Solo documentación
- `style/` - Cambios de estilo/formateo (no afectan lógica)
- `refactor/` - Refactorización de código
- `test/` - Agregar o modificar tests
- `chore/` - Mantenimiento, dependencias, configs
- `perf/` - Mejoras de performance
- `hotfix/` - Parches críticos para producción

**Ejemplos:**
```bash
feature/add-book-recommendations
feature/implement-dark-mode
fix/login-validation-error
fix/pdf-viewer-zoom-issue
docs/update-api-documentation
refactor/simplify-auth-logic
test/add-subscription-tests
chore/update-dependencies
perf/optimize-search-queries
```

### Workflow Paso a Paso

#### 1. Crear una Rama

```bash
# Asegúrate de estar en main actualizado
git checkout main
git pull upstream main

# Crear y cambiar a nueva rama
git checkout -b feature/mi-nueva-funcionalidad
```

#### 2. Hacer Cambios

```bash
# Edita archivos...

# Ver cambios
git status
git diff

# Agregar cambios al staging
git add archivo1.py archivo2.tsx
# o agregar todo
git add .
```

#### 3. Commit

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
- `style`: Formateo, estilos
- `refactor`: Refactorización
- `perf`: Performance
- `test`: Tests
- `chore`: Mantenimiento
- `ci`: CI/CD
- `build`: Build system

**Ejemplos:**

```bash
# Feature simple
git commit -m "feat(auth): add password reset functionality"

# Fix con alcance
git commit -m "fix(api): resolve CORS issue on book endpoint"

# Con cuerpo
git commit -m "feat(reader): add bookmark functionality

Implementa sistema de marcadores que permite a los usuarios
guardar páginas específicas con títulos y notas personales.

Closes #123"

# Breaking change
git commit -m "feat(api)!: change authentication to JWT

BREAKING CHANGE: Remove session-based auth in favor of JWT.
Update client to use Authorization header."
```

**Reglas de commits:**
- Primera línea: máximo 72 caracteres
- Usar imperativo ("add" no "added")
- Primera línea sin punto final
- Cuerpo opcional, separado por línea en blanco
- Referenciar issues: `Closes #123`, `Fixes #456`

#### 4. Push

```bash
# Primera vez
git push -u origin feature/mi-nueva-funcionalidad

# Siguientes pushes
git push
```

#### 5. Mantener Rama Actualizada

```bash
# Actualizar main local
git checkout main
git pull upstream main

# Volver a tu rama y rebase
git checkout feature/mi-nueva-funcionalidad
git rebase main

# Si hay conflictos, resuélvelos y continúa
git add archivo-resuelto.py
git rebase --continue

# Force push si ya habías pusheado antes
git push --force-with-lease
```

### Commits con Emoji (Opcional pero Divertido)

```
✨ feat: Nueva funcionalidad
🐛 fix: Corrección de bug
📚 docs: Documentación
💄 style: Estilos/UI
♻️ refactor: Refactorización
✅ test: Tests
🔧 chore: Configuración
⚡ perf: Performance
🔒 security: Seguridad
🌐 i18n: Internacionalización
♿ a11y: Accesibilidad
🚀 deploy: Deployment
🔥 remove: Eliminar código
🚧 wip: Work in progress
```

---

## 📏 Estándares de Código

### Python (Backend)

#### Guía de Estilo

Seguimos [PEP 8](https://pep8.org/) con algunas personalizaciones:

- **Formatter**: Black (88 caracteres por línea)
- **Linter**: Flake8 + pylint
- **Type Checker**: mypy
- **Import Sort**: isort

#### Configuración

```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py313']

[tool.isort]
profile = "black"
line_length = 88

[tool.mypy]
python_version = "3.13"
warn_return_any = true
warn_unused_configs = true
```

#### Mejores Prácticas

**1. Type Hints**

```python
# ✅ Bueno
from typing import List, Optional

def get_books(
    category_id: Optional[int] = None,
    limit: int = 10
) -> List[Book]:
    """
    Retorna una lista de libros filtrados por categoría.

    Args:
        category_id: ID de la categoría o None para todos
        limit: Número máximo de resultados

    Returns:
        Lista de objetos Book
    """
    queryset = Book.objects.all()
    if category_id:
        queryset = queryset.filter(category_id=category_id)
    return list(queryset[:limit])

# ❌ Malo
def get_books(category_id=None, limit=10):
    queryset = Book.objects.all()
    if category_id:
        queryset = queryset.filter(category_id=category_id)
    return list(queryset[:limit])
```

**2. Docstrings**

Usa Google style docstrings:

```python
# ✅ Bueno
def calculate_subscription_price(
    plan: Plan,
    user: User,
    promo_code: Optional[str] = None
) -> Decimal:
    """
    Calcula el precio final de una suscripción con descuentos aplicables.

    Args:
        plan: Plan de suscripción seleccionado
        user: Usuario que realiza la compra
        promo_code: Código promocional opcional

    Returns:
        Precio final en Decimal

    Raises:
        ValidationError: Si el código promocional es inválido

    Examples:
        >>> plan = Plan.objects.get(name="Premium")
        >>> user = User.objects.get(email="test@example.com")
        >>> calculate_subscription_price(plan, user)
        Decimal('19.99')
    """
    base_price = plan.price

    # Aplicar descuento por tipo de usuario
    if user.user_type == User.UserType.STUDENT:
        base_price *= Decimal('0.8')  # 20% descuento

    # Aplicar código promocional
    if promo_code:
        promo = PromoCode.validate_code(promo_code)
        base_price *= (1 - promo.discount_percentage)

    return base_price.quantize(Decimal('0.01'))
```

**3. Django Patterns**

```python
# ✅ Bueno - Usa managers personalizados
class BookQuerySet(models.QuerySet):
    def published(self):
        return self.filter(is_published=True)

    def premium(self):
        return self.filter(is_premium=True)

    def by_category(self, category_slug: str):
        return self.filter(category__slug=category_slug)

class Book(models.Model):
    objects = BookQuerySet.as_manager()

# Uso:
Book.objects.published().premium().by_category('programming')

# ❌ Malo - Queries en views
def get_programming_books(request):
    books = Book.objects.filter(
        is_published=True,
        is_premium=True,
        category__slug='programming'
    )
```

**4. Serializers**

```python
# ✅ Bueno
class BookSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'slug', 'description',
            'author', 'author_name',
            'category', 'category_name',
            'cover_image', 'is_premium', 'created_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at']

    def validate_title(self, value: str) -> str:
        """Valida que el título sea único y tenga formato correcto."""
        if len(value) < 3:
            raise serializers.ValidationError("El título debe tener al menos 3 caracteres")
        return value.strip()
```

### TypeScript/JavaScript (Frontend)

#### Guía de Estilo

Seguimos [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) con adaptaciones para TypeScript y React:

- **Linter**: ESLint (config Next.js)
- **Formatter**: Prettier
- **Type Checker**: TypeScript strict mode

#### Mejores Prácticas

**1. Componentes React**

```typescript
// ✅ Bueno - Componente funcional con TypeScript
interface BookCardProps {
  book: Book
  onSelect?: (bookId: number) => void
  showActions?: boolean
  className?: string
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onSelect,
  showActions = true,
  className
}) => {
  const handleClick = useCallback(() => {
    onSelect?.(book.id)
  }, [book.id, onSelect])

  return (
    <div
      className={cn("rounded-lg shadow-md p-4", className)}
      onClick={handleClick}
    >
      <img src={book.coverImage} alt={book.title} />
      <h3 className="text-lg font-bold">{book.title}</h3>
      <p className="text-gray-600">{book.author.name}</p>
      {showActions && <BookActions bookId={book.id} />}
    </div>
  )
}

// ❌ Malo - Sin tipos, sin optimización
export function BookCard(props) {
  return (
    <div onClick={() => props.onSelect(props.book.id)}>
      <img src={props.book.coverImage} />
      <h3>{props.book.title}</h3>
      <p>{props.book.author.name}</p>
    </div>
  )
}
```

**2. Custom Hooks**

```typescript
// ✅ Bueno
interface UseBookFavoritesReturn {
  favorites: Book[]
  isLoading: boolean
  error: Error | null
  toggleFavorite: (bookId: number) => Promise<void>
  isFavorite: (bookId: number) => boolean
}

export const useBookFavorites = (): UseBookFavoritesReturn => {
  const [favorites, setFavorites] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setIsLoading(true)
    try {
      const data = await api.get<Book[]>('/user/favorites/')
      setFavorites(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = useCallback(async (bookId: number) => {
    try {
      await api.post(`/user/favorites/${bookId}/`)
      await loadFavorites()
    } catch (err) {
      setError(err as Error)
    }
  }, [])

  const isFavorite = useCallback((bookId: number) => {
    return favorites.some(book => book.id === bookId)
  }, [favorites])

  return { favorites, isLoading, error, toggleFavorite, isFavorite }
}
```

**3. Estado con Zustand**

```typescript
// ✅ Bueno
interface BookStore {
  books: Book[]
  selectedBook: Book | null
  isLoading: boolean

  // Actions
  setBooks: (books: Book[]) => void
  selectBook: (book: Book | null) => void
  addBook: (book: Book) => void
  removeBook: (bookId: number) => void

  // Async actions
  fetchBooks: () => Promise<void>
  fetchBookById: (id: number) => Promise<void>
}

export const useBookStore = create<BookStore>((set, get) => ({
  books: [],
  selectedBook: null,
  isLoading: false,

  setBooks: (books) => set({ books }),
  selectBook: (book) => set({ selectedBook: book }),

  addBook: (book) => set((state) => ({
    books: [...state.books, book]
  })),

  removeBook: (bookId) => set((state) => ({
    books: state.books.filter(b => b.id !== bookId)
  })),

  fetchBooks: async () => {
    set({ isLoading: true })
    try {
      const books = await api.get<Book[]>('/books/')
      set({ books, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  fetchBookById: async (id) => {
    set({ isLoading: true })
    try {
      const book = await api.get<Book>(`/books/${id}/`)
      set({ selectedBook: book, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  }
}))
```

**4. API Calls**

```typescript
// ✅ Bueno - Cliente API con tipos
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptor para agregar token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  // ... otros métodos
}

export const api = new ApiClient()
```

### Nombres de Variables y Funciones

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Variables (Python) | snake_case | `user_email`, `book_count` |
| Funciones (Python) | snake_case | `get_user_books()`, `calculate_price()` |
| Clases (Python) | PascalCase | `BookManager`, `UserSerializer` |
| Constantes (Python) | UPPER_SNAKE_CASE | `MAX_UPLOAD_SIZE`, `DEFAULT_LIMIT` |
| Variables (TS) | camelCase | `userEmail`, `bookCount` |
| Funciones (TS) | camelCase | `getUserBooks()`, `calculatePrice()` |
| Componentes (React) | PascalCase | `BookCard`, `UserProfile` |
| Interfaces (TS) | PascalCase | `BookProps`, `UserData` |
| Types (TS) | PascalCase | `BookStatus`, `ApiResponse` |
| Enums (TS) | PascalCase | `UserRole`, `BookCategory` |
| Constantes (TS) | UPPER_SNAKE_CASE | `API_URL`, `MAX_FILE_SIZE` |

### Comentarios

**Cuándo comentar:**
- ✅ Explicar **por qué** se hace algo (no **qué** se hace)
- ✅ Lógica compleja o no obvia
- ✅ Workarounds temporales (con TODO/FIXME)
- ✅ Decisiones arquitectónicas importantes
- ❌ No comentar código obvio

```python
# ✅ Bueno - Explica el "por qué"
def calculate_late_fee(days_late: int) -> Decimal:
    """
    Calcula multa por días de retraso en devolución de préstamo.

    Usamos una escala progresiva para incentivar devoluciones tempranas:
    - 1-7 días: $0.50/día
    - 8-14 días: $1.00/día
    - 15+ días: $2.00/día
    """
    if days_late <= 7:
        return Decimal('0.50') * days_late
    elif days_late <= 14:
        return Decimal('0.50') * 7 + Decimal('1.00') * (days_late - 7)
    else:
        return Decimal('0.50') * 7 + Decimal('1.00') * 7 + Decimal('2.00') * (days_late - 14)

# ❌ Malo - Comenta lo obvio
def get_user_by_email(email: str) -> User:
    # Obtiene el usuario por email
    return User.objects.get(email=email)
```

```typescript
// ✅ Bueno - TODOs con contexto
const BookReader: React.FC<Props> = ({ bookId }) => {
  // TODO(john): Migrar a react-pdf v10 cuando se resuelva el bug de renderizado
  // Tracking issue: https://github.com/project/issues/123
  const [page, setPage] = useState(1)

  // FIXME: Memory leak en unmount - investigar cleanup de PDF worker
  useEffect(() => {
    loadPdf(bookId)
  }, [bookId])

  // ...
}
```

---

## 🧪 Testing

### Philosophy de Testing

- **Test lo importante**: Lógica de negocio, casos edge, flujos críticos
- **No test lo trivial**: Getters/setters simples, código auto-generado
- **TDD cuando sea apropiado**: Escribe tests antes del código para features complejas
- **Tests legibles**: Los tests son documentación viva

### Backend Testing (Django + Pytest)

#### Setup

```bash
cd backend

# Instalar dependencias de testing
pip install pytest pytest-django pytest-cov factory-boy

# Ejecutar todos los tests
pytest

# Con coverage
pytest --cov=apps --cov-report=html --cov-report=term

# Test específico
pytest apps/authentication/tests/test_views.py::TestLoginView

# Modo verbose
pytest -v

# Detener en primer fallo
pytest -x
```

#### Estructura de Tests

```
backend/apps/authentication/
├── tests/
│   ├── __init__.py
│   ├── conftest.py           # Fixtures compartidas
│   ├── factories.py          # Factory Boy factories
│   ├── test_models.py
│   ├── test_serializers.py
│   ├── test_views.py
│   └── test_permissions.py
```

#### Ejemplo: Test de Model

```python
# apps/authentication/tests/test_models.py
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestUserModel:
    def test_create_user_with_email(self):
        """Test creación de usuario con email."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        assert user.email == 'test@example.com'
        assert user.check_password('testpass123')
        assert not user.is_staff
        assert not user.is_superuser

    def test_create_superuser(self):
        """Test creación de superusuario."""
        admin = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123'
        )
        assert admin.is_staff
        assert admin.is_superuser

    def test_email_normalization(self):
        """Test normalización de email."""
        user = User.objects.create_user(
            email='test@EXAMPLE.COM',
            password='testpass123'
        )
        assert user.email == 'test@example.com'

    def test_user_str_representation(self):
        """Test representación en string del usuario."""
        user = User(email='test@example.com', first_name='Test')
        assert str(user) == 'test@example.com'
```

#### Ejemplo: Test de API View

```python
# apps/content/tests/test_views.py
import pytest
from rest_framework import status
from rest_framework.test import APIClient
from .factories import UserFactory, BookFactory

@pytest.mark.django_db
class TestBookListView:
    @pytest.fixture
    def api_client(self):
        return APIClient()

    @pytest.fixture
    def user(self):
        return UserFactory()

    @pytest.fixture
    def books(self):
        return BookFactory.create_batch(5)

    def test_list_books_unauthenticated(self, api_client, books):
        """Test listar libros sin autenticación."""
        response = api_client.get('/api/content/books/')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 5

    def test_list_books_authenticated(self, api_client, user, books):
        """Test listar libros autenticado."""
        api_client.force_authenticate(user=user)
        response = api_client.get('/api/content/books/')
        assert response.status_code == status.HTTP_200_OK

    def test_filter_books_by_category(self, api_client, books):
        """Test filtrar libros por categoría."""
        category_slug = books[0].category.slug
        response = api_client.get(
            '/api/content/books/',
            {'category': category_slug}
        )
        assert response.status_code == status.HTTP_200_OK
        for book in response.data['results']:
            assert book['category']['slug'] == category_slug

    def test_pagination(self, api_client):
        """Test paginación de resultados."""
        BookFactory.create_batch(50)
        response = api_client.get('/api/content/books/')
        assert response.status_code == status.HTTP_200_OK
        assert 'next' in response.data
        assert 'previous' in response.data
        assert response.data['count'] == 50
```

#### Factory Boy

```python
# apps/content/tests/factories.py
import factory
from factory.django import DjangoModelFactory
from apps.content.models import Book, Author, Category

class CategoryFactory(DjangoModelFactory):
    class Meta:
        model = Category

    name = factory.Faker('word')
    slug = factory.Faker('slug')
    description = factory.Faker('text')

class AuthorFactory(DjangoModelFactory):
    class Meta:
        model = Author

    name = factory.Faker('name')
    bio = factory.Faker('text')

class BookFactory(DjangoModelFactory):
    class Meta:
        model = Book

    title = factory.Faker('sentence', nb_words=4)
    slug = factory.Faker('slug')
    description = factory.Faker('text')
    author = factory.SubFactory(AuthorFactory)
    category = factory.SubFactory(CategoryFactory)
    isbn = factory.Faker('isbn13')
    is_premium = False
```

### Frontend Testing (Jest + React Testing Library)

#### Setup

```bash
cd frontend

# Ejecutar tests en modo watch
npm run test

# Single run con coverage
npm run test:coverage

# CI mode
npm run test:ci
```

#### Estructura de Tests

```
frontend/src/
├── components/
│   ├── BookCard.tsx
│   └── __tests__/
│       └── BookCard.test.tsx
├── hooks/
│   ├── useBookFavorites.ts
│   └── __tests__/
│       └── useBookFavorites.test.ts
└── app/
    └── (dashboard)/
        └── library/
            ├── page.tsx
            └── __tests__/
                └── page.test.tsx
```

#### Ejemplo: Test de Componente

```typescript
// components/__tests__/BookCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { BookCard } from '../BookCard'
import { mockBook } from '@/tests/mocks'

describe('BookCard', () => {
  it('renders book information correctly', () => {
    render(<BookCard book={mockBook} />)

    expect(screen.getByText(mockBook.title)).toBeInTheDocument()
    expect(screen.getByText(mockBook.author.name)).toBeInTheDocument()
    expect(screen.getByAltText(mockBook.title)).toHaveAttribute(
      'src',
      mockBook.coverImage
    )
  })

  it('calls onSelect when clicked', () => {
    const handleSelect = jest.fn()
    render(<BookCard book={mockBook} onSelect={handleSelect} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleSelect).toHaveBeenCalledWith(mockBook.id)
  })

  it('shows actions when showActions is true', () => {
    render(<BookCard book={mockBook} showActions />)
    expect(screen.getByLabelText('Book actions')).toBeInTheDocument()
  })

  it('hides actions when showActions is false', () => {
    render(<BookCard book={mockBook} showActions={false} />)
    expect(screen.queryByLabelText('Book actions')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <BookCard book={mockBook} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
```

#### Ejemplo: Test de Hook

```typescript
// hooks/__tests__/useBookFavorites.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { useBookFavorites } from '../useBookFavorites'
import * as api from '@/lib/api'

jest.mock('@/lib/api')

describe('useBookFavorites', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('loads favorites on mount', async () => {
    const mockFavorites = [{ id: 1, title: 'Book 1' }]
    ;(api.get as jest.Mock).mockResolvedValue(mockFavorites)

    const { result } = renderHook(() => useBookFavorites())

    await waitFor(() => {
      expect(result.current.favorites).toEqual(mockFavorites)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('toggles favorite correctly', async () => {
    ;(api.post as jest.Mock).mockResolvedValue({})
    ;(api.get as jest.Mock).mockResolvedValue([])

    const { result } = renderHook(() => useBookFavorites())

    await act(async () => {
      await result.current.toggleFavorite(1)
    })

    expect(api.post).toHaveBeenCalledWith('/user/favorites/1/')
  })

  it('checks if book is favorite', async () => {
    const mockFavorites = [{ id: 1, title: 'Book 1' }]
    ;(api.get as jest.Mock).mockResolvedValue(mockFavorites)

    const { result } = renderHook(() => useBookFavorites())

    await waitFor(() => {
      expect(result.current.isFavorite(1)).toBe(true)
      expect(result.current.isFavorite(2)).toBe(false)
    })
  })
})
```

### E2E Testing (Playwright)

```bash
cd frontend

# Ejecutar E2E tests
npm run test:e2e

# Con UI
npm run test:e2e:ui

# Modo headed (ver navegador)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

#### Ejemplo: E2E Test

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('http://localhost:3000/login')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'testpass123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('http://localhost:3000/dashboard')
    await expect(page.locator('text=Bienvenido')).toBeVisible()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login')

    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpass')
    await page.click('button[type="submit"]')

    await expect(
      page.locator('text=Credenciales inválidas')
    ).toBeVisible()
  })
})
```

### Coverage Requirements

| Área | Objetivo | Mínimo Aceptable |
|------|----------|------------------|
| Backend - Lógica de Negocio | 90%+ | 80% |
| Backend - Views/APIs | 85%+ | 75% |
| Backend - Models | 95%+ | 85% |
| Frontend - Componentes Críticos | 80%+ | 70% |
| Frontend - Utils/Helpers | 90%+ | 80% |
| E2E - Flujos Principales | 100% | 90% |

---

## 📚 Documentación

### Tipos de Documentación

1. **Documentación de Código**
   - Docstrings (Python)
   - JSDoc/TSDoc (TypeScript)
   - Comentarios inline (cuando sea necesario)

2. **Documentación de API**
   - OpenAPI/Swagger (auto-generado)
   - Ejemplos de uso
   - Códigos de error

3. **Documentación de Usuario**
   - README.md
   - Guías de instalación
   - Tutoriales

4. **Documentación Técnica**
   - Arquitectura
   - Decisiones de diseño (ADRs)
   - Diagramas

5. **Changelog**
   - Cambios por versión
   - Breaking changes
   - Migraciones

### Cuándo Documentar

Documenta cuando:
- ✅ Agregas nueva funcionalidad
- ✅ Cambias una API pública
- ✅ Implementas algo complejo o no obvio
- ✅ Tomas decisiones arquitectónicas
- ✅ Agregas configuraciones
- ✅ Creas workarounds temporales

No documentes:
- ❌ Código auto-explicativo
- ❌ Tests (el código del test es la documentación)
- ❌ Código que planeas eliminar pronto

### Formato de Documentación

Usa Markdown para toda la documentación:

```markdown
# Título Principal

## Sección

Descripción de la sección.

### Subsección

Contenido con:
- Listas
- **Negrita** para énfasis
- `código inline`
- [Enlaces](https://example.com)

#### Ejemplo de Código

\```python
def example():
    """Docstring del ejemplo."""
    return "Hello"
\```

> Nota importante o advertencia

| Tabla | Ejemplo |
|-------|---------|
| Dato  | Valor   |
```

### Ubicación de Documentación

```
bvs_framework/
├── README.md                    # Punto de entrada principal
├── CONTRIBUTING.md              # Esta guía
├── CHANGELOG.md                 # Historial de cambios
├── LICENSE                      # Licencia MIT
├── docs/
│   ├── README.md               # Índice de documentación
│   ├── setup/                  # Guías de instalación
│   ├── guides/                 # Tutoriales
│   ├── architecture/           # Diseño técnico
│   ├── api/                    # Documentación de API
│   ├── roadmap/                # Planificación
│   └── troubleshooting/        # Solución de problemas
├── backend/
│   └── docs/
│       ├── api-schema.yml      # OpenAPI spec
│       └── deployment.md       # Guía de deployment
└── frontend/
    └── docs/
        ├── components.md       # Documentación de componentes
        └── state-management.md # Gestión de estado
```

---

## 🔄 Proceso de Pull Request

### Antes de Crear el PR

**Checklist:**
- [ ] Código sigue los estándares del proyecto
- [ ] Tests escritos y pasando
- [ ] Coverage cumple con los objetivos
- [ ] Documentación actualizada
- [ ] Commits siguen Conventional Commits
- [ ] Rama actualizada con main (`git rebase main`)
- [ ] No hay conflictos de merge
- [ ] Build local exitoso

### Crear el Pull Request

1. **Push tu rama**
   ```bash
   git push -u origin feature/mi-feature
   ```

2. **Abre PR en GitHub**
   - Ve a tu fork en GitHub
   - Click en "Compare & pull request"
   - Selecciona base: `main` <- compare: `tu-rama`

3. **Completa el Template**

```markdown
## Descripción

Breve descripción de los cambios realizados.

## Tipo de Cambio

- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (cambio que rompe compatibilidad)
- [ ] Mejora de performance
- [ ] Refactorización
- [ ] Documentación

## ¿Cómo se ha probado?

Describe las pruebas realizadas.

- [ ] Test unitarios
- [ ] Test de integración
- [ ] Test E2E
- [ ] Prueba manual

## Checklist

- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado auto-revisión del código
- [ ] He comentado el código en áreas complejas
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] He agregado tests que prueban mi fix/feature
- [ ] Tests nuevos y existentes pasan localmente
- [ ] Cambios dependientes han sido merged

## Screenshots (si aplica)

Agrega screenshots o GIFs.

## Issues Relacionados

Closes #123
Fixes #456
Related to #789

## Notas Adicionales

Cualquier información adicional para los revisores.
```

### Durante la Revisión

**Como Autor:**
- Responde a comentarios constructivamente
- Haz cambios solicitados promptamente
- Explica tus decisiones si difieren de las sugerencias
- Agradece las revisiones (los revisores dedican su tiempo)
- Push cambios a la misma rama (el PR se actualizará automáticamente)

**Como Revisor:**
- Revisa dentro de 2 días hábiles
- Sé constructivo y específico
- Haz preguntas para entender el contexto
- Sugiere mejoras, no impongas
- Aprueba solo cuando confíes en los cambios
- Prueba los cambios localmente si es posible

### Criterios de Aprobación

Un PR puede ser mergeado cuando:
- ✅ Tiene al menos 1 aprobación (2 para cambios críticos)
- ✅ Todos los comentarios han sido resueltos
- ✅ CI/CD pasa exitosamente
- ✅ No tiene conflictos con main
- ✅ Coverage cumple con objetivos
- ✅ Documentación actualizada

### Merge

El equipo de mantenedores hará el merge usando **Squash and Merge** para mantener un historial limpio.

---

## 🏛️ Arquitectura del Proyecto

### Backend (Django)

```
backend/
├── apps/                       # Django apps modulares
│   ├── authentication/         # JWT auth, usuarios
│   ├── content/               # Libros, autores, categorías
│   ├── subscriptions/         # Planes, suscripciones
│   ├── payments/              # Stripe, transacciones
│   ├── loans/                 # Préstamos físicos
│   ├── communities/           # Clubes de lectura
│   ├── notifications/         # Sistema de notificaciones
│   └── core/                  # Utilities compartidas
├── config/                    # Configuración Django
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── manage.py
```

**Principios:**
- **Apps modulares**: Cada app tiene responsabilidad única
- **Fat models, thin views**: Lógica en models/managers
- **Serializers reutilizables**: DRY en serialización
- **Permissions granulares**: Control de acceso preciso

### Frontend (Next.js)

```
frontend/src/
├── app/                       # Next.js App Router
│   ├── (auth)/               # Rutas públicas (login, registro)
│   └── (dashboard)/          # Rutas protegidas
├── components/               # Componentes React
│   ├── ui/                   # Componentes base
│   └── [features]/           # Componentes por feature
├── hooks/                    # Custom hooks
├── store/                    # Estado global (Zustand)
├── lib/                      # Utilities
└── types/                    # TypeScript types
```

**Principios:**
- **Component composition**: Componentes pequeños y reutilizables
- **Server/Client separation**: Server components por defecto
- **Type safety**: TypeScript strict mode
- **Performance**: Code splitting, lazy loading

---

## ❓ Preguntas Frecuentes

### ¿Cuánto tiempo toma revisar un PR?

Intentamos revisar PRs dentro de 2 días hábiles. PRs más grandes pueden tomar más tiempo.

### ¿Puedo trabajar en un issue que ya está asignado?

No, respeta las asignaciones. Si el issue lleva mucho tiempo sin actividad (>2 semanas), puedes preguntar en el issue.

### ¿Cómo encuentro un buen primer issue?

Busca issues con la etiqueta `good first issue`. Son ideales para nuevos contribuidores.

### ¿Necesito firmar un CLA?

No, este proyecto no requiere CLA. Contribuyes bajo la licencia MIT.

### ¿Puedo usar un IDE diferente?

Sí, usa el IDE que prefieras. Recomendamos VS Code o PyCharm pero no es obligatorio.

### ¿Qué hago si mi PR tiene conflictos?

```bash
git checkout main
git pull upstream main
git checkout tu-rama
git rebase main
# Resuelve conflictos
git add .
git rebase --continue
git push --force-with-lease
```

### ¿Puedo contribuir sin saber programar?

Sí! Puedes:
- Mejorar documentación
- Reportar bugs
- Sugerir features
- Traducir contenido
- Diseñar mockups

### ¿Dónde pregunto si tengo dudas?

- **Dudas generales**: [GitHub Discussions](https://github.com/tu-usuario/bvs_framework/discussions)
- **Bugs**: [GitHub Issues](https://github.com/tu-usuario/bvs_framework/issues)
- **Preguntas sobre PR**: Comenta en el PR

---

## 🎯 Próximos Pasos

Ahora que conoces las guías:

1. **Configura tu entorno** siguiendo la [sección de setup](#-configuración-del-entorno)
2. **Explora el código** para familiarizarte con la estructura
3. **Busca un issue** etiquetado como `good first issue`
4. **Únete a Discussions** para presentarte y hacer preguntas
5. **Haz tu primer PR**!

---

## 📞 Contacto

- 💬 **Discussions**: [GitHub Discussions](https://github.com/tu-usuario/bvs_framework/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/tu-usuario/bvs_framework/issues)
- 📧 **Email**: para asuntos privados o de seguridad
- 📖 **Documentación**: [docs/README.md](docs/README.md)

---

## 🙏 Agradecimientos

Gracias por dedicar tu tiempo a contribuir a **Biblioteca Virtual Renascer do Saber**. Cada contribución, grande o pequeña, hace que este proyecto sea mejor para todos.

### Reconocimientos

Todos los contribuidores serán:
- Listados en el README principal
- Mencionados en las release notes
- Reconocidos en la comunidad

---

<div align="center">

**¡Feliz Coding!** 🚀

[⬆ Volver arriba](#-guía-de-contribución)

</div>
