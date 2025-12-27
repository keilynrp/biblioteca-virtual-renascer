
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Plan, UserSubscription
from .serializers import PlanSerializer, UserSubscriptionSerializer

class PlanListView(generics.ListAPIView):
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer
    permission_classes = (permissions.AllowAny,)

class SubscriptionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        # Get current active subscription
        # Simplification: User can have only one active subscription for now
        subscription = UserSubscription.objects.filter(user=request.user, is_active=True).first()
        if not subscription:
            return Response({"detail": "No active subscription"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = UserSubscriptionSerializer(subscription)
        return Response(serializer.data)

    def post(self, request):
        plan_id = request.data.get('plan_id')
        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)

        # Deactivate existing subscriptions
        UserSubscription.objects.filter(user=request.user, is_active=True).update(is_active=False)

        # Create new subscription
        subscription = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            start_date=timezone.now()
        )
        # End date is auto-calculated in model save()

        serializer = UserSubscriptionSerializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
