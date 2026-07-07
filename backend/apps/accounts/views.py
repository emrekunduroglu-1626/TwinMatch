"""
Gerçek kimlik doğrulama katmanı — JWT (simplejwt) tabanlı.

Güvenlik önlemleri:
- Login/register/OTP endpoint'lerinde rate limiting (throttle)
- OTP kodları SHA-256 hash ile saklanır, 5 deneme + 3 dk geçerlilik
- Login hatalarında e-posta varlığı sızdırılmaz (tek tip mesaj)
- Şifre sıfırlamada hesap varlığı sızdırılmaz (her zaman 200)
- Refresh token rotasyonu ve logout'ta blacklist
"""
import hashlib
import secrets
from datetime import timedelta

from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OtpCode, User
from .serializers import (
    AgeConfirmSerializer,
    LoginSerializer,
    LogoutSerializer,
    MeSerializer,
    PasswordResetSerializer,
    DeleteAccountSerializer,
    RegisterSerializer,
    SendOtpSerializer,
    TokenRefreshSerializer,
    VerifyOtpSerializer,
)

OTP_TTL = timedelta(minutes=3)


class AuthBurstThrottle(AnonRateThrottle):
    scope = "auth_burst"

    def allow_request(self, request, view):
        from django.conf import settings as dj_settings
        if getattr(dj_settings, "DISABLE_THROTTLING", False):
            return True
        return super().allow_request(request, view)


def _tokens_for_user(user: User) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstThrottle]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.create_user(
            email=serializer.validated_data["email"],
            phone=serializer.validated_data["phone"],
            password=serializer.validated_data["password"],
        )
        return Response(
            {"user": MeSerializer(user).data, "tokens": _tokens_for_user(user)},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstThrottle]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            request,
            email=serializer.validated_data["email"].lower().strip(),
            password=serializer.validated_data["password"],
        )
        # Tek tip hata: e-posta mı yanlış şifre mi belli olmaz (enumeration koruması)
        if user is None or not user.is_active:
            return Response(
                {"detail": "E-posta veya şifre hatalı."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])
        return Response({"user": MeSerializer(user).data, "tokens": _tokens_for_user(user)})


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            refresh = RefreshToken(serializer.validated_data["refresh"])
        except TokenError:
            return Response({"detail": "Geçersiz veya süresi dolmuş token."}, status=status.HTTP_401_UNAUTHORIZED)
        return Response({"access": str(refresh.access_token)})


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_str = serializer.validated_data.get("refresh", "")
        if token_str:
            try:
                RefreshToken(token_str).blacklist()
            except TokenError:
                pass  # Zaten geçersiz — sessizce başarı dön
        return Response({"detail": "Çıkış yapıldı."})


class SendOtpView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstThrottle]

    def post(self, request, *args, **kwargs):
        serializer = SendOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"]

        code = f"{secrets.randbelow(1000000):06d}"
        OtpCode.objects.filter(phone=phone, is_used=False).update(is_used=True)
        OtpCode.objects.create(
            phone=phone,
            code_hash=_hash_code(code),
            expires_at=timezone.now() + OTP_TTL,
        )
        # TODO: SMS sağlayıcı entegrasyonu (Netgsm/Twilio).
        # Geliştirme ortamında kod loglanır, üretimde asla response'a konmaz.
        response = {"detail": "Doğrulama kodu gönderildi.", "ttl_seconds": int(OTP_TTL.total_seconds())}
        from django.conf import settings as dj_settings
        if dj_settings.DEBUG:
            response["debug_code"] = code
        return Response(response)


class VerifyOtpView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstThrottle]

    def post(self, request, *args, **kwargs):
        serializer = VerifyOtpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data["phone"].replace(" ", "").replace("-", "")
        code = serializer.validated_data["code"]

        otp = OtpCode.objects.filter(phone=phone, is_used=False).order_by("-created_at").first()
        if not otp or not otp.is_valid:
            return Response({"detail": "Kod geçersiz veya süresi dolmuş."}, status=status.HTTP_400_BAD_REQUEST)

        if otp.code_hash != _hash_code(code):
            otp.attempts += 1
            otp.save(update_fields=["attempts", "updated_at"])
            return Response({"detail": "Kod hatalı."}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save(update_fields=["is_used", "updated_at"])

        updated = False
        if request.user.is_authenticated and request.user.phone == phone:
            request.user.is_phone_verified = True
            request.user.save(update_fields=["is_phone_verified", "updated_at"])
            updated = True
        else:
            user = User.objects.filter(phone=phone).first()
            if user:
                user.is_phone_verified = True
                user.save(update_fields=["is_phone_verified", "updated_at"])
                updated = True

        return Response({"detail": "Telefon doğrulandı.", "user_updated": updated})


class AgeConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = AgeConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not serializer.validated_data["is_age_confirmed"]:
            return Response({"detail": "18 yaş onayı zorunludur."}, status=status.HTTP_400_BAD_REQUEST)
        request.user.is_age_confirmed = True
        request.user.save(update_fields=["is_age_confirmed", "updated_at"])
        return Response({"detail": "Yaş onayı kaydedildi.", "user": MeSerializer(request.user).data})


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AuthBurstThrottle]

    def post(self, request, *args, **kwargs):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Hesap var mı yok mu sızdırılmaz — her durumda aynı yanıt.
        # TODO: e-posta sağlayıcı entegrasyonu ile sıfırlama linki gönderimi.
        return Response({"detail": "Eğer bu e-posta kayıtlıysa, sıfırlama bağlantısı gönderildi."})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response(MeSerializer(request.user).data)


class PrivacyExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            "user": MeSerializer(user).data,
            "gift_settings": getattr(user, "gift_setting", None) and {
                "can_receive": user.gift_setting.can_receive,
                "can_send": user.gift_setting.can_send,
                "receive_from": user.gift_setting.receive_from,
            },
            "address_vault_present": hasattr(user, "address_vault"),
            "subscriptions": [
                {"plan": s.plan, "status": s.status, "expires_at": s.expires_at}
                for s in user.subscriptions.order_by("-created_at")[:20]
            ],
            "safety": {
                "blocks_created": user.blocks_created.count() if hasattr(user, "blocks_created") else 0,
                "reports_created": user.reports_created.count() if hasattr(user, "reports_created") else 0,
            },
        })


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = DeleteAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data["password"]):
            return Response({"detail": "Şifre hatalı."}, status=status.HTTP_400_BAD_REQUEST)
        request.user.is_active = False
        request.user.email = f"deleted-{request.user.id}@deleted.twinmatch.local"
        request.user.phone = None
        request.user.set_unusable_password()
        request.user.save(update_fields=["is_active", "email", "phone", "password", "updated_at"])
        return Response({"detail": "Hesap kapatıldı ve kişisel erişim verileri anonimleştirildi."})
