from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, name, password=None, **extra_fields):
        if not phone_number:
            raise ValueError('The Phone Number must be set')
        if not name:
            raise ValueError('The First Name must be set')
            
        user = self.model(phone_number=phone_number, name=name, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password() 
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
            
        return self.create_user(phone_number, name, password, **extra_fields)

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        DESIGNER = "DESIGNER", "Fashion Designer"
        USER = "USER", "User"

    username = None 
    
    # 1. Mobile Number (Required)
    phone_number = models.CharField(max_length=15, unique=True)
    # 2. First Name (Required)
    name = models.CharField(max_length=100, null=True, blank=True)
    # 3. Email (Optional)
    email = models.EmailField(max_length=255, blank=True, null=True) 
    # 4. Role (Required, defaults to USER)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.USER)

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['name'] # Required for terminal createsuperuser

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.phone_number} - {self.name}"