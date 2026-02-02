# =============================================================================
# Authentication Views - BVS Backend
# =============================================================================
from rest_framework import generics, permissions, status, viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from .serializers import (
    RegisterSerializer, 
    UserSerializer, 
    ChangePasswordSerializer,
    PasswordPolicySerializer,
    ForcePasswordResetSerializer,
    UserPasswordStatusSerializer
)
from .models import PasswordPolicy
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.core.decorators import (
    rate_limit_register,
    rate_limit_password_reset,
    rate_limit_api_write,
    rate_limit_api_read
)

User = get_user_model()


# =============================================================================
# AUTHENTICATION VIEWS
# =============================================================================

@method_decorator(rate_limit_register, name='dispatch')
class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint.

    Rate limit: 3 registrations per hour per IP
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


@method_decorator(rate_limit_api_read, name='get')
@method_decorator(rate_limit_api_write, name='patch')
@method_decorator(rate_limit_api_write, name='put')
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile retrieval and update endpoint.

    Rate limits:
    - GET: 100 requests per minute
    - PATCH/PUT: 30 requests per minute
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


@method_decorator(rate_limit_password_reset, name='dispatch')
class ChangePasswordView(generics.UpdateAPIView):
    """
    Password change endpoint.

    Rate limit: 3 password changes per hour
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ChangePasswordSerializer

    def update(self, request, *args, **kwargs):
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError as DjangoValidationError
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.data.get("old_password")):
            return Response(
                {"old_password": ["Wrong password."]},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate new password
        new_password = serializer.data.get("new_password")
        try:
            validate_password(new_password, user)
        except DjangoValidationError as e:
            return Response(
                {"new_password": list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        
        # Update password_changed_at timestamp and clear force flag
        user.update_password_changed_at()
        
        return Response(
            {"status": "Password updated successfully"},
            status=status.HTTP_200_OK
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
@rate_limit_api_read
def get_user_profile(request):
    """
    Get user profile endpoint (function-based view).

    Rate limit: 100 requests per minute
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    """
    Admin viewset for managing users.
    Supports filtering by institution and searching by username/email.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAdminUser,)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['institution']
    search_fields = ['username', 'email', 'first_name', 'last_name']


# =============================================================================
# PASSWORD POLICY VIEWS
# =============================================================================

class PasswordPolicyView(APIView):
    """
    Get or update the password policy.
    Only admins can update the policy.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        """Get current password policy"""
        policy = PasswordPolicy.get_policy()
        serializer = PasswordPolicySerializer(policy)
        return Response(serializer.data)

    def put(self, request):
        """Update password policy (admin only)"""
        if not request.user.is_staff:
            return Response(
                {"error": "Solo los administradores pueden modificar la política de contraseñas."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        policy = PasswordPolicy.get_policy()
        serializer = PasswordPolicySerializer(policy, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForcePasswordResetView(APIView):
    """
    Force password reset for users.
    Only admins can use this endpoint.
    """
    permission_classes = (permissions.IsAdminUser,)

    def post(self, request):
        """Force password reset for specified users or all non-admin users"""
        serializer = ForcePasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_ids = serializer.validated_data.get('user_ids', [])
        reset_all = serializer.validated_data.get('reset_all', False)
        
        if reset_all:
            # Reset all non-admin users
            affected = User.objects.filter(
                is_staff=False, 
                is_superuser=False
            ).update(force_password_change=True)
        elif user_ids:
            # Reset specific users (excluding admins)
            affected = User.objects.filter(
                id__in=user_ids,
                is_staff=False,
                is_superuser=False
            ).update(force_password_change=True)
        else:
            return Response(
                {"error": "Debe especificar user_ids o reset_all=true"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            "message": f"Se forzó el cambio de contraseña para {affected} usuario(s).",
            "affected_users": affected
        })


class UsersPasswordStatusView(APIView):
    """
    Get password status for all users.
    Only admins can access this endpoint.
    """
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request):
        """Get password status for all users"""
        # Get filter parameters
        expired_only = request.query_params.get('expired_only', 'false').lower() == 'true'
        
        users = User.objects.all().order_by('username')
        
        if expired_only:
            policy = PasswordPolicy.get_policy()
            users = [u for u in users if u.is_password_expired(policy)]
            serializer = UserPasswordStatusSerializer(users, many=True)
        else:
            serializer = UserPasswordStatusSerializer(users, many=True)
        
        return Response({
            "users": serializer.data,
            "total": len(serializer.data)
        })


class CheckPasswordExpirationView(APIView):
    """
    Check if current user's password is expired.
    Used by frontend to show password change prompt.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        """Check password expiration status for current user"""
        user = request.user
        policy = PasswordPolicy.get_policy()
        
        is_expired = user.is_password_expired(policy)
        
        response_data = {
            "is_expired": is_expired,
            "force_change": user.force_password_change,
            "policy_enabled": policy.is_enabled,
            "expiration_days": policy.expiration_days,
            "password_changed_at": user.password_changed_at,
            "is_admin": user.is_staff or user.is_superuser
        }
        
        # Calculate days until expiration
        if user.password_changed_at and policy.is_enabled and not (user.is_staff or user.is_superuser):
            from django.utils import timezone
            expiration_date = user.password_changed_at + timezone.timedelta(days=policy.expiration_days)
            days_left = (expiration_date - timezone.now()).days
            response_data["days_until_expiration"] = max(0, days_left)
        else:
            response_data["days_until_expiration"] = None
        
        return Response(response_data)


