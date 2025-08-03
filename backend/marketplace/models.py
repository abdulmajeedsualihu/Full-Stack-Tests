from django.db import models
from django.contrib.auth.models import User

class FarmerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    farm_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)
    bio = models.TextField(blank=True)

# models.py
class Product(models.Model):
    CATEGORY_CHOICES = [
        ('VG', 'Vegetables'),
        ('FR', 'Fruits'),
        ('GR', 'Grains'),
        ('DA', 'Dairy'),
    ]
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=2, choices=CATEGORY_CHOICES)
    quantity = models.PositiveIntegerField()
    image = models.ImageField(upload_to='products/')
    harvest_date = models.DateField()
    expiry_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)