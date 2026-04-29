from rest_framework import serializers
from .models import DesignContent

class DesignContentSerializer(serializers.ModelSerializer):
    designer_name = serializers.ReadOnlyField(source='designer.name')
    image = serializers.SerializerMethodField()

    class Meta:
        model = DesignContent
        fields = ['id', 'designer', 'designer_name', 'title', 'description', 'image', 'price', 'category', 'created_at']
        read_only_fields = ['id', 'designer', 'created_at']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return f'http://127.0.0.1:8000{obj.image.url}'
        return None