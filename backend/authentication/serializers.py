from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Used ONLY for retrieving and updating profile data after the user is logged in.
    """
    class Meta:
        model = User
        # Added 'email' to match your updated model
        fields = ['id', 'phone_number', 'name', 'email', 'role']
        
        # Prevent users from changing their phone number or role via a profile update
        read_only_fields = ['id', 'phone_number', 'role']

    def validate_name(self, value):
        """Ensure the user cannot accidentally save an empty name during a profile update"""
        if not value.strip():
            raise serializers.ValidationError("Name cannot be empty.")
        return value