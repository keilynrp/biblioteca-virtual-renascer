
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlanListView, PlanDetailView, SubscriptionView,
    CancelSubscriptionView, InstitutionSubscriptionViewSet,
    TrialStatusView, AccessLevelView,
    CollectionListCreateView, CollectionDetailView,
    CollectionBooksView, CollectionBookDeleteView,
    InstitutionCollectionPurchaseView, InstitutionCollectionListView,
    BookPurchaseView, MyPurchasesView,
)

router = DefaultRouter()
router.register(r'institution-subscriptions', InstitutionSubscriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),

    # Plans
    path('plans/', PlanListView.as_view(), name='plan_list'),
    path('plans/<int:pk>/', PlanDetailView.as_view(), name='plan_detail'),

    # User subscription
    path('my-subscription/', SubscriptionView.as_view(), name='my_subscription'),
    path('cancel/', CancelSubscriptionView.as_view(), name='cancel_subscription'),

    # Trial & Access
    path('trial-status/', TrialStatusView.as_view(), name='trial_status'),
    path('access-level/', AccessLevelView.as_view(), name='access_level'),

    # Collections
    path('collections/', CollectionListCreateView.as_view(), name='collection_list'),
    path('collections/<slug:slug>/', CollectionDetailView.as_view(), name='collection_detail'),
    path('collections/<slug:slug>/books/', CollectionBooksView.as_view(), name='collection_books'),
    path('collections/<slug:slug>/books/<int:book_id>/', CollectionBookDeleteView.as_view(), name='collection_book_delete'),

    # Institution collection access (à la carte)
    path('institutions/<int:institution_id>/collections/', InstitutionCollectionListView.as_view(), name='institution_collections'),
    path('institutions/<int:institution_id>/collections/purchase/', InstitutionCollectionPurchaseView.as_view(), name='institution_collection_purchase'),

    # Book purchase (micro-transactions)
    path('book-purchase/', BookPurchaseView.as_view(), name='book_purchase'),
    path('my-purchases/', MyPurchasesView.as_view(), name='my_purchases'),
]
