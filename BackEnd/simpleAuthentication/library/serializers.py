from rest_framework import serializers
from .models import Book, Borrow
from django.utils import timezone

class BookSerializer(serializers.ModelSerializer):
    # Add is_borrowed so frontend knows if book is currently borrowed
    is_borrowed = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()


    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'description', 'photo', 'created_at', 'is_borrowed', 'file_url']

    def get_is_borrowed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.borrows.filter(user=request.user, returned=False).exists()
        return False
    
    def get_file_url(self, obj):
        user = self.context.get('request').user
        # Only return file URL if the book is borrowed
        if obj.is_borrowed:
            request = self.context.get('request')
            if obj.file and request:
                return request.build_absolute_uri(f'/api/books/{obj.id}/read/')
        return None

class BorrowSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='book.title', read_only=True)
    author = serializers.CharField(source='book.author', read_only=True)
    photo = serializers.ImageField(source='book.photo', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Borrow
        fields = [
            'id',
            'title',
            'author',
            'photo',
            'borrow_date',
            'return_due',
            'returned',
            'returned_date',
            'is_overdue'
        ]

    def get_is_overdue(self, obj):
        if obj.returned:
            return False
        if not obj.return_due:
            return False
        return timezone.now() > obj.return_due