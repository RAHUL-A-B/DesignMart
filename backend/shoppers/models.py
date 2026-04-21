from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from designers.models import DesignContent

User = get_user_model()

class SavedDesign(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_designs')
    design = models.ForeignKey(DesignContent, on_delete=models.CASCADE, related_name='favorited_by')
    class Meta: unique_together = ('user', 'design')

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    shipping_address = models.TextField(default="Address not provided")
    city = models.CharField(max_length=100, default="Unknown")
    postal_code = models.CharField(max_length=20, default="000000")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
    ]
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    design = models.ForeignKey(DesignContent, on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    tracking_number = models.CharField(max_length=100, blank=True, null=True)

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    design = models.ForeignKey(DesignContent, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    class Meta: unique_together = ('user', 'design')


# Add to the bottom of shoppers/models.py

class Cart(models.Model):
    # One user gets exactly one cart
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    design = models.ForeignKey(DesignContent, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'design')