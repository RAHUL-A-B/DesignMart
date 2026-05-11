from rest_framework import serializers
from .models import Order, OrderItem, Review
from designers.serializers import DesignContentSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    design_details = DesignContentSerializer(source='design', read_only=True)
    class Meta:
        model = OrderItem
        fields = ['id', 'design', 'design_details', 'price', 'status', 'tracking_number']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ['id', 'user', 'shipping_address', 'city', 'postal_code', 'total_amount', 'status', 'created_at', 'items']

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'user', 'design', 'rating', 'comment']
        read_only_fields = ['id', 'user']

from .models import Cart, CartItem

class CartItemSerializer(serializers.ModelSerializer):
    design_details = DesignContentSerializer(source='design', read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'design', 'design_details', 'quantity', 'added_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price']

    def get_total_price(self, obj):
        return sum([item.design.price * item.quantity for item in obj.items.all() if item.design.price])


        
from .models import ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'

from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.name', read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'sender_name', 'receiver', 'receiver_name', 'content', 'timestamp', 'is_read']
        read_only_fields = ['sender', 'timestamp', 'is_read']
