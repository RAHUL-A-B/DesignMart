from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class DesignerPayout(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
    ]
    designer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payouts')
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2)
    commission = models.DecimalField(max_digits=10, decimal_places=2)
    payout_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payout to {self.designer.name} - {self.payout_amount}"
