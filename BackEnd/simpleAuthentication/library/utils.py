# utils.py
import threading
from django.core.mail import send_mail
from django.conf import settings

def send_email_async(subject: str, message: str, from_email: str, recipient_list: list, fail_silently: bool = True):
    """
    Send email in a separate thread to avoid blocking HTTP requests.

    Usage:
        send_email_async(
            subject="Hello",
            message="This is a test",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=["user@example.com"]
        )
    """

    def send():
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=from_email,
                recipient_list=recipient_list,
                fail_silently=fail_silently,
            )
        except Exception as e:
            # Print/log error - safe fail
            print(f"Email sending failed: {e}")

    thread = threading.Thread(target=send)
    thread.start()
