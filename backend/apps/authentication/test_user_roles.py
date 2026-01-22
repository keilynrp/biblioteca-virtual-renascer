import pytest
from apps.authentication.models import User

@pytest.mark.django_db
class TestUserRoles:
    """Tests for new administrative roles"""

    def test_administrative_roles_creation(self):
        """Test creating users with new administrative roles"""
        roles = [
            User.UserType.LIBRARIAN,
            User.UserType.MODERATOR,
            User.UserType.CONTENT_MANAGER
        ]
        
        for role in roles:
            user = User.objects.create_user(
                username=f"test_{role}",
                email=f"{role}@example.com",
                password="testpassword123",
                user_type=role
            )
            assert user.user_type == role
            assert user.username == f"test_{role}"
            
    def test_role_choices_content(self):
        """Test that roles have the correct display names"""
        choices = dict(User.UserType.choices)
        assert choices[User.UserType.LIBRARIAN] == "Bibliotecário"
        assert choices[User.UserType.MODERATOR] == "Moderador"
        assert choices[User.UserType.CONTENT_MANAGER] == "Gestor de Conteúdo"
