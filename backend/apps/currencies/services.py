import requests
from django.conf import settings
from .models import Currency, ExchangeRate
from django.utils import timezone
from decimal import Decimal

class CurrencySyncService:
    @staticmethod
    def sync_rates():
        base_currency = Currency.objects.filter(is_base=True).first()
        if not base_currency:
            print("No base currency defined.")
            return

        currencies = Currency.objects.filter(is_active=True).exclude(id=base_currency.id)
        if not currencies:
            return

        symbols = ','.join([c.code for c in currencies])
        url = f"https://api.frankfurter.app/latest?from={base_currency.code}&to={symbols}"

        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            rates = data.get('rates', {})

            for code, rate in rates.items():
                target_currency = Currency.objects.get(code=code)
                exchange_rate, created = ExchangeRate.objects.get_or_create(
                    from_currency=base_currency,
                    to_currency=target_currency
                )
                
                if not exchange_rate.is_manual:
                    exchange_rate.rate = Decimal(str(rate))
                    exchange_rate.save()
                    
            return True
        except Exception as e:
            print(f"Error syncing rates: {e}")
            return False

class ExchangeService:
    @staticmethod
    def convert(amount, from_code, to_code):
        if from_code == to_code:
            return amount

        # Try direct conversion
        rate_obj = ExchangeRate.objects.filter(
            from_currency__code=from_code, 
            to_currency__code=to_code
        ).first()

        if rate_obj:
            return amount * rate_obj.rate

        # Try inverse conversion
        inverse_rate = ExchangeRate.objects.filter(
            from_currency__code=to_code, 
            to_currency__code=from_code
        ).first()

        if inverse_rate and inverse_rate.rate != 0:
            return amount / inverse_rate.rate

        # Try middle-man conversion (via base currency)
        base_currency = Currency.objects.filter(is_base=True).first()
        if base_currency:
            # from -> base -> to
            to_base_rate = ExchangeService.convert(Decimal('1.0'), from_code, base_currency.code)
            from_base_rate = ExchangeService.convert(Decimal('1.0'), base_currency.code, to_code)
            
            if to_base_rate and from_base_rate:
                return amount * to_base_rate * from_base_rate

        return None
