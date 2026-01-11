from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import random

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
