from django.urls import path
from .views import (
    AdminAnalyticsView,
    AdminUserListView, AdminUserDetailView, AdminApproveDesignerView, AdminBanUserView,
    AdminOrderListView, AdminOrderItemUpdateView,
    AdminDesignListView, AdminDesignDeleteView,
    AdminReviewListView, AdminReviewDeleteView,
    AdminDesignerEarningsView, AdminCreatePayoutView, AdminMarkPayoutPaidView, AdminPayoutListView,ContactMessageListView,
    ContactMessageRespondView,ActiveBannerListView, 
    AdminBannerListCreateView, 
    AdminBannerDetailView,AdminRejectDesignView
)

urlpatterns = [
    # Analytics
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),

    # User Management
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:user_id>/approve/', AdminApproveDesignerView.as_view(), name='admin-approve-designer'),
    path('admin/users/<int:user_id>/ban/', AdminBanUserView.as_view(), name='admin-ban-user'),

    # Order Management
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-orders'),
    path('admin/orders/items/<int:item_id>/', AdminOrderItemUpdateView.as_view(), name='admin-order-item-update'),

    # Content Moderation
    path('admin/designs/', AdminDesignListView.as_view(), name='admin-designs'),
    path('admin/designs/<str:design_id>/', AdminDesignDeleteView.as_view(), name='admin-design-delete'),
    path('admin/reviews/', AdminReviewListView.as_view(), name='admin-reviews'),
    path('admin/reviews/<int:review_id>/', AdminReviewDeleteView.as_view(), name='admin-review-delete'),
    path('admin/messages/', ContactMessageListView.as_view(), name='admin-messages'),
    path('admin/messages/<int:pk>/respond/', ContactMessageRespondView.as_view()),
    path('designs/<str:design_id>/reject/',AdminRejectDesignView.as_view(), name='admin-design-reject'),


    #banner
    path('shoppers/banners/active/', ActiveBannerListView.as_view(), name='active-banners'),

    # Admin routes
    # Handles GET (all) and POST
    path('admin/banners/', AdminBannerListCreateView.as_view(), name='admin-banner-list'),
    
    # Handles GET (one), PUT, PATCH, and DELETE
    path('admin/banners/<int:pk>/', AdminBannerDetailView.as_view(), name='admin-banner-detail'),

    # Financial / Payouts
    path('admin/payouts/', AdminPayoutListView.as_view(), name='admin-payouts'),
    path('admin/payouts/designers/<int:designer_id>/earnings/', AdminDesignerEarningsView.as_view(), name='admin-designer-earnings'),
    path('admin/payouts/designers/<int:designer_id>/create/', AdminCreatePayoutView.as_view(), name='admin-create-payout'),
    path('admin/payouts/<int:payout_id>/mark-paid/', AdminMarkPayoutPaidView.as_view(), name='admin-mark-paid'),
]
