from django.urls import path
from .views import FarmerList, FarmerDetail, ProductList, ProductDetail, FarmerProducts, FarmerOrders, RegisterView, UserProfileView, FarmStatsView

urlpatterns = [
    path('farmers/', FarmerList.as_view()),
    path('farmers/<int:pk>/', FarmerDetail.as_view()),
    path('products/', ProductList.as_view()),
    path('register/', RegisterView.as_view(), name='register'),
    path('products/<int:pk>/', ProductDetail.as_view()),
    path('farmer/products/', FarmerProducts.as_view()),
    path('farmer/orders/', FarmerOrders.as_view()),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('farm/stats/', FarmStatsView.as_view(), name='farm-stats'),
]