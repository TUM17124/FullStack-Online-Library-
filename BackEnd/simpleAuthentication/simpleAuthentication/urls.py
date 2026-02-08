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
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

from simpleAuthentication import settings
from library.views import RegisterView, BookListView, BorrowBookView, BorrowedBooksView,OverdueBooksView,ChangePasswordView, ReadBookView,ReturnBookView,VerifyEmailView, ResendVerificationCodeView, PasswordResetRequestView, PasswordResetConfirmView

urlpatterns = [
     path('', lambda request: JsonResponse({"message": "Library API root"})),
    path('api/register/', RegisterView.as_view(), name="register"),
    path('api/token/', StrictTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path('api/token/refresh/', TokenRefreshView.as_view(), name="token_refresh"),
    path('api/books/', BookListView.as_view(), name='books'),
    path('api/books/<int:book_id>/borrow/', BorrowBookView.as_view(), name='borrow-book'),
    path('api/borrowed/', BorrowedBooksView.as_view(), name='borrowed-books'),
    path('api/books/<int:book_id>/read/', ReadBookView.as_view(), name='read-book'),
    path('api/overdue/', OverdueBooksView.as_view(), name='overdue-books'),
    path('api/password-reset-request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('api/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/books/<int:book_id>/return/', ReturnBookView.as_view(), name='return-book'),
    path('api/verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('api/resend-verification-email/', ResendVerificationCodeView.as_view(), name='resend-verification-email'),
    path('admin/', admin.site.urls),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)




