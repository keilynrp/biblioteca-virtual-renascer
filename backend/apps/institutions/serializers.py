
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Institution, InstitutionMembership

User = get_user_model()


class InstitutionSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Institution
        fields = ('id', 'name', 'code', 'logo', 'website', 'address', 'member_count', 'created_at')

    def get_member_count(self, obj):
        return obj.memberships.filter(status='active').count()


class MembershipUserSerializer(serializers.ModelSerializer):
    """Lightweight user serializer for membership listings."""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class InstitutionMembershipSerializer(serializers.ModelSerializer):
    user_detail = MembershipUserSerializer(source='user', read_only=True)
    invited_by_name = serializers.SerializerMethodField()

    class Meta:
        model = InstitutionMembership
        fields = (
            'id', 'user', 'user_detail', 'institution', 'role', 'status',
            'invited_by', 'invited_by_name', 'joined_at', 'expires_at',
        )
        read_only_fields = ('joined_at', 'invited_by')

    def get_invited_by_name(self, obj):
        return obj.invited_by.username if obj.invited_by else None


class InviteMemberSerializer(serializers.Serializer):
    """Invite a single user to an institution by email."""
    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=['admin', 'librarian', 'member'],
        default='member',
    )


class BulkInviteSerializer(serializers.Serializer):
    """Accept a CSV file for bulk member invitations."""
    csv_file = serializers.FileField(
        help_text="CSV con columnas: email, role (opcional). Max 500 rows."
    )


class InstitutionDashboardSerializer(serializers.Serializer):
    """Read-only stats for institution dashboard."""
    institution = InstitutionSerializer(read_only=True)
    total_members = serializers.IntegerField()
    active_members = serializers.IntegerField()
    pending_members = serializers.IntegerField()
    suspended_members = serializers.IntegerField()
    seats_limit = serializers.IntegerField()
    seats_available = serializers.IntegerField()
    subscription_plan = serializers.CharField(allow_null=True)
    subscription_end = serializers.DateTimeField(allow_null=True)
    collections_count = serializers.IntegerField()
