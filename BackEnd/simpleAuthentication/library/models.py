from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import random
from supabase import create_client
from django.conf import settings

supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)

def get_default_due_date():
    return timezone.now() + timedelta(days=14)

class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    photo = models.ImageField(upload_to='book_photos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to='books/', blank=True, null=True)  # The eBook
    is_borrowed = models.BooleanField(default=False)
     
    def save(self, *args, **kwargs):

    # ─────────────────────────────
    # HANDLE FILE UPLOAD (SAFE CHECK)
    # ─────────────────────────────
        if self.file and hasattr(self.file, "file") and not isinstance(self.file, str):

            file_obj = self.file.file

            file_name = f"books/{self.file.name}"

            supabase.storage.from_("media").upload(
                file_name,
             file_obj.read(),
                {
                 "content-type": "application/pdf",
                 "upsert": "true"
             }
            )

            self.file = file_name  # store path only

    # ─────────────────────────────
    # HANDLE PHOTO UPLOAD (SAFE CHECK)
    # ─────────────────────────────
        if self.photo and hasattr(self.photo, "file") and not isinstance(self.photo, str):

            photo_obj = self.photo.file

            photo_name = f"book_photos/{self.photo.name}"

            supabase.storage.from_("media").upload(
             photo_name,
                photo_obj.read(),
                {
                 "content-type": "image/jpeg",
                 "upsert": "true"
              }
            )

            self.photo = photo_name

        super().save(*args, **kwargs)
    
    @property
    def is_borrowed(self):
        return self.borrows.filter(returned=False).exists()

    @property
    def current_borrow(self):
        return self.borrows.filter(returned=False).first()

    def __str__(self):
        return self.title

class Borrow(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrows')
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrows')
    borrow_date = models.DateTimeField(default=timezone.now)
    return_due = models.DateTimeField(default=get_default_due_date)
    returned = models.BooleanField(default=False)
    returned_date = models.DateTimeField(null=True, blank=True)

    @property
    def is_overdue(self):
        return not self.returned and self.return_due < timezone.now()

    def __str__(self):
        return f"{self.user.username} borrowed {self.book.title}"

class EmailVerificationCode(models.Model):
    purpose = models.CharField(
    max_length=20,
    choices=[('verify', 'verify'), ('reset', 'reset')],
    default='verify'
)


    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='verification_code')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            self.expires_at = timezone.now() + timedelta(minutes=15)  # 15 min expiry
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.user.username} - {self.code} ({'expired' if self.is_expired() else 'valid'})"
    
class PasswordResetCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=15)

    def __str__(self):
        return f"{self.user.email} - {self.code}"
