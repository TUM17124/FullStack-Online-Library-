# utils.py
import threading
import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def send_email_async(
    subject: str,
    recipient_list: list[str],
    message: str = "",
    html_message: str | None = None,
    from_email: str | None = None,
):
    """
    Send email asynchronously using Django's send_mail (works with Resend via Anymail).
    """
    from_email = from_email or settings.DEFAULT_FROM_EMAIL

    if not from_email:
        logger.error("No from_email provided and DEFAULT_FROM_EMAIL not set")
        return

    def _send():
        try:
            send_mail(
                subject=subject,
                message=message,
                html_message=html_message,
                from_email=from_email,
                recipient_list=recipient_list,
                fail_silently=False,   # handled here – not passed from caller
            )
            logger.info(f"Email queued: {subject} to {recipient_list}")
        except Exception as e:
            logger.exception(f"Email failed: {subject} to {recipient_list} - {e}")

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()