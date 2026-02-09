# utils.py
import threading
import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)

def send_email_async(
    subject: str,
    recipient_list: list[str],          # required - first
    message: str = "",                  # optional (plain text fallback)
    html_message: str | None = None,    # optional
    from_email: str | None = None,
):
    """
    Send email asynchronously using Django's send_mail (Resend backend).
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
                fail_silently=False,
            )
            logger.info(f"Async email sent to {recipient_list} - Subject: {subject}")
        except Exception as e:
            logger.exception(f"Async email failed to {recipient_list}: {e}")

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()