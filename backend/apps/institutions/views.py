
from rest_framework import generics, permissions
from .models import Institution
from .serializers import InstitutionSerializer

class InstitutionListView(generics.ListAPIView):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    permission_classes = (permissions.AllowAny,)
