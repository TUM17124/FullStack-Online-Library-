from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
class UserSerializer(ModelSerializer):
    class Meta:
        model=User
        fields=['username','password', 'first_name', 'last_name', 'email']
        extra_kwargs={'password':{'write_only':True}}
    def create(self, validated_data):
        user=User.objects.create_user(**validated_data)
        return user  
class RegisterView(generics.CreateAPIView):
    queryset=User.objects.all()
    serializer_class=UserSerializer  
        

class ProtectedView(APIView):
    permission_classes=[IsAuthenticated]    
    def get(self,request):
        return Response({'message':f'Hello, {request.user.username}'})