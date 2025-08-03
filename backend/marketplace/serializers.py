from rest_framework import serializers
from .models import FarmerProfile, Product
from django.contrib.auth.models import User
from .models import Notification
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from .models import Event

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

class FarmerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    
    class Meta:
        model = FarmerProfile
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password']
        )
        farmer_profile = FarmerProfile.objects.create(user=user, **validated_data)
        return farmer_profile
    
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

# serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth.models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_farmer'] = user.farmerprofile.exists()
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

# views.py
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# marketplace/serializers.py
from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'customer', 'created_at', 'status', 'items']



class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'read', 'notification_type', 'created_at', 'related_object_id', 'related_content_type']
        read_only_fields = ['created_at']

    def to_representation(self, instance):
        """Custom representation to include human-readable time and related object info"""
        representation = super().to_representation(instance)
        
        # Add human-readable time
        representation['time_ago'] = instance.created_at.timesince()
        
        # Add related object information if available
        if instance.related_object:
            representation['related_object'] = {
                'id': instance.related_object.id,
                'type': instance.related_content_type.model,
                'display_name': str(instance.related_object)
            }
        
        return representation

class NotificationCreateSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    
    class Meta:
        model = Notification
        fields = ['user', 'message', 'notification_type', 'related_object_id', 'related_content_type']
        
    def validate(self, data):
        """Validate that related object exists if provided"""
        if 'related_object_id' in data and 'related_content_type' in data:
            try:
                content_type = data['related_content_type']
                obj = content_type.get_object_for_this_type(pk=data['related_object_id'])
                data['related_object'] = obj
            except Exception as e:
                raise serializers.ValidationError({
                    'related_object': 'Related object not found'
                })
        return data

    def create(self, validated_data):
        """Auto-set user to current user if not provided"""
        if 'user' not in validated_data:
            validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    

class EventSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        required=False
    )
    user_details = serializers.SerializerMethodField()
    related_object_details = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    is_past = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'start',
            'end',
            'all_day',
            'event_type',
            'location',
            'user',
            'user_details',
            'related_content_type',
            'related_object_id',
            'related_object_details',
            'duration',
            'is_past',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_user_details(self, obj):
        return {
            'id': obj.user.id,
            'name': obj.user.get_full_name() or obj.user.username,
            'email': obj.user.email
        }

    def get_related_object_details(self, obj):
        if not obj.related_object:
            return None
        return {
            'id': obj.related_object.id,
            'type': obj.related_content_type.model,
            'display_name': str(obj.related_object)
        }

    def get_duration(self, obj):
        if not obj.end:
            return None
        duration = obj.end - obj.start
        total_seconds = duration.total_seconds()
        
        if total_seconds < 60:
            return f"{int(total_seconds)} seconds"
        elif total_seconds < 3600:
            return f"{int(total_seconds // 60)} minutes"
        elif total_seconds < 86400:
            return f"{int(total_seconds // 3600)} hours"
        else:
            return f"{int(total_seconds // 86400)} days"

    def get_is_past(self, obj):
        return obj.end < timezone.now()

    def validate(self, data):
        """Validate event timing and relationships"""
        # Ensure end time is after start time
        if 'start' in data and 'end' in data and data['end'] <= data['start']:
            raise serializers.ValidationError({
                'end': 'End time must be after start time'
            })

        # Validate related object exists if specified
        if 'related_object_id' in data and 'related_content_type' in data:
            try:
                content_type = data['related_content_type']
                obj = content_type.get_object_for_this_type(pk=data['related_object_id'])
                data['related_object'] = obj
            except Exception as e:
                raise serializers.ValidationError({
                    'related_object': 'Related object not found'
                })

        return data

    def create(self, validated_data):
        """Auto-set user to current user if not provided"""
        if 'user' not in validated_data:
            validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class EventCalendarSerializer(serializers.ModelSerializer):
    """Simplified serializer for calendar views"""
    color = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'start',
            'end',
            'all_day',
            'event_type',
            'color'
        ]

    def get_color(self, obj):
        """Assign colors based on event type"""
        color_map = {
            'harvest': '#28a745',  # Green
            'delivery': '#007bff',  # Blue
            'maintenance': '#ffc107',  # Yellow
            'market': '#dc3545',    # Red
            'other': '#6c757d'      # Gray
        }
        return color_map.get(obj.event_type, '#6c757d')


class EventTypeSerializer(serializers.Serializer):
    """Serializer for event type choices"""
    value = serializers.CharField()
    display = serializers.CharField()