from django.db import migrations
from django.utils.text import slugify


DEFAULT_CATEGORIES = [
    # ── Ficción y Literatura ──────────────────────────────────────────
    {
        "name": "Literatura y Ficción General",
        "description": "Novelas, cuentos y obras literarias de todos los géneros y tradiciones.",
    },
    {
        "name": "Ciencia Ficción y Fantasía",
        "description": "Mundos imaginarios, tecnología futurista y aventuras fantásticas.",
    },
    {
        "name": "Misterio, Thriller y Terror",
        "description": "Suspenso, crímenes, detectives y narrativas de horror.",
    },
    {
        "name": "Romance y Drama",
        "description": "Historias de amor, relaciones humanas y conflictos emocionales.",
    },
    {
        "name": "Poesía, Teatro y Ensayo",
        "description": "Géneros literarios artísticos, lírica, dramaturgia y escritura reflexiva.",
    },
    {
        "name": "Novela Gráfica y Cómic",
        "description": "Narrativas visuales, manga, historietas y novelas ilustradas.",
    },
    {
        "name": "Literatura Infantil y Juvenil",
        "description": "Libros para niños, jóvenes y lectores en formación.",
    },
    # ── Ciencias y Tecnología ─────────────────────────────────────────
    {
        "name": "Ciencias Naturales",
        "description": "Biología, química, física y ciencias de la tierra.",
    },
    {
        "name": "Matemáticas y Estadística",
        "description": "Álgebra, cálculo, probabilidad y análisis de datos.",
    },
    {
        "name": "Tecnología e Informática",
        "description": "Programación, inteligencia artificial y sistemas digitales.",
    },
    {
        "name": "Medicina y Ciencias de la Salud",
        "description": "Anatomía, farmacología, salud pública y bienestar clínico.",
    },
    {
        "name": "Ingeniería y Arquitectura",
        "description": "Diseño, construcción, mecánica y sistemas técnicos.",
    },
    # ── Humanidades y Cultura ─────────────────────────────────────────
    {
        "name": "Historia y Geografía",
        "description": "Eventos históricos, civilizaciones y estudio del espacio geográfico.",
    },
    {
        "name": "Filosofía y Ética",
        "description": "Pensamiento crítico, corrientes filosóficas y dilemas morales.",
    },
    {
        "name": "Arte, Música y Cine",
        "description": "Expresión artística, teoría musical y estudios cinematográficos.",
    },
    {
        "name": "Religión y Espiritualidad",
        "description": "Teología, tradiciones religiosas y búsqueda espiritual.",
    },
    {
        "name": "Lingüística e Idiomas",
        "description": "Gramática, semiótica, aprendizaje de lenguas y comunicación.",
    },
    # ── Ciencias Sociales ─────────────────────────────────────────────
    {
        "name": "Educación y Pedagogía",
        "description": "Métodos de enseñanza, currículo y desarrollo del aprendizaje.",
    },
    {
        "name": "Psicología y Comportamiento",
        "description": "Mente humana, conducta, emociones y salud mental.",
    },
    {
        "name": "Sociología, Política y Derecho",
        "description": "Sociedad, gobernanza, justicia y relaciones de poder.",
    },
    {
        "name": "Economía, Finanzas y Negocios",
        "description": "Mercados, gestión empresarial y teoría económica.",
    },
    # ── Desarrollo Personal y Estilo de Vida ─────────────────────────
    {
        "name": "Autoayuda y Desarrollo Personal",
        "description": "Habilidades blandas, productividad y crecimiento interior.",
    },
    {
        "name": "Emprendimiento e Innovación",
        "description": "Startups, liderazgo, creatividad e iniciativas de negocio.",
    },
    {
        "name": "Deportes y Vida Activa",
        "description": "Entrenamiento físico, deportes y bienestar corporal.",
    },
    {
        "name": "Gastronomía, Viajes y Lifestyle",
        "description": "Cocina, cultura de viajes y calidad de vida.",
    },
]


def seed_categories(apps, schema_editor):
    Category = apps.get_model("content", "Category")
    for cat in DEFAULT_CATEGORIES:
        slug = slugify(cat["name"])
        Category.objects.get_or_create(
            slug=slug,
            defaults={"name": cat["name"], "description": cat["description"]},
        )


def remove_seeded_categories(apps, schema_editor):
    Category = apps.get_model("content", "Category")
    slugs = [slugify(cat["name"]) for cat in DEFAULT_CATEGORIES]
    Category.objects.filter(slug__in=slugs).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0013_book_available_from"),
    ]

    operations = [
        migrations.RunPython(seed_categories, remove_seeded_categories),
    ]
