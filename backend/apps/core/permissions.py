from rest_framework.permissions import BasePermission

ADMIN_USER_TYPES = ('admin', 'librarian', 'content_manager', 'moderator')


def is_admin_user(user) -> bool:
    """True for staff, superusers, or users with an admin-level user_type."""
    if not user or not user.is_authenticated:
        return False
    return (
        user.is_staff
        or user.is_superuser
        or getattr(user, 'user_type', '') in ADMIN_USER_TYPES
    )


class IsAdminType(BasePermission):
    """Grants access to staff, superusers, and users with admin-level user_type."""

    def has_permission(self, request, view):
        return is_admin_user(request.user)


class IsAdminTypeOrReadOnly(BasePermission):
    """Read-only for everyone; write access requires admin-level user."""

    def has_permission(self, request, view):
        from rest_framework.permissions import SAFE_METHODS
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return is_admin_user(request.user)
