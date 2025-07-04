from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework.permissions import AllowAny
from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from datetime import timedelta

from simpleAuthentication.settings import EMAIL_HOST_USER
from .models import Book, Borrow
from .serializers import BookSerializer, BorrowSerializer

class BorrowBookView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, book_id):
        user = request.user
        try:
            book = Book.objects.get(id=book_id)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found'}, status=status.HTTP_404_NOT_FOUND)

        if Borrow.objects.filter(user=user, book=book, returned=False).exists():
            return Response({'error': 'You already borrowed this book.'}, status=status.HTTP_400_BAD_REQUEST)

        current_borrow_count = Borrow.objects.filter(user=user, returned=False).count()
        if current_borrow_count >= 3:
            return Response({'error': 'Borrow limit reached. You can only borrow up to 3 books.'}, status=status.HTTP_403_FORBIDDEN)

        borrow_date = timezone.now()
        return_due = borrow_date + timedelta(days=14)

        Borrow.objects.create(user=user, book=book, borrow_date=borrow_date, return_due=return_due)

        return Response({
            'message': f'You have borrowed "{book.title}".',
            'borrow_date': borrow_date,
            'return_due': return_due
        }, status=status.HTTP_201_CREATED)
    
class BorrowedBooksView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BorrowSerializer

    def get_queryset(self):
        return Borrow.objects.filter(user=self.request.user)

class BookListView(ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

class OverdueBooksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        overdue_books = Borrow.objects.filter(user=request.user, returned=False, return_due__lt=now)
        data = []
        for b in overdue_books:
            data.append({
                'id': b.book.id,
                'title': b.book.title,
                'author': b.book.author,
                'return_due': b.return_due,
                'days_overdue': (now - b.return_due).days,
            })
        return Response(data)
    
from django.core.mail import send_mail

class ChangePasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')

        if not email or not new_password:
            return Response({'error': 'Email and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()

            # Send confirmation email
            send_mail(
                'Your password has been changed',
                'Hello, your password has been successfully updated.',
                EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )

            return Response({'message': 'Password updated successfully and email sent.'})
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)
