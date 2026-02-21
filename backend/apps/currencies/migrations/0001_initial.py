from django.db import migrations, models
import uuid

class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Currency',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('code', models.CharField(help_text='ISO 4217 code (e.g. USD)', max_length=3, unique=True)),
                ('name', models.CharField(max_length=50)),
                ('symbol', models.CharField(blank=True, max_length=10)),
                ('is_active', models.BooleanField(default=True)),
                ('is_base', models.BooleanField(default=False, help_text='Defines if this is the base currency for exchange rates')),
            ],
            options={
                'verbose_name_plural': 'Currencies',
            },
        ),
        migrations.CreateModel(
            name='ExchangeRate',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('rate', models.DecimalField(decimal_places=6, max_digits=18)),
                ('is_manual', models.BooleanField(default=False, help_text="If true, API sync won't overwrite this rate")),
                ('last_updated', models.DateTimeField(auto_now=True)),
                ('from_currency', models.ForeignKey(on_delete=models.CASCADE, related_name='rates_from', to='currencies.currency')),
                ('to_currency', models.ForeignKey(on_delete=models.CASCADE, related_name='rates_to', to='currencies.currency')),
            ],
            options={
                'unique_together': {('from_currency', 'to_currency')},
            },
        ),
    ]
