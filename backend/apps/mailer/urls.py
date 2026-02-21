from django.urls import path
from . import views

urlpatterns = [
    path('config/', views.SMTPConfigView.as_view(), name='mailer-config'),
    path('config/test/', views.SMTPTestEmailView.as_view(), name='mailer-test'),
    path('logs/', views.EmailLogListView.as_view(), name='mailer-logs'),
    path('templates/', views.EmailTemplateListView.as_view(), name='mailer-templates'),
    path('templates/<str:key>/', views.EmailTemplateDetailView.as_view(), name='mailer-template-detail'),
]
