from httpx import request
from rest_framework import serializers

from simpleAuthentication import settings
from .models import Book, Borrow
from django.utils import timezone

class BookSerializer(serializers.ModelSerializer):
    is_borrowed = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'description',
            'photo',
            'created_at',
            'is_borrowed',
            'file_url'
        ]

    def get_is_borrowed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.borrows.filter(user=request.user, returned=False).exists()
        return False

    def get_file_url(self, obj):
        request = self.context.get('request')
        if not request:
            return None

        is_borrowed = obj.borrows.filter(
            user=request.user,
            returned=False
        ).exists()

        if not is_borrowed:
            return None

        if obj.file:
            file_path = str(obj.file).lstrip("/")
            if file_path.startswith("http"):
                return file_path

            return f"{settings.SUPABASE_URL}/storage/v1/object/public/media/{file_path}"

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