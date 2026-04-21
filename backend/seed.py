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
        ("adidas X Pop Polo shirt, navy", "69.00", "https://images.unsplash.com/photo-1596755094514-f87e32f08286?w=600&q=80"),
        ("adidas X Pop TRX Vintage", "89.00", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80"),
        ("adidas X Pop Track Jacket", "120.00", "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80"),
        ("adidas X Pop t-shirt", "120.00", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80"),
        ("adidas X Pop Cap", "55.00", "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80"),
        ("Beautiful Pullover Hood", "135.00", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80"),
        ("Parra Rug Pull t-shirt", "60.00", "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80"),
        ("Streetwear L/S Sweat", "120.00", "https://images.unsplash.com/photo-1578587018452-892bace94f12?w=600&q=80"),
    ]

    print("Downloading and seeding products...")
    for title, price, img_url in items:
        try:
            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            response = urllib.request.urlopen(req)
            image_content = response.read()
            
            design = DesignContent(designer=designer, title=title, description="Authentic fashion item perfectly capturing the requested style.", price=price)
            file_name = f"{title.replace(' ', '_').replace(',', '')[:20]}.jpg"
            design.image.save(file_name, ContentFile(image_content), save=True)
            print(f"Created: {title}")
        except Exception as e:
            print(f"Failed to download/create: {title} - {e}")

    print("\nDatabase successfully seeded with 8 stunning items!")

if __name__ == '__main__':
    seed_db()
