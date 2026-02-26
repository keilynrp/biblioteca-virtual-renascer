
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView,
    UserProfileView,
    get_user_profile,
    ChangePasswordView,
    UserViewSet,
    PasswordPolicyView,
    ForcePasswordResetView,
    UsersPasswordStatusView,
    CheckPasswordExpirationView,
    OnboardingView,
    OnboardingOptionsView,
)
from rest_framework.routers import DefaultRouter
from django.urls import include

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('user/', get_user_profile, name='user_profile'),
    path('user/update/', UserProfileView.as_view(), name='user_profile_update'),
    path('password/change/', ChangePasswordView.as_view(), name='change_password'),
    
    # Onboarding
    path('onboarding/', OnboardingView.as_view(), name='onboarding'),
    path('onboarding/options/', OnboardingOptionsView.as_view(), name='onboarding_options'),

    # Password Policy endpoints
    path('password-policy/', PasswordPolicyView.as_view(), name='password_policy'),
    path('password-policy/force-reset/', ForcePasswordResetView.as_view(), name='force_password_reset'),
    path('password-policy/users-status/', UsersPasswordStatusView.as_view(), name='users_password_status'),
    path('password-policy/check-expiration/', CheckPasswordExpirationView.as_view(), name='check_password_expiration'),
]

