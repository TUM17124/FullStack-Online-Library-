# utils.py
import threading
import logging
import uuid
from django.core.mail import send_mail
from django.conf import settings
from supabase import create_client

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)

# ─────────────────────────────────────────────
# EMAIL SENDER
# ─────────────────────────────────────────────

def send_email_async(
    subject: str,
    recipient_list: list[str],
    message: str = "",
    html_message: str | None = None,
    from_email: str | None = None,
):
    """
    Send email asynchronously using Django's send_mail.
    Works with Resend via Anymail.
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
            logger.info(f"Email sent: {subject} to {recipient_list}")
        except Exception as e:
            logger.exception(f"Email failed: {subject} to {recipient_list} - {e}")

    thread = threading.Thread(target=_send, daemon=True)
    thread.start()


# ─────────────────────────────────────────────
# SUPABASE FILE UPLOAD
# ─────────────────────────────────────────────

def upload_file(file):
    """
    Upload a file to Supabase storage bucket 'media'
    """
    # Create unique filename
    filename = f"{uuid.uuid4()}_{file.name}"

    # Upload file
    supabase.storage.from_("media").upload(
        filename,
        file.read(),
        {"content-type": file.content_type}
    )

    # Return public URL
    return f"{settings.SUPABASE_URL}/storage/v1/object/public/media/{filename}"