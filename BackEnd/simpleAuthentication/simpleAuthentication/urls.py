from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import JsonResponse

from simpleAuthentication import settings
from library.views import (
    RegisterView,
    BookListView,
    BorrowBookView,
    BorrowedBooksView,
    StrictTokenObtainPairView,
    OverdueBooksView,
    ChangePasswordView,
    ReadBookView,
    ReturnBookView,
    VerifyEmailView,
    ResendVerificationCodeView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    google_login_redirect,
    health_check
)

urlpatterns = [

    # ROOT
    path('', lambda request: JsonResponse({"message": "Library API root"})),

    # HEALTH
    path('health/', health_check, name='health-check'),

    # GOOGLE OAUTH REDIRECT
    path("accounts/profile/",google_login_redirect,name="google_login_redirect"),

    # AUTH
    path('api/register/', RegisterView.as_view(), name="register"),
    path('api/token/', StrictTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path('api/token/refresh/', TokenRefreshView.as_view(), name="token_refresh"),

    
    path('accounts/', include('allauth.urls')),

    # BOOKS
    path('api/books/', BookListView.as_view(), name='books'),
    path('api/books/<int:book_id>/borrow/', BorrowBookView.as_view(), name='borrow-book'),
    path('api/books/<int:book_id>/read/', ReadBookView.as_view(), name='read-book'),
    path('api/books/<int:book_id>/return/', ReturnBookView.as_view(), name='return-book'),

    # USER BOOKS
    path('api/borrowed/', BorrowedBooksView.as_view(), name='borrowed-books'),
    path('api/overdue/', OverdueBooksView.as_view(), name='overdue-books'),

    # PASSWORD
    path('api/password-reset-request/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('api/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('api/change-password/', ChangePasswordView.as_view(), name='change-password'),

    # EMAIL VERIFICATION
    path('api/verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('api/resend-verification-email/', ResendVerificationCodeView.as_view(), name='resend-verification-email'),

    # ADMIN
    path('admin/', admin.site.urls),
]

if settings.DEBUG and hasattr(settings, "MEDIA_ROOT"):
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)