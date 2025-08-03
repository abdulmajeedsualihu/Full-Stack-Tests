from django.db import models
from django.contrib.auth.models import User

class FarmerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    farm_name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)
    bio = models.TextField(blank=True)

class Product(models.Model):
    CATEGORIES = [
        ('FR', 'Fruits'),
        ('VG', 'Vegetables'),
        ('GR', 'Grains'),
        ('DA', 'Dairy'),
    ]
    
    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=2, choices=CATEGORIES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    description = models.TextField()
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    date_added = models.DateTimeField(auto_now_add=True)