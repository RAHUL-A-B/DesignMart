import os
import django
import urllib.request
from django.core.files.base import ContentFile
import sys

def seed_db():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
    django.setup()

    from django.contrib.auth import get_user_model
    from designers.models import DesignContent
    User = get_user_model()

    print("Clearing old designs...")
    DesignContent.objects.all().delete()

    print("Creating designer account...")
    designer, _ = User.objects.get_or_create(
        phone_number="+10000000000", 
        defaults={"name": "Mixtas Official", "role": "DESIGNER"}
    )

    items = [
        ("Elegant Blue Silk Lehenga", "15000.00", "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80", "TRADITIONAL"),
        ("Golden Embroidered Saree", "12500.00", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", "TRADITIONAL"),
        ("Red Bridal Salwar Suit", "18000.00", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80", "TRADITIONAL"),
        ("Green Banarasi Silk Kurti", "4500.00", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", "TRADITIONAL"),
        
        ("Black Sequin Evening Gown", "25000.00", "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80", "PARTY"),
        ("Cocktail Red Velvet Dress", "12000.00", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80", "PARTY"),
        ("Silver Sparkle Mini Dress", "8500.00", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80", "PARTY"),
        ("Gold Satin Party Slip Dress", "9500.00", "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80", "PARTY"),
    ]

    print("Downloading and seeding products...")
    for title, price, img_url, design_type in items:
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req)
            image_content = response.read()
            
            design = DesignContent(designer=designer, title=title, description="Authentic fashion item perfectly capturing the requested style.", price=price, design_type=design_type, category='WOMEN')
            file_name = f"{title.replace(' ', '_').replace(',', '')[:20]}.jpg"
            design.image.save(file_name, ContentFile(image_content), save=True)
            print(f"Created: {title}")
        except Exception as e:
            print(f"Failed to download/create: {title} - {e}")

    print("\nDatabase successfully seeded with 8 stunning items!")

if __name__ == '__main__':
    seed_db()
