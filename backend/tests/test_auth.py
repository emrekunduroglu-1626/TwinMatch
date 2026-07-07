"""
Gerçek auth katmanı testleri: register, login, refresh, logout,
OTP akışı, age-confirm, me, güvenlik (enumeration koruması).
"""
from django.test import override_settings
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import OtpCode, User

class RegisterTests(APITestCase):
    url = "/api/v1/auth/register/"

    def test_register_success_returns_tokens(self):
        r = self.client.post(self.url, {
            "email": "new@test.com", "phone": "+905551112233", "password": "Str0ngPass!x"
        }, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertIn("access", r.json()["tokens"])
        self.assertIn("refresh", r.json()["tokens"])
        self.assertTrue(User.objects.filter(email="new@test.com").exists())

    def test_duplicate_email_rejected(self):
        User.objects.create_user(email="dup@test.com", phone="+905551112230", password="Str0ngPass!x")
        r = self.client.post(self.url, {
            "email": "dup@test.com", "phone": "+905551112299", "password": "Str0ngPass!x"
        }, format="json")
        self.assertEqual(r.status_code, 400)

    def test_duplicate_phone_rejected(self):
        User.objects.create_user(email="p1@test.com", phone="+905551112231", password="Str0ngPass!x")
        r = self.client.post(self.url, {
            "email": "p2@test.com", "phone": "+905551112231", "password": "Str0ngPass!x"
        }, format="json")
        self.assertEqual(r.status_code, 400)

    def test_weak_password_rejected(self):
        r = self.client.post(self.url, {
            "email": "weak@test.com", "phone": "+905551112232", "password": "12345678"
        }, format="json")
        self.assertEqual(r.status_code, 400)

    def test_invalid_phone_rejected(self):
        r = self.client.post(self.url, {
            "email": "ph@test.com", "phone": "abc", "password": "Str0ngPass!x"
        }, format="json")
        self.assertEqual(r.status_code, 400)


class LoginTests(APITestCase):
    url = "/api/v1/auth/login/"

    def setUp(self):
        self.user = User.objects.create_user(
            email="login@test.com", phone="+905551112240", password="Str0ngPass!x"
        )

    def test_login_success(self):
        r = self.client.post(self.url, {"email": "login@test.com", "password": "Str0ngPass!x"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertIn("access", r.json()["tokens"])

    def test_wrong_password_401(self):
        r = self.client.post(self.url, {"email": "login@test.com", "password": "wrong"}, format="json")
        self.assertEqual(r.status_code, 401)

    def test_unknown_email_same_message_as_wrong_password(self):
        """Enumeration koruması: iki hata da aynı mesajı döner."""
        r1 = self.client.post(self.url, {"email": "login@test.com", "password": "wrong"}, format="json")
        r2 = self.client.post(self.url, {"email": "ghost@test.com", "password": "wrong"}, format="json")
        self.assertEqual(r1.json()["detail"], r2.json()["detail"])

    def test_inactive_user_rejected(self):
        self.user.is_active = False
        self.user.save()
        r = self.client.post(self.url, {"email": "login@test.com", "password": "Str0ngPass!x"}, format="json")
        self.assertEqual(r.status_code, 401)

    def test_login_updates_last_login(self):
        self.client.post(self.url, {"email": "login@test.com", "password": "Str0ngPass!x"}, format="json")
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.last_login)


class TokenFlowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="tok@test.com", phone="+905551112250", password="Str0ngPass!x"
        )
        r = self.client.post("/api/v1/auth/login/",
                             {"email": "tok@test.com", "password": "Str0ngPass!x"}, format="json")
        self.tokens = r.json()["tokens"]

    def test_refresh_returns_new_access(self):
        r = self.client.post("/api/v1/auth/token/refresh/", {"refresh": self.tokens["refresh"]}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertIn("access", r.json())

    def test_invalid_refresh_401(self):
        r = self.client.post("/api/v1/auth/token/refresh/", {"refresh": "bogus"}, format="json")
        self.assertEqual(r.status_code, 401)

    def test_me_with_access_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}")
        r = self.client.get("/api/v1/auth/me/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["email"], "tok@test.com")

    def test_logout_blacklists_refresh(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.tokens['access']}")
        r = self.client.post("/api/v1/auth/logout/", {"refresh": self.tokens["refresh"]}, format="json")
        self.assertEqual(r.status_code, 200)
        # Blacklist sonrası refresh artık çalışmamalı
        r2 = self.client.post("/api/v1/auth/token/refresh/", {"refresh": self.tokens["refresh"]}, format="json")
        self.assertEqual(r2.status_code, 401)


@override_settings(DEBUG=True)
class OtpFlowTests(APITestCase):
    phone = "+905551112260"

    def _send(self):
        return self.client.post("/api/v1/auth/phone/send-otp/", {"phone": self.phone}, format="json")

    def test_send_otp_creates_hashed_record(self):
        r = self._send()
        self.assertEqual(r.status_code, 200)
        otp = OtpCode.objects.get(phone=self.phone, is_used=False)
        self.assertEqual(len(otp.code_hash), 64)  # SHA-256 hex
        self.assertNotEqual(otp.code_hash, r.json().get("debug_code"))  # düz metin saklanmaz

    def test_verify_correct_code(self):
        user = User.objects.create_user(email="otp@test.com", phone=self.phone, password="Str0ngPass!x")
        code = self._send().json()["debug_code"]
        r = self.client.post("/api/v1/auth/phone/verify-otp/", {"phone": self.phone, "code": code}, format="json")
        self.assertEqual(r.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.is_phone_verified)

    def test_wrong_code_increments_attempts(self):
        self._send()
        self.client.post("/api/v1/auth/phone/verify-otp/", {"phone": self.phone, "code": "000000"}, format="json")
        otp = OtpCode.objects.get(phone=self.phone, is_used=False)
        self.assertEqual(otp.attempts, 1)

    def test_code_single_use(self):
        User.objects.create_user(email="su@test.com", phone=self.phone, password="Str0ngPass!x")
        code = self._send().json()["debug_code"]
        self.client.post("/api/v1/auth/phone/verify-otp/", {"phone": self.phone, "code": code}, format="json")
        r2 = self.client.post("/api/v1/auth/phone/verify-otp/", {"phone": self.phone, "code": code}, format="json")
        self.assertEqual(r2.status_code, 400)

    def test_new_send_invalidates_old_code(self):
        old_code = self._send().json()["debug_code"]
        self._send()
        r = self.client.post("/api/v1/auth/phone/verify-otp/", {"phone": self.phone, "code": old_code}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_max_attempts_locks_code(self):
        code = self._send().json()["debug_code"]
        for _ in range(5):
            self.client.post("/api/v1/auth/phone/verify-otp/", {"phone": self.phone, "code": "999999"}, format="json")
        # 5 hatalı denemeden sonra doğru kod bile reddedilir
        r = self.client.post("/api/v1/auth/phone/verify-otp/", {"phone": self.phone, "code": code}, format="json")
        self.assertEqual(r.status_code, 400)


class AgeConfirmAndResetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="age@test.com", phone="+905551112270", password="Str0ngPass!x"
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_age_confirm_true(self):
        r = self.client.post("/api/v1/auth/age-confirm/", {"is_age_confirmed": True}, format="json")
        self.assertEqual(r.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_age_confirmed)

    def test_age_confirm_false_rejected(self):
        r = self.client.post("/api/v1/auth/age-confirm/", {"is_age_confirmed": False}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_password_reset_no_enumeration(self):
        """Kayıtlı ve kayıtsız e-posta aynı yanıtı almalı."""
        anon = APIClient()
        r1 = anon.post("/api/v1/auth/password/reset/", {"email": "age@test.com"}, format="json")
        r2 = anon.post("/api/v1/auth/password/reset/", {"email": "ghost@test.com"}, format="json")
        self.assertEqual(r1.status_code, 200)
        self.assertEqual(r1.json(), r2.json())
