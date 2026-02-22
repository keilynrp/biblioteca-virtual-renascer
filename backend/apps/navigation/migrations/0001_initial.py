from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='NavZone',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(max_length=100)),
                ('location', models.CharField(choices=[('header', 'Header'), ('footer', 'Footer'), ('sidebar_left', 'Sidebar Izq.'), ('sidebar_right', 'Sidebar Der.')], max_length=30)),
                ('order', models.PositiveIntegerField(default=0)),
            ],
            options={
                'verbose_name': 'Zona de Navegación',
                'verbose_name_plural': 'Zonas de Navegación',
                'ordering': ['location', 'order'],
            },
        ),
        migrations.CreateModel(
            name='NavItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('label', models.CharField(max_length=200)),
                ('url', models.CharField(blank=True, max_length=500)),
                ('open_in_new_tab', models.BooleanField(default=False)),
                ('item_type', models.CharField(choices=[('link', 'Enlace'), ('widget', 'Widget')], default='link', max_length=20)),
                ('widget_type', models.CharField(blank=True, max_length=50)),
                ('widget_content', models.JSONField(blank=True, default=dict)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_visible', models.BooleanField(default=True)),
                ('zone', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='navigation.navzone')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='navigation.navitem')),
            ],
            options={
                'verbose_name': 'Ítem de Navegación',
                'verbose_name_plural': 'Ítems de Navegación',
                'ordering': ['order'],
            },
        ),
    ]
