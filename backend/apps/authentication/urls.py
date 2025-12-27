
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import RegisterView, UserProfileView, get_user_profile, ChangePasswordView

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('user/', get_user_profile, name='user_profile'),
    path('user/update/', UserProfileView.as_view(), name='user_profile_update'),
    path('password/change/', ChangePasswordView.as_view(), name='change_password'),
]
