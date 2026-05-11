import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# Function to generate custom ID
def generate_design_id():
    # Creates an ID like "DSGN-a1b2c3d4"
    return f"DSGN-{uuid.uuid4().hex[:8].upper()}"

class DesignContent(models.Model):
    CATEGORY_CHOICES = [
        ('WOMEN', 'Women'),
        ('MEN', 'Men'),
        ('CHILDREN', 'Children'),
    ]

    TYPE_CHOICES = [
        ('TRADITIONAL', 'Traditional'),
        ('FORMAL', 'Formal'),
        ('CASUAL', 'Casual'),
        ('PARTY', 'Party'),
        ('SPORTS', 'Sports'),
    ]

    id = models.CharField(primary_key=True, max_length=15, default=generate_design_id, editable=False)
    designer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='designs', limit_choices_to={'role': 'DESIGNER'})
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='designer_uploads/')
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='OTHER')
    design_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='CASUAL')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.designer.name}"