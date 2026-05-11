from rest_framework import serializers
from .models import DesignContent

class DesignContentSerializer(serializers.ModelSerializer):
    designer_name = serializers.ReadOnlyField(source='designer.name')

    class Meta:
        model = DesignContent
        fields = ['id', 'designer', 'designer_name', 'title', 'description', 'image', 'price', 'category', 'design_type', 'created_at']
        read_only_fields = ['id', 'designer', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            if request:
                ret['image'] = request.build_absolute_uri(instance.image.url)
            else:
                ret['image'] = f'http://127.0.0.1:8000{instance.image.url}'
        else:
            ret['image'] = None
        return ret