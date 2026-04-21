from django.urls import path
from .views import (
    DesignerDashboardAPIView,
    DesignerProfileUpdateView,
    ContentUploadView,
    DesignerDesignListView,
    DesignContentDetailView,
    DesignerOrderItemsView,
    DesignerOrderItemUpdateView,
    ContentFeedView
)

urlpatterns = [
    # Dashboard
    path('designers/dashboard/', DesignerDashboardAPIView.as_view(), name='designer-dashboard'),

    # Profile
    path('designers/profile/', DesignerProfileUpdateView.as_view(), name='designer-profile'),

    # Designs
    path('designers/content/add/', ContentUploadView.as_view(), name='content-upload'),
    path('designers/my-designs/', DesignerDesignListView.as_view(), name='my-designs'),
    path('designers/content/feed/', ContentFeedView.as_view(), name='content-feed'),
    path('designers/content/<str:pk>/', DesignContentDetailView.as_view(), name='content-detail'),

    # Order Fulfillment
    path('designers/orders/', DesignerOrderItemsView.as_view(), name='designer-orders'),
    path('designers/orders/<int:pk>/', DesignerOrderItemUpdateView.as_view(), name='designer-order-update'),
]
