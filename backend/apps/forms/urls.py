from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    FormViewSet,
    FormSubmissionViewSet,
    PublicFormRetrieveView,
    PublicFormBySlugView,
    PublicFormSubmitView,
)

router = DefaultRouter()
router.register(r'', FormViewSet, basename='form')

urlpatterns = [
    # Public endpoints (no auth)
    path(
        'public/<uuid:uuid>/',
        PublicFormRetrieveView.as_view(),
        name='public-form',
    ),
    path(
        'public/by-slug/<slug:slug>/',
        PublicFormBySlugView.as_view(),
        name='public-form-by-slug',
    ),
    path(
        'submit/<uuid:form_uuid>/',
        PublicFormSubmitView.as_view(),
        name='submit-form',
    ),

    # Admin: nested submissions under form slug
    path(
        '<slug:form_slug>/submissions/',
        FormSubmissionViewSet.as_view({'get': 'list'}),
        name='form-submissions',
    ),
    path(
        '<slug:form_slug>/submissions/export/',
        FormSubmissionViewSet.as_view({'get': 'export'}),
        name='form-submissions-export',
    ),
    path(
        '<slug:form_slug>/submissions/bulk-delete/',
        FormSubmissionViewSet.as_view({'post': 'bulk_delete'}),
        name='form-submissions-bulk-delete',
    ),
    path(
        '<slug:form_slug>/submissions/<int:pk>/',
        FormSubmissionViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}),
        name='form-submission-detail',
    ),
    path(
        '<slug:form_slug>/submissions/<int:pk>/mark-read/',
        FormSubmissionViewSet.as_view({'patch': 'mark_read'}),
        name='form-submission-mark-read',
    ),
    path(
        '<slug:form_slug>/submissions/<int:pk>/mark-spam/',
        FormSubmissionViewSet.as_view({'patch': 'mark_spam'}),
        name='form-submission-mark-spam',
    ),

    # Admin CRUD (router — must be last)
    path('', include(router.urls)),
]
