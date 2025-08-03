import csv
from django.http import HttpResponse
from rest_framework import generics
from .models import FarmerProfile, Order, Product
from .serializers import FarmerProfileSerializer, OrderSerializer, ProductSerializer
from rest_framework import viewsets 
from rest_framework.permissions import IsAuthenticated


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