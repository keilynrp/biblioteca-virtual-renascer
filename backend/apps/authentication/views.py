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
    UserPasswordStatusSerializer,
    OnboardingSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .models import PasswordPolicy, User as UserModel
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.core.mail import send_mail
import os
import logging
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

    def perform_create(self, serializer):
        user = serializer.save()
        try:
            from apps.notifications.helpers import send_welcome_notification
            send_welcome_notification(user)
        except Exception as e:
            logger.warning(f"Could not send welcome notification to {user.username}: {e}")


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
    serializer = UserSerializer(request.user, context={'request': request})
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
# ONBOARDING VIEWS
# =============================================================================

class OnboardingView(APIView):
    """Save multi-step onboarding data for the authenticated user."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        # Admins skip onboarding — mark as completed without requiring data
        if request.user.is_staff or request.user.is_superuser:
            if not request.user.onboarding_completed:
                request.user.onboarding_completed = True
                request.user.save(update_fields=['onboarding_completed'])
            return Response(
                UserSerializer(request.user, context={'request': request}).data,
                status=status.HTTP_200_OK,
            )

        serializer = OnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.update(request.user, serializer.validated_data)
        return Response(
            UserSerializer(request.user, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )


class OnboardingOptionsView(APIView):
    """Return all selectable options for the onboarding form."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        from apps.content.models import Category
        from apps.institutions.models import Institution

        categories = list(
            Category.objects.values('id', 'name', 'slug', 'description').order_by('name')
        )
        institutions = list(
            Institution.objects.values('id', 'name', 'code').order_by('name')
        )
        user_types = [
            {'value': choice[0], 'label': str(choice[1])}
            for choice in UserModel.UserType.choices
            if choice[0] not in ('admin', 'moderator', 'content_manager')
        ]
        age_ranges = [
            {'value': '13-17', 'label': '13 – 17 años'},
            {'value': '18-24', 'label': '18 – 24 años'},
            {'value': '25-34', 'label': '25 – 34 años'},
            {'value': '35-44', 'label': '35 – 44 años'},
            {'value': '45-54', 'label': '45 – 54 años'},
            {'value': '55-64', 'label': '55 – 64 años'},
            {'value': '65+', 'label': '65+ años'},
        ]

        return Response({
            'categories': categories,
            'institutions': institutions,
            'user_types': user_types,
            'age_ranges': age_ranges,
        })


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


# =============================================================================
# PASSWORD RESET VIEWS
# =============================================================================

logger = logging.getLogger(__name__)


@method_decorator(rate_limit_password_reset, name='dispatch')
class PasswordResetRequestView(APIView):
    """
    Request a password reset email.

    Rate limit: 3 per hour per IP.
    Always returns 200 to prevent email enumeration.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            # Return success anyway to prevent email enumeration
            return Response(
                {"message": "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación."},
                status=status.HTTP_200_OK
            )

        # Generate token and uid
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Build reset URL (frontend URL)
        site_url = os.getenv('SITE_URL', 'http://localhost:3000')
        reset_link = f"{site_url}/reset-password?uid={uid}&token={token}"

        # Send email
        self._send_reset_email(user, reset_link)

        return Response(
            {"message": "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación."},
            status=status.HTTP_200_OK
        )

    def _send_reset_email(self, user, reset_link):
        """Send password reset email using the mailer service or Django fallback."""
        display_name = user.first_name or user.username
        subject = "Recuperación de contraseña - Biblioteca Virtual"
        body_text = (
            f"Hola {display_name},\n\n"
            f"Recibimos una solicitud para restablecer tu contraseña.\n\n"
            f"Haz clic en el siguiente enlace para crear una nueva contraseña:\n"
            f"{reset_link}\n\n"
            f"Este enlace expira en 24 horas.\n\n"
            f"Si no solicitaste este cambio, ignora este correo.\n\n"
            f"---\n"
            f"Biblioteca Virtual Renascer"
        )
        body_html = f"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="font-family:sans-serif;background:#f4f4f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#00576F;padding:24px 32px;text-align:center;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;">Biblioteca Virtual Renascer</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#1a1a1a;margin-top:0;">Recuperación de contraseña</h2>
      <p style="color:#444444;line-height:1.6;">Hola {display_name},</p>
      <p style="color:#444444;line-height:1.6;">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva:</p>
      <p style="text-align:center;margin:32px 0;">
        <a href="{reset_link}" style="display:inline-block;padding:14px 32px;background:#00576F;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:16px;">
          Restablecer contraseña
        </a>
      </p>
      <p style="color:#888888;font-size:13px;line-height:1.5;">Este enlace expira en 24 horas. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
    </div>
    <div style="background:#f9f9f9;padding:16px 32px;text-align:center;border-top:1px solid #eeeeee;">
      <p style="color:#888888;font-size:12px;margin:0;">Biblioteca Virtual Renascer</p>
    </div>
  </div>
</body>
</html>
""".strip()

        # Try mailer service first, then fallback
        try:
            from apps.mailer.models import SMTPConfig
            from apps.mailer import services as mailer_services
            cfg = SMTPConfig.get_config()
            if cfg.is_active:
                mailer_services.send_email(
                    to=user.email,
                    subject=subject,
                    body_text=body_text,
                    body_html=body_html,
                    template_key='password_reset',
                )
                return
        except Exception as e:
            logger.warning(f"Mailer service failed, falling back to Django mail: {e}")

        try:
            send_mail(
                subject=subject,
                message=body_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
                html_message=body_html,
            )
        except Exception as e:
            logger.error(f"Failed to send password reset email: {e}")


class PasswordResetConfirmView(APIView):
    """
    Confirm password reset with uid, token, and new password.
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {"error": "Enlace inválido o expirado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, serializer.validated_data['token']):
            return Response(
                {"error": "Enlace inválido o expirado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        user.update_password_changed_at()

        return Response(
            {"message": "Contraseña restablecida exitosamente."},
            status=status.HTTP_200_OK
        )
