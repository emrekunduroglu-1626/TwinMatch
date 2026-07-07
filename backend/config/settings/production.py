import os
from .base import *


def _csv_env(name: str, default: str = ""):
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


DEBUG = False
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("DJANGO_SECRET_KEY environment variable is required in production.")

ALLOWED_HOSTS = _csv_env("DJANGO_ALLOWED_HOSTS", "api.twinmatch.app")
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = _csv_env("CORS_ALLOWED_ORIGINS", "https://admin.twinmatch.app,https://twinmatch.app")
CSRF_TRUSTED_ORIGINS = _csv_env("CSRF_TRUSTED_ORIGINS", "https://admin.twinmatch.app,https://twinmatch.app")

SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "true").lower() == "true"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
X_FRAME_OPTIONS = "DENY"

REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {
    "anon": os.getenv("THROTTLE_ANON", "30/min"),
    "user": os.getenv("THROTTLE_USER", "120/min"),
    "auth_burst": os.getenv("THROTTLE_AUTH_BURST", "5/min"),
}
