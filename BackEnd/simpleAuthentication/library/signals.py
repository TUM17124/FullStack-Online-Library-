# library/signals.py (create this file if needed)
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User

@receiver(post_save, sender=User)
def prevent_accidental_activation(sender, instance, **kwargs):
    if instance.pk and not instance.is_active:  # new or existing inactive user
        if instance.is_active:  # someone tried to activate it
            print("WARNING: Attempt to activate inactive user blocked!")
            instance.is_active = False
            instance.save(update_fields=['is_active'])