# Generated migration for adding Stripe PaymentIntent ID

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='stripe_payment_intent_id',
            field=models.CharField(blank=True, help_text='Stripe PaymentIntent ID', max_length=255, null=True),
        ),
    ]
