
from django.urls import path
from .views import InstitutionListView

urlpatterns = [
    path('', InstitutionListView.as_view(), name='institution_list'),
]
