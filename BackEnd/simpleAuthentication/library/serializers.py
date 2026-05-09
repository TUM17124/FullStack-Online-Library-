from rest_framework import serializers
from django.utils import timezone
from simpleAuthentication import settings
from .models import Book, Borrow


class BookSerializer(serializers.ModelSerializer):
    is_borrowed = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'description',
            'photo_url',
            'created_at',
            'is_borrowed',
            'file_url'
        ]

    def get_photo_url(self, obj):
        if not obj.photo:
            return None

        photo_path = str(obj.photo).lstrip("/")

    # If already full URL, return it
        if photo_path.startswith("http"):
            return photo_path

        bucket = "media"  # change if your bucket name differs

        return f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket}/{photo_path}"

    def get_is_borrowed(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False

        return obj.borrows.filter(
            user=request.user,
            returned=False
        ).exists()

    def get_file_url(self, obj):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            return None

        # Only allow access if borrowed
        is_borrowed = obj.borrows.filter(
            user=request.user,
            returned=False
        ).exists()

        if not is_borrowed:
            return None

        if not obj.file:
            return None

        file_path = str(obj.file).lstrip("/")

        # If already full URL, return it
        if file_path.startswith("http"):
            return file_path

        # Build Supabase Storage URL safely
        bucket = "media"  # change if your bucket name differs

        return f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket}/{file_path}"


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
        if obj.returned or not obj.return_due:
            return False
        return timezone.now() > obj.return_due