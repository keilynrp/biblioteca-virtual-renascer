from django.db import migrations


HOMEPAGE_PUCK_DATA = {
    "content": [
        {
            "type": "HeroBlock",
            "props": {
                "id": "hero-homepage",
                "title": "Aumenta tu desempeño educacional",
                "subtitle": "Accede a miles de libros digitales, recursos académicos y contenido premium. Disponible 24/7 para tu institución educativa.",
                "backgroundImage": "/hero-image.jpg",
                "overlayOpacity": 60,
                "primaryCta": {"text": "Comenzar Ahora", "url": "/register"},
                "secondaryCta": {"text": "Explorar Biblioteca", "url": "/library"}
            }
        },
        {
            "type": "StatsBlock",
            "props": {
                "id": "stats-homepage",
                "backgroundColor": "primary",
                "items": [
                    {"value": "10,000+", "label": "Libros Digitales", "description": ""},
                    {"value": "500+",    "label": "Instituciones",    "description": ""},
                    {"value": "24/7",    "label": "Acceso Total",     "description": ""}
                ]
            }
        },
        {
            "type": "FeaturesGridBlock",
            "props": {
                "id": "features-homepage",
                "title": "Todo lo que necesitas en una plataforma",
                "subtitle": "Diseñada para instituciones educativas que buscan excelencia académica",
                "columns": 3,
                "items": [
                    {"icon": "Library",       "title": "Biblioteca Personalizable", "description": "Personaliza tu colección según las necesidades específicas de tu institución", "color": "#00576F"},
                    {"icon": "BookOpen",      "title": "Precios por Libro",         "description": "Modelo de pago flexible, solo por el contenido que realmente utilizas",       "color": "#16a34a"},
                    {"icon": "Shield",        "title": "Acreditación Institucional","description": "Soporte completo para procesos de acreditación y certificación",              "color": "#9333ea"},
                    {"icon": "Clock",         "title": "Acceso 24/7",               "description": "Disponibilidad completa desde cualquier dispositivo, en cualquier momento",   "color": "#ea580c"},
                    {"icon": "Users",         "title": "Multi-usuario",             "description": "Gestiona múltiples usuarios y permisos desde un solo panel",                  "color": "#dc2626"},
                    {"icon": "Search",        "title": "Búsqueda Avanzada",         "description": "Motor de búsqueda inteligente para encontrar el contenido que necesitas",    "color": "#0891b2"}
                ]
            }
        },
        {
            "type": "RichTextBlock",
            "props": {
                "id": "cta-homepage",
                "content": "¿Listo para transformar tu biblioteca?\n\nÚnete a cientos de instituciones que ya están mejorando su desempeño educacional.",
                "alignment": "center",
                "maxWidth": "4xl",
                "backgroundColor": "primary"
            }
        }
    ],
    "root": {"props": {}}
}

ABOUT_PUCK_DATA = {
    "content": [
        {
            "type": "HeroBlock",
            "props": {
                "id": "hero-about",
                "title": "Nuestra Misión: Conocimiento sin Límites",
                "subtitle": "En Biblioteca Virtual Renascer do Saber, creemos que el acceso a la educación de calidad debe ser universal, instantáneo y gratificante.",
                "backgroundImage": "",
                "overlayOpacity": 0,
                "primaryCta": {"text": "", "url": ""},
                "secondaryCta": {"text": "", "url": ""}
            }
        },
        {
            "type": "StatsBlock",
            "props": {
                "id": "stats-about",
                "backgroundColor": "gray",
                "items": [
                    {"value": "10k+", "label": "Libros Digitales",      "description": ""},
                    {"value": "500+", "label": "Instituciones Activas", "description": ""},
                    {"value": "50k+", "label": "Estudiantes",           "description": ""}
                ]
            }
        }
    ],
    "root": {"props": {}}
}

CONTACT_PUCK_DATA = {
    "content": [
        {
            "type": "HeroBlock",
            "props": {
                "id": "hero-contact",
                "title": "Contacta con Nosotros",
                "subtitle": "Estamos aquí para ayudarte. Déjanos un mensaje y te responderemos lo antes posible.",
                "backgroundImage": "",
                "overlayOpacity": 0,
                "primaryCta": {"text": "", "url": ""},
                "secondaryCta": {"text": "", "url": ""}
            }
        },
        {
            "type": "RichTextBlock",
            "props": {
                "id": "contact-info",
                "content": "Email: soporte@renascerdosaber.com\nTeléfono: +1 (555) 000-0000\nUbicación: Ciudad de Conocimiento, Digital Center",
                "alignment": "left",
                "maxWidth": "2xl",
                "backgroundColor": "white"
            }
        }
    ],
    "root": {"props": {}}
}

DASHBOARD_HOME_PUCK_DATA = {
    "content": [],
    "root": {"props": {}}
}


def seed_pages(apps, schema_editor):
    Page = apps.get_model('pages', 'Page')
    pages_to_seed = [
        {
            'slug': 'homepage',
            'title': 'Página Principal',
            'page_type': 'marketing',
            'is_published': True,
            'content': HOMEPAGE_PUCK_DATA,
        },
        {
            'slug': 'about',
            'title': 'Acerca de Nosotros',
            'page_type': 'marketing',
            'is_published': True,
            'content': ABOUT_PUCK_DATA,
        },
        {
            'slug': 'contact',
            'title': 'Contacto',
            'page_type': 'marketing',
            'is_published': True,
            'content': CONTACT_PUCK_DATA,
        },
        {
            'slug': 'dashboard-home',
            'title': 'Dashboard Principal',
            'page_type': 'dashboard',
            'is_published': True,
            'content': DASHBOARD_HOME_PUCK_DATA,
        },
    ]
    for page_data in pages_to_seed:
        Page.objects.get_or_create(slug=page_data['slug'], defaults=page_data)


def unseed_pages(apps, schema_editor):
    Page = apps.get_model('pages', 'Page')
    Page.objects.filter(
        slug__in=['homepage', 'about', 'contact', 'dashboard-home']
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_pages, reverse_code=unseed_pages),
    ]
