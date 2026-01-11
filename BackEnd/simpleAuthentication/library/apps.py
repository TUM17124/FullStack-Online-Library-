# library/apps.py
from django.apps import AppConfig


class LibraryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'library'

    def ready(self):
        # Important: only import signals when the app is actually ready
        # This prevents AppRegistryNotReady errors during startup
        try:
            import library.signals
        except ImportError:
            pass  # signals.py might not exist yet - that's ok