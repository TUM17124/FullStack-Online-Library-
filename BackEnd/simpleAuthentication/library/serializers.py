from rest_framework import serializers
from .models import Book, Borrow
from django.utils import timezone

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'image', 'borrow_date', 'return_due', 'returned', 'returned_date']

class BorrowSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='book.title', read_only=True)
    author = serializers.CharField(source='book.author', read_only=True)
    isOverdue = serializers.SerializerMethodField()

    class Meta:
        model = Borrow
        fields = ['title', 'author', 'borrow_date', 'return_due', 'returned', 'isOverdue']

    def get_isOverdue(self, obj):
        now = timezone.now()
        return not obj.returned and obj.return_due and now > obj.return_due
