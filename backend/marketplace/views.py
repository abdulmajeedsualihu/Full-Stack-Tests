from asyncio import Event
import csv
from django.http import HttpResponse
from rest_framework import generics
from .models import FarmerProfile, Notification, Order, Product
from .serializers import EventSerializer, FarmerProfileSerializer, NotificationSerializer, OrderSerializer, ProductSerializer, UserSerializer
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from icalendar import Calendar, Event as ICalEvent

class FarmerList(generics.ListCreateAPIView):
    queryset = FarmerProfile.objects.all()
    serializer_class = FarmerProfileSerializer

class FarmerDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = FarmerProfile.objects.all()
    serializer_class = FarmerProfileSerializer

class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

# Export CSV
def export_orders(request):
    response = HttpResponse(content_type='text/csv')
    writer = csv.writer(response)
    writer.writerow(['Order ID', 'Date', 'Total'])

from rest_framework.permissions import IsAuthenticated

class FarmerProducts(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Product.objects.filter(farmer__user=self.request.user)
    
    serializer_class = ProductSerializer

class FarmerOrders(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(items__product__farmer__user=self.request.user).distinct()
    
    serializer_class = OrderSerializer

# views.py - Add these debug prints
class RegisterView(APIView):
    def post(self, request):
        print("Received registration data:", request.data)  # Debug print
        data = request.data
        is_farmer = data.get('is_farmer', False)
        
        user_serializer = UserSerializer(data={
            'username': data['username'],
            'email': data['email'],
            'password': data['password']
        })
        
        print("User serializer data:", user_serializer.initial_data)  # Debug print
        
        if user_serializer.is_valid():
            print("User data is valid")  # Debug print
            user = user_serializer.save()
            
            if is_farmer:
                print("Creating farmer profile")  # Debug print
                farmer_data = {
                    'user': user.id,
                    'farm_name': data['farm_name'],
                    'location': data['location'],
                    'contact_number': data.get('contact_number', '')
                }
                farmer_serializer = FarmerProfileSerializer(data=farmer_data)
                if farmer_serializer.is_valid():
                    farmer_serializer.save()
                    print("Farmer profile created")  # Debug print
                else:
                    print("Farmer profile errors:", farmer_serializer.errors)  # Debug print
            
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        
        print("User serializer errors:", user_serializer.errors)  # Debug print
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'is_farmer': hasattr(user, 'farmerprofile'),
        }
        if hasattr(user, 'farmerprofile'):
            farmer = user.farmerprofile
            data.update({
                'farm_name': farmer.farm_name,
                'location': farmer.location,
                'contact_number': farmer.contact_number
            })
        return Response(data)
    
class FarmStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'farmerprofile'):
            return Response({'error': 'Not a farmer'}, status=403)
            
        farmer = request.user.farmerprofile
        stats = {
            'total_products': farmer.products.count(),
            'active_orders': farmer.orders.filter(status='active').count(),
            'total_revenue': sum(order.total for order in farmer.orders.all())
        }
        return Response(stats)
    
class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = {
            'total_orders': 0,
            'total_products': 0,
            'total_revenue': 0
        }
        
        if hasattr(request.user, 'farmerprofile'):
            farmer = request.user.farmerprofile
            stats['total_products'] = farmer.products.count()
            stats['total_orders'] = farmer.orders.count()
            stats['total_revenue'] = sum(
                order.total for order in farmer.orders.all() 
                if order.status == 'completed'
            )
        else:
            stats['total_orders'] = request.user.orders.count()
            
        return Response(stats)
    

class RecentOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'farmerprofile'):
            orders = request.user.farmerprofile.orders.all()[:5]
        else:
            orders = request.user.orders.all()[:5]
            
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    

class NotificationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    def partial_update(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response(NotificationSerializer(notification).data)
    
class EventViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EventSerializer

    def get_queryset(self):
        return Event.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Implement your analytics logic here
        data = {
            'monthly_revenue': [...],
            'order_status': [...],
            'customer_growth': [...]
        }
        return Response(data)
    
# notification_data = {
#     'message': 'Your order has been shipped',
#     'notification_type': 'order',
#     'related_object_id': order.id,
#     'related_content_type': ContentType.objects.get_for_model(Order)
# }

# serializer = NotificationCreateSerializer(data=notification_data, context={'request': request})
# if serializer.is_valid():
#     notification = serializer.save()



def export_ical(request):
    cal = Calendar()
    events = Event.objects.filter(user=request.user)
    for event in events:
        ical_event = ICalEvent()
        ical_event.add('summary', event.title)
        ical_event.add('dtstart', event.start)
        ical_event.add('dtend', event.end)
        cal.add_component(ical_event)
    
    response = HttpResponse(cal.to_ical(), content_type='text/calendar')
    response['Content-Disposition'] = 'attachment; filename="farm_events.ics"'
    return response