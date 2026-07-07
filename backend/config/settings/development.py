from .base import *


DEBUG = True
# Geliştirmede e-postalar konsola yazılır
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "no-reply@twinmatch.app"
FRONTEND_RESET_URL = "twinmatch://password-reset"
