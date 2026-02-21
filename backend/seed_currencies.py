import os
import django
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ['USE_SQLITE'] = 'True'
django.setup()

from apps.currencies.models import Currency, ExchangeRate
from decimal import Decimal

def seed():
    # Base Currency: USD
    usd, created = Currency.objects.get_or_create(
        code='USD',
        defaults={'name': 'US Dollar', 'symbol': '$', 'is_base': True}
    )
    if not created:
        usd.is_base = True
        usd.save()
    print(f"Currency: {usd}")

    # Other Currencies
    eur, _ = Currency.objects.get_or_create(code='EUR', defaults={'name': 'Euro', 'symbol': '€'})
    mxn, _ = Currency.objects.get_or_create(code='MXN', defaults={'name': 'Mexican Peso', 'symbol': '$'})
    cup, _ = Currency.objects.get_or_create(code='CUP', defaults={'name': 'Cuban Peso', 'symbol': '$'})

    # Example rates (approximate/fixed as custom rates)
    rates = [
        (usd, eur, Decimal('0.92')),
        (usd, mxn, Decimal('17.00')),
        (usd, cup, Decimal('120.00')),
    ]

    for from_curr, to_curr, rate in rates:
        er, created = ExchangeRate.objects.get_or_create(
            from_currency=from_curr,
            to_currency=to_curr,
            defaults={'rate': rate, 'is_manual': True}
        )
        if not created:
            er.rate = rate
            er.save()
        print(f"Rate: {er}")

if __name__ == '__main__':
    seed()
