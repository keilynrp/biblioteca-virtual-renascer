
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import Plan, UserSubscription, InstitutionSubscription
from .serializers import PlanSerializer, UserSubscriptionSerializer, InstitutionSubscriptionSerializer

class PlanListView(generics.ListCreateAPIView):
    queryset = Plan.objects.filter(is_active=True)
    serializer_class = PlanSerializer

    def get_permissions(self):
        if self.request.method in ['POST']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class PlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def destroy(self, request, *args, **kwargs):
        plan = self.get_object()
        plan.is_active = False
        plan.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)

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
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Determine start date
        if start_date:
            start_date_obj = timezone.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        else:
            start_date_obj = timezone.now()

        # Deactivate existing subscriptions
        UserSubscription.objects.filter(user=request.user, is_active=True).update(is_active=False)

        # Create new subscription
        subscription = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            start_date=start_date_obj
        )
        # If explicit end date provided, set it
        if end_date:
            subscription.end_date = timezone.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            subscription.save()

        # End date is auto-calculated in model save() if not set
        
        serializer = UserSubscriptionSerializer(subscription)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class InstitutionSubscriptionViewSet(viewsets.ModelViewSet):
    """
    Viewset for managing Institution Subscriptions.
    Admin only or Institution Managers.
    """
    queryset = InstitutionSubscription.objects.all()
    serializer_class = InstitutionSubscriptionSerializer
    permission_classes = (permissions.IsAdminUser,) # Restricted to admins for now

class CancelSubscriptionView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        subscription = UserSubscription.objects.filter(user=request.user, is_active=True).first()
        if not subscription:
            return Response({"detail": "No active subscription found"}, status=status.HTTP_404_NOT_FOUND)
        
        subscription.is_active = False
        subscription.auto_renew = False # Also turn off auto-renew
        subscription.save()
        
        return Response({"detail": "Subscription cancelled successfully"}, status=status.HTTP_200_OK)
