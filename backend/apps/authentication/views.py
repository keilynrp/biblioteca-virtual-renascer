# =============================================================================
# Authentication Views - BVS Backend
# =============================================================================
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from .serializers import RegisterSerializer, UserSerializer, ChangePasswordSerializer
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
