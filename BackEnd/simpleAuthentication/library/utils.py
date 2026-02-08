import threading
from django.core.mail import send_mail

def send_email_async(subject, message, from_email, recipient_list, fail_silently=False):
    def task():
        try:
            send_mail(subject, message, from_email, recipient_list, fail_silently=fail_silently)
        except Exception as e:
            print(f"Async email failed: {e}")

    threading.Thread(target=task).start()
