import csv
from django.http import HttpResponse
from rest_framework import generics
from .models import FarmerProfile, Order, Product
from .serializers import FarmerProfileSerializer, OrderSerializer, ProductSerializer, UserSerializer
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

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

class RegisterView(APIView):
    def post(self, request):
        data = request.data
        is_farmer = data.get('is_farmer', False)
        
        user_serializer = UserSerializer(data={
            'username': data['username'],
            'email': data['email'],
            'password': data['password']
        })
        
        if user_serializer.is_valid():
            user = user_serializer.save()
            
            if is_farmer:
                farmer_data = {
                    'user': user.id,
                    'farm_name': data['farm_name'],
                    'location': data['location'],
                    'contact_number': data.get('contact_number', '')
                }
                farmer_serializer = FarmerProfileSerializer(data=farmer_data)
                if farmer_serializer.is_valid():
                    farmer_serializer.save()
            
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        
        return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)