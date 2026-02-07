from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import IntegrityError
from django.http import FileResponse, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.encoding import smart_str
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework import serializers
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import transaction

from datetime import timedelta
import random

from simpleAuthentication.settings import EMAIL_HOST_USER
from .models import Book, Borrow, EmailVerificationCode
from .throttles import OTPThrottle
from .serializers import BookSerializer, BorrowSerializer


# -----------------------------
# Custom JWT Login (blocks inactive users)
# -----------------------------
class StrictTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        print("LOGIN ATTEMPT - Custom serializer is running!")
        print("Username:", attrs.get('username'))
        print("User active status:", self.user.is_active if hasattr(self, 'user') else "User not found yet")

        data = super().validate(attrs)

        print("User active status AFTER authentication:", self.user.is_active)
        
        if not self.user.is_active:
            print("BLOCKING LOGIN - user is NOT active!")
            raise serializers.ValidationError(
                detail={
                    "error": "account_not_verified",
                    "message": "Please verify your email before logging in."
                },
                code='authorization'
            )

        print("LOGIN SUCCESS - user is active")    
        return data


class StrictTokenObtainPairView(TokenObtainPairView):
    serializer_class = StrictTokenObtainPairSerializer


# -----------------------------
# Authenticated Views
# -----------------------------
class BorrowBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        user = request.user
        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        if Borrow.objects.filter(user=user, book=book, returned=False).exists():
            return Response(
                {'error': 'You already borrowed this book.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Borrow.objects.filter(user=user, returned=False).count() >= 3:
            return Response(
                {'error': 'Borrow limit reached. You can only borrow up to 3 books.'},
                status=status.HTTP_403_FORBIDDEN
            )

        borrow_date = timezone.now()
        return_due = borrow_date + timedelta(days=14)

        Borrow.objects.create(
            user=user,
            book=book,
            borrow_date=borrow_date,
            return_due=return_due
        )

        return Response({
            'message': f'You have borrowed "{book.title}".',
            'borrow_date': borrow_date,
            'return_due': return_due
        }, status=status.HTTP_201_CREATED)


class ReturnBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        user = request.user
        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            borrow = Borrow.objects.get(user=user, book=book, returned=False)
        except Borrow.DoesNotExist:
            return Response(
                {'error': 'You have not borrowed this book or it has already been returned'},
                status=status.HTTP_400_BAD_REQUEST
            )

        borrow.returned = True
        borrow.returned_date = timezone.now()
        borrow.save()

        return Response({
            'message': f'You have successfully returned "{book.title}". Thank you!',
            'returned_date': borrow.returned_date
        }, status=status.HTTP_200_OK)


class BorrowedBooksView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BorrowSerializer

    def get_queryset(self):
        return Borrow.objects.filter(user=self.request.user, returned=False)


class BookListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class ReadBookView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, book_id):
        book = get_object_or_404(Book, id=book_id)

        if not Borrow.objects.filter(user=request.user, book=book, returned=False).exists():
            return HttpResponseForbidden("You must borrow this book to read it.")

        if not book.file:
            return Response({"error": "Book file not available"}, status=404)

        try:
            response = FileResponse(book.file.open('rb'), content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{smart_str(book.file.name)}"'
            return response
        except Exception as e:
            return Response({"error": f"Failed to open PDF: {str(e)}"}, status=500)


class OverdueBooksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        overdue = Borrow.objects.filter(
            user=request.user,
            returned=False,
            return_due__lt=now
        )
        data = [
            {
                'id': b.book.id,
                'title': b.book.title,
                'author': b.book.author,
                'return_due': b.return_due,
                'days_overdue': (now - b.return_due).days,
            }
            for b in overdue
        ]
        return Response(data)


# -----------------------------
# Public Views (CSRF Exempt)
# -----------------------------
@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [OTPThrottle]

    def options(self, request, *args, **kwargs):
        print("OPTIONS request received for /api/register/")  # debug log
        return Response(status=status.HTTP_204_NO_CONTENT)

    def post(self, request):
        required_fields = ['first_name', 'last_name', 'username', 'email', 'password', 'password2']
        data = {field: request.data.get(field) for field in required_fields}

        if not all(data.values()):
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if data['password'] != data['password2']:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=data['username']).exists():
            return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=data['email']).exists():
            return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(data['password'])
        except ValidationError as e:
            return Response({'error': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=data['username'],
                    email=data['email'],
                    password=data['password'],
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                )

                user.is_active = False
                user.save()
                user.refresh_from_db()

                EmailVerificationCode.objects.filter(user=user).delete()

                verification = EmailVerificationCode.objects.create(
                    user=user,
                    expires_at=timezone.now() + timedelta(minutes=15)
                )

                # EMAIL SENDING - NOW RE-ENABLED WITH SAFE HANDLING
                email_sent = False
                email_error = None
                try:
                    send_mail(
                        subject='Verify Your Account - 6-Digit Code',
                        message=f'''
Hello {data['username']},

Thank you for registering!

Your verification code is: {verification.code}

This code expires in 15 minutes.

If you didn't request this, please ignore this email.

Best regards,
Library Team
                        ''',
                        from_email=EMAIL_HOST_USER,
                        recipient_list=[data['email']],
                        fail_silently=False,
                    )
                    email_sent = True
                except Exception as e:
                    email_error = str(e)
                    print(f"Email sending failed: {email_error}")

                return Response({
                    'message': 'User registered successfully. Please check your email for the verification code.' if email_sent else 'User registered successfully (email sending failed - check logs).',
                    'email_status': 'sent' if email_sent else 'failed',
                    'email_error': email_error if email_error else None,
                    'verification_code': verification.code if not email_sent else None,  # temporary for testing
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    }
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Registration error: {str(e)}")
            return Response({'error': 'Registration failed - server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [OTPThrottle]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')

        if not email or not code:
            return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email, is_active=False)
        except User.DoesNotExist:
            return Response({'error': 'Invalid or already verified email'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            verification = EmailVerificationCode.objects.get(user=user)
        except EmailVerificationCode.DoesNotExist:
            return Response({'error': 'No verification code found'}, status=status.HTTP_400_BAD_REQUEST)

        if verification.is_expired():
            verification.delete()
            return Response({'error': 'Verification code has expired'}, status=status.HTTP_400_BAD_REQUEST)

        if verification.code != code:
            return Response({'error': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)

        if verification.is_verified:
            return Response({'error': 'Email already verified'}, status=status.HTTP_400_BAD_REQUEST)

        verification.is_verified = True
        verification.save()
        user.is_active = True
        user.save()

        return Response({'message': 'Email verified successfully! You can now log in.'})


@method_decorator(csrf_exempt, name='dispatch')
class ResendVerificationCodeView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [OTPThrottle]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email, is_active=False)
        except User.DoesNotExist:
            return Response({'error': 'No pending verification for this email'}, status=status.HTTP_400_BAD_REQUEST)

        EmailVerificationCode.objects.filter(user=user).delete()
        verification = EmailVerificationCode.objects.create(user=user)

        send_mail(
            subject='New Verification Code',
            message=f'Your new verification code is: {verification.code}\nValid for 15 minutes.',
            from_email=EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response({'message': 'New verification code sent!'})


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [OTPThrottle]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'message': 'If the email exists, a reset code has been sent.'})

        EmailVerificationCode.objects.filter(user=user).delete()

        code = ''.join(str(random.randint(0, 9)) for _ in range(6))
        expires_at = timezone.now() + timedelta(minutes=15)
        EmailVerificationCode.objects.create(user=user, code=code, expires_at=expires_at)

        send_mail(
            subject='Password Reset Code',
            message=f'Your password reset code is: {code}\nValid for 15 minutes.',
            from_email=EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False
        )

        return Response({'message': 'If the email exists, a reset code has been sent.'})


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [OTPThrottle]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')

        if not all([email, code, new_password]):
            return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'Invalid email or code'}, status=status.HTTP_400_BAD_REQUEST)

        verification = EmailVerificationCode.objects.filter(user=user, code=code).first()
        if not verification or verification.is_expired():
            if verification:
                verification.delete()
            return Response({'error': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({'error': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        verification.delete()

        send_mail(
            subject='Password Reset Successful',
            message='Your password has been reset successfully.',
            from_email=EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=True
        )

        return Response({'message': 'Password updated successfully'})


@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [OTPThrottle]

    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')

        if not email or not new_password:
            return Response(
                {'error': 'Email and new password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email=email).first()
        if not user:
            return Response(
                {'message': 'If the email is registered, your password has been updated.'}
            )

        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({'error': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        send_mail(
            subject='Password Changed Successfully',
            message='Hello,\n\nYour password has been successfully updated.\n\n'
                    'If you did not request this change, please contact support immediately.',
            from_email=EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=True,
        )

        return Response({'message': 'Password updated successfully.'})