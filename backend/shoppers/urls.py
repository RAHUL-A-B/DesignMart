from django.urls import path
from .views import *
urlpatterns = [
    path('shoppers/save/<str:design_id>/', ToggleSaveDesignView.as_view()),
    path('shoppers/favorites/', MySavedDesignsView.as_view()),
    path('shoppers/sync-data/', SyncUserDataView.as_view()),
    path('shoppers/checkout/', CheckoutView.as_view()),
    path('shoppers/orders/', MyOrdersView.as_view()),
    path('shoppers/orders/<int:order_id>/track/', TrackOrderView.as_view()),
    path('shoppers/review/', CreateReviewView.as_view()),
    path('shoppers/cart/', ManageCartView.as_view(), name='manage-cart'),
    path('shoppers/cart/sync/', SyncCartView.as_view(), name='sync-cart'),
]