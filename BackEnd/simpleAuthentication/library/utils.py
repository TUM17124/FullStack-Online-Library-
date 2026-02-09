# utils.py
import threading
import resend
from django.conf import settings

resend.api_key = getattr(settings, "RESEND_API_KEY", None)

def send_email_async(subject: str, html_message: str, recipient_list: list, from_email: str = None):
    """
    Send email asynchronously using Resend API.

    Usage:
        send_email_async(
            subject="Hello",
            html_message="<p>This is a test</p>",
            recipient_list=["user@example.com"]
        )
    """
    from_email = from_email or getattr(settings, "RESEND_FROM_EMAIL", None)

    def send():
        try:
            params = {
                "from": from_email,
                "to": recipient_list,
                "subject": subject,
                "html": html_message,
            }
            resend.Emails.send(params)
        except Exception as e:
            print(f"Resend email sending failed: {e}")

    thread = threading.Thread(target=send)
    thread.start()