
import csv
import io
import logging
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import IntegrityError, transaction as db_transaction
from .models import Institution, InstitutionMembership
from .serializers import (
    InstitutionSerializer, InstitutionMembershipSerializer,
    InviteMemberSerializer, InstitutionDashboardSerializer,
)

User = get_user_model()
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────
# Permissions
# ─────────────────────────────────────────────────────────────────────

class IsInstitutionAdmin(permissions.BasePermission):
    """Allow only institution admins (or Django staff)."""
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        institution_id = view.kwargs.get('institution_id') or view.kwargs.get('pk')
        if not institution_id:
            return False
        return InstitutionMembership.objects.filter(
            user=request.user,
            institution_id=institution_id,
            role='admin',
            status='active',
        ).exists()


# ─────────────────────────────────────────────────────────────────────
# Institution CRUD
# ─────────────────────────────────────────────────────────────────────

class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticatedOrReadOnly()]
        return [permissions.IsAdminUser()]


# ─────────────────────────────────────────────────────────────────────
# Institution Dashboard
# ─────────────────────────────────────────────────────────────────────

class InstitutionDashboardView(APIView):
    """
    GET /api/institutions/<id>/dashboard/
    Returns institution stats for admin/librarian view.
    """
    permission_classes = (permissions.IsAuthenticated, IsInstitutionAdmin)

    def get(self, request, institution_id):
        from django.shortcuts import get_object_or_404
        institution = get_object_or_404(Institution, id=institution_id)

        memberships = institution.memberships.all()
        active = memberships.filter(status='active').count()
        pending = memberships.filter(status='pending').count()
        suspended = memberships.filter(status='suspended').count()

        # Subscription info
        from apps.subscriptions.models import InstitutionSubscription, InstitutionCollectionAccess
        inst_sub = InstitutionSubscription.objects.filter(
            institution=institution, is_active=True, end_date__gte=timezone.now(),
        ).select_related('plan').first()

        collections_count = InstitutionCollectionAccess.objects.filter(
            institution=institution, is_active=True,
        ).count()
        if inst_sub:
            collections_count += inst_sub.plan.collections.count()

        data = {
            'institution': InstitutionSerializer(institution).data,
            'total_members': memberships.count(),
            'active_members': active,
            'pending_members': pending,
            'suspended_members': suspended,
            'seats_limit': inst_sub.max_users if inst_sub else 0,
            'seats_available': inst_sub.seats_available if inst_sub else 0,
            'subscription_plan': inst_sub.plan.name if inst_sub else None,
            'subscription_end': inst_sub.end_date if inst_sub else None,
            'collections_count': collections_count,
        }
        return Response(data)


# ─────────────────────────────────────────────────────────────────────
# Membership CRUD
# ─────────────────────────────────────────────────────────────────────

class MembershipListView(generics.ListAPIView):
    """
    GET /api/institutions/<id>/members/
    List all members with filtering by role/status.
    """
    serializer_class = InstitutionMembershipSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        qs = InstitutionMembership.objects.filter(
            institution_id=self.kwargs['institution_id'],
        ).select_related('user', 'invited_by')

        role = self.request.query_params.get('role')
        status_filter = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if role:
            qs = qs.filter(role=role)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if search:
            qs = qs.filter(
                user__username__icontains=search
            ) | qs.filter(
                user__email__icontains=search
            ) | qs.filter(
                user__first_name__icontains=search
            )
        return qs.distinct().order_by('user__username')


class InviteMemberView(APIView):
    """
    POST /api/institutions/<id>/members/invite/
    Invite a single user by email.
    """
    permission_classes = (permissions.IsAuthenticated, IsInstitutionAdmin)

    def post(self, request, institution_id):
        from django.shortcuts import get_object_or_404
        institution = get_object_or_404(Institution, id=institution_id)

        serializer = InviteMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        role = serializer.validated_data['role']

        # Seat check
        from apps.subscriptions.models import InstitutionSubscription
        inst_sub = InstitutionSubscription.objects.filter(
            institution=institution, is_active=True, end_date__gte=timezone.now(),
        ).first()
        if inst_sub and inst_sub.is_at_limit:
            return Response(
                {"detail": f"Se alcanzó el límite de {inst_sub.max_users} miembros."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find or create user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": f"No existe un usuario con email {email}. Debe registrarse primero."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Create membership
        try:
            membership = InstitutionMembership.objects.create(
                user=user,
                institution=institution,
                role=role,
                status='active',
                invited_by=request.user,
            )
        except IntegrityError:
            return Response(
                {"detail": "El usuario ya es miembro de esta institución."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update seats_used
        if inst_sub:
            inst_sub.seats_used = InstitutionMembership.objects.filter(
                institution=institution, status='active',
            ).count()
            inst_sub.save(update_fields=['seats_used'])

        return Response(
            InstitutionMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED,
        )


class UpdateMemberView(APIView):
    """
    PATCH /api/institutions/<id>/members/<member_id>/
    Update role or status.
    DELETE — remove membership.
    """
    permission_classes = (permissions.IsAuthenticated, IsInstitutionAdmin)

    def patch(self, request, institution_id, member_id):
        from django.shortcuts import get_object_or_404
        membership = get_object_or_404(
            InstitutionMembership,
            id=member_id,
            institution_id=institution_id,
        )

        role = request.data.get('role')
        member_status = request.data.get('status')

        if role and role in ['admin', 'librarian', 'member']:
            membership.role = role
        if member_status and member_status in ['active', 'suspended', 'pending']:
            membership.status = member_status

        membership.save()
        return Response(InstitutionMembershipSerializer(membership).data)

    def delete(self, request, institution_id, member_id):
        from django.shortcuts import get_object_or_404
        membership = get_object_or_404(
            InstitutionMembership,
            id=member_id,
            institution_id=institution_id,
        )
        membership.delete()

        # Update seats_used
        from apps.subscriptions.models import InstitutionSubscription
        inst_sub = InstitutionSubscription.objects.filter(
            institution_id=institution_id, is_active=True,
        ).first()
        if inst_sub:
            inst_sub.seats_used = InstitutionMembership.objects.filter(
                institution_id=institution_id, status='active',
            ).count()
            inst_sub.save(update_fields=['seats_used'])

        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────
# CSV Bulk Invite
# ─────────────────────────────────────────────────────────────────────

class BulkInviteView(APIView):
    """
    POST /api/institutions/<id>/members/bulk-invite/
    Upload CSV with columns: email, role (optional).
    Max 500 rows.
    """
    permission_classes = (permissions.IsAuthenticated, IsInstitutionAdmin)
    parser_classes = (MultiPartParser, FormParser)

    MAX_ROWS = 500

    def post(self, request, institution_id):
        from django.shortcuts import get_object_or_404
        institution = get_object_or_404(Institution, id=institution_id)

        csv_file = request.FILES.get('csv_file')
        if not csv_file:
            return Response({"detail": "csv_file required"}, status=status.HTTP_400_BAD_REQUEST)

        if not csv_file.name.endswith('.csv'):
            return Response({"detail": "El archivo debe ser CSV"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded = csv_file.read().decode('utf-8-sig')
            rows = list(csv.DictReader(io.StringIO(decoded)))
        except Exception:
            return Response({"detail": "Error leyendo el CSV"}, status=status.HTTP_400_BAD_REQUEST)

        truncated = len(rows) > self.MAX_ROWS
        rows = rows[:self.MAX_ROWS]

        results = {'invited': [], 'skipped': [], 'errors': []}
        if truncated:
            results['errors'].append(f"CSV truncado: solo se procesan las primeras {self.MAX_ROWS} filas.")

        from apps.subscriptions.models import InstitutionSubscription

        # select_for_update prevents concurrent bulk-invites from both passing the seat check
        with db_transaction.atomic():
            inst_sub = InstitutionSubscription.objects.select_for_update().filter(
                institution=institution, is_active=True, end_date__gte=timezone.now(),
            ).first()

            # Track remaining seats locally — avoids per-row DB queries and race conditions
            seats_remaining = inst_sub.seats_available if inst_sub else float('inf')

            for i, row in enumerate(rows, start=1):
                email = (row.get('email') or '').strip().lower()
                role = (row.get('role') or 'member').strip().lower()
                if role not in ('admin', 'librarian', 'member'):
                    role = 'member'

                if not email:
                    results['errors'].append(f"Fila {i}: email vacío")
                    continue

                if inst_sub and inst_sub.max_users > 0 and seats_remaining <= 0:
                    results['errors'].append(
                        f"Límite de asientos alcanzado. Filas {i}–{len(rows)} ignoradas."
                    )
                    break

                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    results['skipped'].append({'email': email, 'reason': 'usuario no registrado'})
                    continue

                try:
                    InstitutionMembership.objects.create(
                        user=user,
                        institution=institution,
                        role=role,
                        status='active',
                        invited_by=request.user,
                    )
                    results['invited'].append(email)
                    seats_remaining -= 1
                except IntegrityError:
                    results['skipped'].append({'email': email, 'reason': 'ya es miembro'})

            # Sync seats_used once — inside atomic so value is consistent
            if inst_sub:
                inst_sub.seats_used = InstitutionMembership.objects.filter(
                    institution=institution, status='active',
                ).count()
                inst_sub.save(update_fields=['seats_used'])

        return Response({
            'processed': len(rows),
            'invited': len(results['invited']),
            'skipped': len(results['skipped']),
            'errors': len(results['errors']),
            'details': results,
        })
