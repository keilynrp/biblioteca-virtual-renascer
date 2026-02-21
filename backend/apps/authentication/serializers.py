
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
    institution_id = serializers.PrimaryKeyRelatedField(
        queryset=Institution.objects.all(), source='institution', write_only=True, required=False, allow_null=True
    )
    avatar = serializers.ImageField(required=False, allow_null=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    password_expired = serializers.SerializerMethodField()
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'user_type', 'first_name', 'last_name', 
                  'avatar', 'bio', 'phone', 'date_of_birth', 'institution_detail', 
                  'institution_id', 'password_changed_at', 'force_password_change', 
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
    last_name = serializers.CharField(required=True)

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

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        # Validate against policy requirements
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

