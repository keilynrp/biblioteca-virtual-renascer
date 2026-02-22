from django.db import migrations


def seed_navigation(apps, schema_editor):
    NavZone = apps.get_model('navigation', 'NavZone')
    NavItem = apps.get_model('navigation', 'NavItem')

    # Header zone
    header = NavZone.objects.create(label='Menú Principal', location='header', order=0)
    NavItem.objects.bulk_create([
        NavItem(zone=header, label='Acerca de', url='/about', order=0),
        NavItem(zone=header, label='Precios', url='/pricing', order=1),
        NavItem(zone=header, label='Contacto', url='/contact', order=2),
    ])

    # Footer — Plataforma
    footer_platform = NavZone.objects.create(label='Plataforma', location='footer', order=0)
    NavItem.objects.bulk_create([
        NavItem(zone=footer_platform, label='Inicio', url='/', order=0),
        NavItem(zone=footer_platform, label='Acerca de', url='/about', order=1),
        NavItem(zone=footer_platform, label='Precios', url='/pricing', order=2),
        NavItem(zone=footer_platform, label='Contacto', url='/contact', order=3),
    ])

    # Footer — Cuenta
    footer_account = NavZone.objects.create(label='Cuenta', location='footer', order=1)
    NavItem.objects.bulk_create([
        NavItem(zone=footer_account, label='Iniciar Sesión', url='/login', order=0),
        NavItem(zone=footer_account, label='Registrarse', url='/register', order=1),
        NavItem(zone=footer_account, label='Biblioteca', url='/library', order=2),
    ])


def unseed_navigation(apps, schema_editor):
    NavZone = apps.get_model('navigation', 'NavZone')
    NavZone.objects.filter(label__in=['Menú Principal', 'Plataforma', 'Cuenta']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('navigation', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_navigation, unseed_navigation),
    ]
