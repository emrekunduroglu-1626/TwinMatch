from decimal import Decimal
from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APIClient, APITestCase

from apps.accounts.models import User
from apps.gifts.models import AddressVault, GiftCategory, GiftOrder, GiftProduct, GiftSetting
from apps.matching.models import Match
from apps.subscriptions.models import Subscription
from apps.venues.models import Venue, VenueCategory


class GiftMarketReadinessTests(APITestCase):
    def setUp(self):
        self.sender = User.objects.create_user(email="sender@test.com", phone="+905551110001", password="Str0ngPass!x")
        self.receiver = User.objects.create_user(email="receiver@test.com", phone="+905551110002", password="Str0ngPass!x")
        self.category = GiftCategory.objects.create(name="Çiçek", slug="flower")
        self.product = GiftProduct.objects.create(
            category=self.category,
            name="Gül Buketi",
            price=Decimal("500.00"),
            service_fee=Decimal("150.00"),
            supplier=GiftProduct.Supplier.AMAZON,
            tier_required=GiftProduct.TierRequired.GOLD,
            is_available=True,
        )
        Match.objects.create(user_a=self.sender, user_b=self.receiver, stage=Match.Stage.READY_TO_REVEAL, status=Match.Status.ACTIVE)
        GiftSetting.objects.create(
            user=self.receiver,
            can_receive=True,
            can_send=False,
            receive_from=GiftSetting.ReceiveFrom.MATCHES_ONLY,
        )
        Subscription.objects.create(
            user=self.sender,
            plan=Subscription.Plan.PLUS,
            price_monthly=Decimal("499.00"),
            status=Subscription.Status.ACTIVE,
            started_at=timezone.now(),
            expires_at=timezone.now() + timedelta(days=30),
        )
        self.client = APIClient()
        self.client.force_authenticate(self.sender)

    def test_freemium_cannot_enable_gift_settings(self):
        free_user = User.objects.create_user(email="free@test.com", phone="+905551110003", password="Str0ngPass!x")
        client = APIClient()
        client.force_authenticate(free_user)
        response = client.patch("/api/v1/gifts/settings/", {"can_receive": True, "can_send": True}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_sender_can_send_false_blocks_order_creation(self):
        GiftSetting.objects.create(user=self.sender, can_send=False, can_receive=False)
        response = self.client.post(
            "/api/v1/gifts/orders/",
            {"receiver": str(self.receiver.id), "product": str(self.product.id), "gift_note": "Merhaba"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_sender_can_send_true_allows_pending_order_and_masks_note(self):
        GiftSetting.objects.create(user=self.sender, can_send=True, can_receive=False)
        response = self.client.post(
            "/api/v1/gifts/orders/",
            {
                "receiver": str(self.receiver.id),
                "product": str(self.product.id),
                "gift_note": "Bana test@example.com veya @emre123 üzerinden yaz, Moda Mah. No:5",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        order = GiftOrder.objects.get(id=response.json()["id"])
        self.assertNotIn("test@example.com", order.gift_note)
        self.assertNotIn("@emre123", order.gift_note)
        self.assertNotIn("Moda Mah", order.gift_note)
        self.assertFalse(order.note_moderated)

    def test_receiver_cannot_accept_without_verified_address_vault(self):
        GiftSetting.objects.create(user=self.sender, can_send=True, can_receive=False)
        order = GiftOrder.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            product=self.product,
            payment_amount=self.product.total_price,
        )
        receiver_client = APIClient()
        receiver_client.force_authenticate(self.receiver)
        response = receiver_client.post(f"/api/v1/gifts/orders/{order.id}/accept/", {}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_receiver_accepts_with_verified_address_vault(self):
        GiftSetting.objects.create(user=self.sender, can_send=True, can_receive=False)
        AddressVault.objects.create(
            user=self.receiver,
            address_line1="Teslimat Caddesi 1",
            city="İstanbul",
            district="Kadıköy",
            postal_code="34710",
            phone_masked="+90555***0002",
            is_verified=True,
        )
        order = GiftOrder.objects.create(
            sender=self.sender,
            receiver=self.receiver,
            product=self.product,
            payment_amount=self.product.total_price,
        )
        receiver_client = APIClient()
        receiver_client.force_authenticate(self.receiver)
        response = receiver_client.post(f"/api/v1/gifts/orders/{order.id}/accept/", {}, format="json")
        self.assertEqual(response.status_code, 200)
        order.refresh_from_db()
        self.assertEqual(order.status, GiftOrder.Status.APPROVED)

    def test_bad_catalog_price_filter_returns_400(self):
        response = self.client.get("/api/v1/gifts/catalog/?min_price=abc")
        self.assertEqual(response.status_code, 400)


class VenueMarketReadinessTests(APITestCase):
    def setUp(self):
        self.category = VenueCategory.objects.create(name="Kafe", slug="cafe")
        Venue.objects.create(
            name="Safe Cafe",
            category=self.category,
            address="Merkez",
            city="İstanbul",
            district="Kadıköy",
            latitude=40.99,
            longitude=29.02,
            is_safe_date_spot=True,
            safety_score=9,
            is_sponsored=True,
        )

    def test_invalid_location_params_return_400(self):
        response = self.client.get("/api/v1/venues/?lat=abc&lng=29&radius_km=5")
        self.assertEqual(response.status_code, 400)

    def test_radius_limit_return_400(self):
        response = self.client.get("/api/v1/venues/?lat=41&lng=29&radius_km=999")
        self.assertEqual(response.status_code, 400)


class SafetyAndPrivacyTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="safe@test.com", phone="+905551110010", password="Str0ngPass!x")
        self.other = User.objects.create_user(email="other@test.com", phone="+905551110011", password="Str0ngPass!x")
        self.client.force_authenticate(self.user)

    def test_user_can_block_and_report(self):
        block = self.client.post("/api/v1/safety/blocks/", {"blocked": str(self.other.id), "reason": "Rahatsız etti"}, format="json")
        self.assertEqual(block.status_code, 201)
        report = self.client.post(
            "/api/v1/safety/reports/",
            {"reported_user": str(self.other.id), "category": "profile", "reason": "Fake profil", "details": "Şüpheli."},
            format="json",
        )
        self.assertEqual(report.status_code, 201)

    def test_privacy_export_and_account_delete_exist(self):
        export = self.client.get("/api/v1/auth/privacy/export/")
        self.assertEqual(export.status_code, 200)
        delete = self.client.post("/api/v1/auth/account/delete/", {"password": "Str0ngPass!x"}, format="json")
        self.assertEqual(delete.status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)
