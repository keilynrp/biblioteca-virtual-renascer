
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InstitutionViewSet,
    InstitutionDashboardView,
    MembershipListView,
    InviteMemberView,
    UpdateMemberView,
    BulkInviteView,
)

router = DefaultRouter()
router.register(r'', InstitutionViewSet)

urlpatterns = [
    # Institution CRUD (existing)
    path('', include(router.urls)),

    # Dashboard
    path('<int:institution_id>/dashboard/',
         InstitutionDashboardView.as_view(), name='institution_dashboard'),

    # Members
    path('<int:institution_id>/members/',
         MembershipListView.as_view(), name='institution_members'),
    path('<int:institution_id>/members/invite/',
         InviteMemberView.as_view(), name='institution_invite'),
    path('<int:institution_id>/members/bulk-invite/',
         BulkInviteView.as_view(), name='institution_bulk_invite'),
    path('<int:institution_id>/members/<int:member_id>/',
         UpdateMemberView.as_view(), name='institution_member_update'),
]
