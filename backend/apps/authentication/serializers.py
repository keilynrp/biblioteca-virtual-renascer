
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from apps.institutions.models import Institution
from .models import PasswordPolicy

User = get_user_model()

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ('id', 'name', 'code', 'logo')

class UserSerializer(serializers.ModelSerializer):
    institution_detail = InstitutionSerializer(source='institution', read_only=True)
    institution = serializers.PrimaryKeyRelatedField(
        queryset=Institution.objects.all(), required=False, allow_null=True
    )
    avatar = serializers.ImageField(required=False, allow_null=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password_expired = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'user_type', 'first_name', 'last_name',
                  'avatar', 'bio', 'phone', 'date_of_birth', 'institution', 'institution_detail',
                  'age_range', 'preferences', 'onboarding_completed',
                  'password_changed_at', 'force_password_change',
                  'password_expired', 'is_staff', 'is_superuser', 'password')
        read_only_fields = ('username', 'email', 'password_changed_at', 'password_expired', 'is_staff', 'is_superuser')

    PASSWORD_MAX_LENGTH = 128

    def validate_password(self, value):
        if value:
            if len(value) > self.PASSWORD_MAX_LENGTH:
                raise serializers.ValidationError(f"La contraseña no puede tener más de {self.PASSWORD_MAX_LENGTH} caracteres.")
            # For existing users, we can validate against the instance
            validate_password(value, user=self.instance)
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
            # Update password history tracking
            user.update_password_changed_at()
        return user

    def get_password_expired(self, obj):
        policy = PasswordPolicy.get_policy()
        return obj.is_password_expired(policy)

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password', 'user_type', 'first_name', 'last_name')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(**validated_data)

class OnboardingSerializer(serializers.Serializer):
    """Accepts the multi-step onboarding data and persists it on the user."""

    VALID_AGE_RANGES = [
        '13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'
    ]
    MAX_PREFERRED_CATEGORIES = 10

    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    user_type = serializers.ChoiceField(choices=User.UserType.choices, required=False)
    age_range = serializers.CharField(required=False, allow_blank=True)
    institution_id = serializers.IntegerField(required=False, allow_null=True)
    preferred_categories = serializers.ListField(
        child=serializers.IntegerField(), required=False, default=list
    )

    def validate_age_range(self, value):
        if value and value not in self.VALID_AGE_RANGES:
            raise serializers.ValidationError(
                f"Rango de edad inválido. Opciones: {', '.join(self.VALID_AGE_RANGES)}"
            )
        return value

    def validate_institution_id(self, value):
        if value is not None and not Institution.objects.filter(pk=value).exists():
            raise serializers.ValidationError("Institución no encontrada.")
        return value

    def validate_preferred_categories(self, value):
        if len(value) > self.MAX_PREFERRED_CATEGORIES:
            raise serializers.ValidationError(
                f"Máximo {self.MAX_PREFERRED_CATEGORIES} categorías permitidas."
            )
        if value:
            from apps.content.models import Category
            existing = Category.objects.filter(pk__in=value).count()
            if existing != len(value):
                raise serializers.ValidationError(
                    "Algunas categorías seleccionadas no existen."
                )
        return value

    def update(self, user, validated_data):
        if 'first_name' in validated_data:
            user.first_name = validated_data['first_name']
        if 'last_name' in validated_data:
            user.last_name = validated_data['last_name']
        if 'user_type' in validated_data:
            user.user_type = validated_data['user_type']
        if 'age_range' in validated_data:
            user.age_range = validated_data['age_range']
        if 'institution_id' in validated_data:
            inst_id = validated_data['institution_id']
            if inst_id:
                user.institution = Institution.objects.get(pk=inst_id)
            else:
                user.institution = None

        prefs = user.preferences or {}
        if 'preferred_categories' in validated_data:
            prefs['preferred_categories'] = validated_data['preferred_categories']
        user.preferences = prefs
        user.onboarding_completed = True
        user.save()
        return user


def validate_password_against_policy(value):
    """Shared password validation against PasswordPolicy rules."""
    policy = PasswordPolicy.get_policy()

    if len(value) < policy.min_length:
        raise serializers.ValidationError(
            f"La contraseña debe tener al menos {policy.min_length} caracteres."
        )
    if policy.require_uppercase and not any(c.isupper() for c in value):
        raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula.")
    if policy.require_lowercase and not any(c.islower() for c in value):
        raise serializers.ValidationError("La contraseña debe contener al menos una letra minúscula.")
    if policy.require_numbers and not any(c.isdigit() for c in value):
        raise serializers.ValidationError("La contraseña debe contener al menos un número.")
    if policy.require_special:
        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if not any(c in special_chars for c in value):
            raise serializers.ValidationError("La contraseña debe contener al menos un carácter especial.")
    return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        return validate_password_against_policy(value)


class PasswordPolicySerializer(serializers.ModelSerializer):
    """Serializer for password policy configuration"""
    
    class Meta:
        model = PasswordPolicy
        fields = (
            'expiration_days', 
            'is_enabled', 
            'min_length',
            'require_uppercase',
            'require_lowercase',
            'require_numbers',
            'require_special',
            'updated_at',
            'updated_by'
        )
        read_only_fields = ('updated_at', 'updated_by')


class ForcePasswordResetSerializer(serializers.Serializer):
    """Serializer for forcing password reset on users"""
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of user IDs to force password reset. If empty, applies to all non-admin users."
    )
    reset_all = serializers.BooleanField(
        default=False,
        help_text="If true, force password reset for all non-admin users."
    )


class UserPasswordStatusSerializer(serializers.ModelSerializer):
    """Serializer for displaying user password status"""
    password_expired = serializers.SerializerMethodField()
    days_until_expiration = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'password_changed_at', 'force_password_change', 
                  'password_expired', 'days_until_expiration', 'is_staff', 'is_superuser')
    
    def get_password_expired(self, obj):
        policy = PasswordPolicy.get_policy()
        return obj.is_password_expired(policy)
    
    def get_days_until_expiration(self, obj):
        if obj.is_superuser or obj.is_staff:
            return None  # Admins don't expire
        
        policy = PasswordPolicy.get_policy()
        if not policy.is_enabled or not obj.password_changed_at:
            return None
        
        from django.utils import timezone
        expiration_date = obj.password_changed_at + timezone.timedelta(days=policy.expiration_days)
        days_left = (expiration_date - timezone.now()).days
        return max(0, days_left)


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset email."""
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming a password reset with a new password."""
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError(
                {"new_password": "Las contraseñas no coinciden."}
            )
        return attrs

    def validate_new_password(self, value):
        return validate_password_against_policy(value)

