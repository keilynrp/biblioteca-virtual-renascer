from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Currency, ExchangeRate
from .serializers import CurrencySerializer, ExchangeRateSerializer
from .services import CurrencySyncService, ExchangeService
from decimal import Decimal

class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.filter(is_active=True)
    serializer_class = CurrencySerializer

    @action(detail=False, methods=['post'])
    def sync_rates(self, request):
        success = CurrencySyncService.sync_rates()
        if success:
            return Response({"message": "Rates synced successfully"}, status=status.HTTP_200_OK)
        return Response({"error": "Failed to sync rates"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'])
    def convert(self, request):
        amount = request.query_params.get('amount')
        from_code = request.query_params.get('from')
        to_code = request.query_params.get('to')

        if not all([amount, from_code, to_code]):
            return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount = Decimal(amount)
            result = ExchangeService.convert(amount, from_code, to_code)
            if result is not None:
                return Response({
                    "from": from_code,
                    "to": to_code,
                    "amount": amount,
                    "result": result
                })
            return Response({"error": "Conversion rate not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ExchangeRateViewSet(viewsets.ModelViewSet):
    queryset = ExchangeRate.objects.all()
    serializer_class = ExchangeRateSerializer
