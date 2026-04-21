from rest_framework import serializers
from django.contrib.auth import get_user_model
from shoppers.models import Order, OrderItem, Review
from designers.models import DesignContent
from .models import DesignerPayout

User = get_user_model()


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'phone_number', 'email', 'role', 'is_active', 'is_staff']
        read_only_fields = ['id', 'phone_number']


class AdminOrderItemSerializer(serializers.ModelSerializer):
    design_title = serializers.ReadOnlyField(source='design.title')
    designer_name = serializers.ReadOnlyField(source='design.designer.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'design', 'design_title', 'designer_name', 'price', 'status', 'tracking_number']


class AdminOrderSerializer(serializers.ModelSerializer):
    items = AdminOrderItemSerializer(many=True, read_only=True)
    shopper_name = serializers.ReadOnlyField(source='user.name')
    shopper_phone = serializers.ReadOnlyField(source='user.phone_number')

    class Meta:
        model = Order
        fields = ['id', 'shopper_name', 'shopper_phone', 'shipping_address', 'city',
                  'postal_code', 'total_amount', 'status', 'created_at', 'items']


class AdminDesignSerializer(serializers.ModelSerializer):
    designer_name = serializers.ReadOnlyField(source='designer.name')

    class Meta:
        model = DesignContent
        fields = ['id', 'title', 'description', 'image', 'price', 'designer', 'designer_name', 'created_at']


class AdminReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.name')
    design_title = serializers.ReadOnlyField(source='design.title')

    class Meta:
        model = Review
        fields = ['id', 'user_name', 'design_title', 'rating', 'comment']


class DesignerPayoutSerializer(serializers.ModelSerializer):
    designer_name = serializers.ReadOnlyField(source='designer.name')

    class Meta:
        model = DesignerPayout
        fields = ['id', 'designer', 'designer_name', 'total_earnings',
                  'commission', 'payout_amount', 'status', 'created_at', 'paid_at']
        read_only_fields = ['id', 'total_earnings', 'commission', 'payout_amount', 'created_at']
