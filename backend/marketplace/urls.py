from django.urls import path
from .views import FarmerList, FarmerDetail, ProductList, ProductDetail, FarmerProducts, FarmerOrders

urlpatterns = [
    path('farmers/', FarmerList.as_view()),
    path('farmers/<int:pk>/', FarmerDetail.as_view()),
    path('products/', ProductList.as_view()),
    path('products/<int:pk>/', ProductDetail.as_view()),
    path('farmer/products/', FarmerProducts.as_view()),
    path('farmer/orders/', FarmerOrders.as_view()),
]