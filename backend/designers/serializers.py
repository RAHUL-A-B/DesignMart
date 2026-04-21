from rest_framework import serializers
from .models import DesignContent

class DesignContentSerializer(serializers.ModelSerializer):
    designer_name = serializers.ReadOnlyField(source='designer.name')

    class Meta:
        model = DesignContent
        fields = ['id', 'designer', 'designer_name', 'title', 'description', 'image', 'price', 'created_at']
        read_only_fields = ['id', 'designer', 'created_at']