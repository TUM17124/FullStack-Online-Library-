"""
URL configuration for simpleAuthentication project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse
from .views import RegisterView, ProtectedView
from library.views import BookListView, BorrowBookView, BorrowedBooksView,OverdueBooksView,ChangePasswordView

urlpatterns = [
     path('', lambda request: JsonResponse({"message": "Library API root"})),
    path('api/register/', RegisterView.as_view(), name="register"),
    path('api/token/', TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path('api/token/refresh/', TokenRefreshView.as_view(), name="token_refresh"),
    path('api/protected/', ProtectedView.as_view(), name="protected"),
    path('api/books/', BookListView.as_view(), name='books'),
    path('api/books/<int:book_id>/borrow/', BorrowBookView.as_view(), name='borrow-book'),
    path('api/borrowed-books/', BorrowedBooksView.as_view(), name='borrowed-books'),
    path('api/overdue-books/', OverdueBooksView.as_view(), name='overdue-books'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'), 
    path('admin/', admin.site.urls),
]




