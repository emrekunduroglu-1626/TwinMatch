"""
SMS gönderim katmanı — sağlayıcı soyutlaması.

SMS_PROVIDER ortam değişkeniyle seçilir:
  console (varsayılan) → geliştirmede loga yazar
  netgsm               → Netgsm REST API (NETGSM_USERCODE, NETGSM_PASSWORD, NETGSM_HEADER)

Yeni sağlayıcı eklemek: SmsBackend'i uygula, _BACKENDS'e kaydet.
"""
import logging
import os
from abc import ABC, abstractmethod

logger = logging.getLogger("twinmatch.sms")


class SmsBackend(ABC):
    @abstractmethod
    def send(self, phone: str, message: str) -> bool:
        """True dönerse gönderim sağlayıcıya teslim edildi demektir."""


class ConsoleSmsBackend(SmsBackend):
    """Geliştirme: SMS'i loga yazar, her zaman başarılı sayılır."""

    def send(self, phone: str, message: str) -> bool:
        logger.info("SMS[console] to=%s message=%s", phone, message)
        return True


class NetgsmSmsBackend(SmsBackend):
    """Netgsm XML/REST API. Kimlik bilgileri env'den okunur; response body loglanmaz."""

    API_URL = "https://api.netgsm.com.tr/sms/send/get"

    def __init__(self):
        self.usercode = os.environ.get("NETGSM_USERCODE", "")
        self.password = os.environ.get("NETGSM_PASSWORD", "")
        self.header = os.environ.get("NETGSM_HEADER", "TWINMATCH")
        if not (self.usercode and self.password):
            raise RuntimeError("NETGSM_USERCODE ve NETGSM_PASSWORD ortam değişkenleri gereklidir.")

    def send(self, phone: str, message: str) -> bool:
        import urllib.parse
        import urllib.request

        params = urllib.parse.urlencode({
            "usercode": self.usercode,
            "password": self.password,
            "gsmno": phone.lstrip("+"),
            "message": message,
            "msgheader": self.header,
        })
        try:
            with urllib.request.urlopen(f"{self.API_URL}?{params}", timeout=10) as resp:
                body = resp.read().decode("utf-8", errors="ignore")
                # Netgsm başarıda "00 <bulkid>" döner
                ok = body.strip().startswith("00")
                if not ok:
                    logger.warning("SMS[netgsm] delivery failed code=%s", body.strip()[:8])
                return ok
        except Exception:
            logger.exception("SMS[netgsm] request error")
            return False


_BACKENDS = {
    "console": ConsoleSmsBackend,
    "netgsm": NetgsmSmsBackend,
}


def get_sms_backend() -> SmsBackend:
    provider = os.environ.get("SMS_PROVIDER", "console").lower()
    backend_cls = _BACKENDS.get(provider)
    if backend_cls is None:
        raise RuntimeError(f"Bilinmeyen SMS_PROVIDER: {provider}")
    return backend_cls()


def send_otp_sms(phone: str, code: str) -> bool:
    return get_sms_backend().send(phone, f"TwinMatch doğrulama kodunuz: {code}. 3 dakika geçerlidir.")
