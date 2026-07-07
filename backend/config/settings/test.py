from .base import *

DEBUG = True

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# pgvector VectorField → SQLite uyumlu TextField olarak yama
try:
    import pgvector.django as _pgvd
    from django.db.models import TextField as _TextField

    class _SQLiteVectorField(_TextField):
        def __init__(self, *args, dimensions=None, **kwargs):
            self.dimensions = dimensions
            kwargs.setdefault("null", True)
            kwargs.setdefault("blank", True)
            super().__init__(*args, **kwargs)

        def deconstruct(self):
            name, path, args, kwargs = super().deconstruct()
            path = "pgvector.django.vector.VectorField"
            if self.dimensions is not None:
                kwargs["dimensions"] = self.dimensions
            return name, path, args, kwargs

    _pgvd.VectorField = _SQLiteVectorField
    try:
        import pgvector.django.vector as _pgv_vector
        _pgv_vector.VectorField = _SQLiteVectorField
    except Exception:
        pass
except Exception:
    pass

# Testlerde rate limiting devre dışı
DISABLE_THROTTLING = True

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
DEFAULT_FROM_EMAIL = "no-reply@twinmatch.app"
