from decimal import Decimal, InvalidOperation

from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from common.pagination import DefaultPagination

from .models import AddressVault, GiftCategory, GiftNotification, GiftOrder, GiftProduct, GiftSetting
from .permissions import IsGiftOrderParticipant
from .serializers import (
    AddressVaultSerializer,
    GiftCategorySerializer,
    GiftNotificationSerializer,
    GiftOrderCreateSerializer,
    GiftOrderRejectSerializer,
    GiftOrderSerializer,
    GiftProductSerializer,
    GiftSettingSerializer,
)
from .services import (
    ALLOWED_SUPPLIERS,
    address_vault_is_ready,
    can_receiver_accept_from_sender,
    can_sender_send_gifts,
    get_sender_gift_tier,
    moderate_gift_note,
    sender_tier_allows_product,
)


class GiftSettingViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    serializer_class = GiftSettingSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        setting, _created = GiftSetting.objects.get_or_create(user=self.request.user)
        return setting

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class AddressVaultViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """Adres kasası: sadece sahibi görüntüleyip düzenleyebilir. Gönderen ASLA göremez."""

    serializer_class = AddressVaultSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        address, _created = AddressVault.objects.get_or_create(user=self.request.user)
        return address


class GiftCatalogViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = GiftProduct.objects.filter(is_available=True, supplier__in=ALLOWED_SUPPLIERS).select_related("category")
    serializer_class = GiftProductSerializer
    permission_classes = [AllowAny]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category", "tier_required"]

    def _parse_decimal_param(self, name: str) -> Decimal | None:
        raw = self.request.query_params.get(name)
        if raw in (None, ""):
            return None
        try:
            value = Decimal(str(raw))
        except (InvalidOperation, ValueError):
            raise ValidationError({name: "Geçerli bir sayı girin."})
        if value < 0:
            raise ValidationError({name: "Fiyat negatif olamaz."})
        return value

    def get_queryset(self):
        queryset = super().get_queryset()
        min_price = self._parse_decimal_param("min_price")
        max_price = self._parse_decimal_param("max_price")
        if min_price is not None:
            queryset = queryset.filter(price__gte=min_price)
        if max_price is not None:
            queryset = queryset.filter(price__lte=max_price)
        if min_price is not None and max_price is not None and min_price > max_price:
            raise ValidationError({"price": "min_price max_price değerinden büyük olamaz."})
        return queryset


class GiftOrderViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.CreateModelMixin):
    queryset = GiftOrder.objects.none()
    permission_classes = [IsAuthenticated, IsGiftOrderParticipant]
    pagination_class = DefaultPagination

    def get_queryset(self):
        user = self.request.user
        return (
            GiftOrder.objects.filter(Q(sender=user) | Q(receiver=user))
            .select_related("product", "product__category", "sender", "receiver")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action == "create":
            return GiftOrderCreateSerializer
        if self.action == "reject":
            return GiftOrderRejectSerializer
        return GiftOrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        receiver = serializer.validated_data["receiver"]
        product = serializer.validated_data["product"]
        gift_note = serializer.validated_data.get("gift_note", "")

        if receiver.id == request.user.id:
            return Response({"detail": "Kendine hediye gönderemezsin."}, status=status.HTTP_400_BAD_REQUEST)

        sender_allowed, sender_reason = can_sender_send_gifts(request.user)
        if not sender_allowed:
            return Response({"detail": sender_reason}, status=status.HTTP_403_FORBIDDEN)

        sender_tier = get_sender_gift_tier(request.user)
        if not sender_tier_allows_product(sender_tier, product.tier_required):
            return Response(
                {"detail": "Bu hediyeyi göndermek için gerekli abonelik seviyesine sahip değilsin."},
                status=status.HTTP_403_FORBIDDEN,
            )

        allowed, reason = can_receiver_accept_from_sender(receiver, request.user)
        if not allowed:
            return Response({"detail": reason}, status=status.HTTP_403_FORBIDDEN)

        moderated_note, moderation_passed = moderate_gift_note(gift_note)

        order = GiftOrder.objects.create(
            sender=request.user,
            receiver=receiver,
            product=product,
            status=GiftOrder.Status.PENDING_APPROVAL,
            gift_note=moderated_note,
            note_moderated=moderation_passed,
            payment_status=GiftOrder.PaymentStatus.PENDING,
            payment_amount=product.total_price,
        )
        GiftNotification.objects.create(
            order=order,
            recipient=receiver,
            notification_type=GiftNotification.NotificationType.GIFT_REQUEST,
            message="Sana bir hediye gönderildi. Kabul etmek ister misin?",
        )

        output_serializer = GiftOrderSerializer(order)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None, *args, **kwargs):
        order = self.get_object()
        if order.receiver_id != request.user.id:
            return Response({"detail": "Sadece alıcı bu siparişi kabul edebilir."}, status=status.HTTP_403_FORBIDDEN)
        if order.status != GiftOrder.Status.PENDING_APPROVAL:
            return Response({"detail": "Bu sipariş artık onay bekliyor durumunda değil."}, status=status.HTTP_400_BAD_REQUEST)

        vault_ready, vault_reason = address_vault_is_ready(request.user)
        if not vault_ready:
            return Response({"detail": vault_reason}, status=status.HTTP_400_BAD_REQUEST)

        order.status = GiftOrder.Status.APPROVED
        order.save(update_fields=["status", "updated_at"])
        GiftNotification.objects.create(
            order=order,
            recipient=order.sender,
            notification_type=GiftNotification.NotificationType.GIFT_ACCEPTED,
            message="Hediyeni alıcı kabul etti, hazırlanıyor.",
        )
        return Response(GiftOrderSerializer(order).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None, *args, **kwargs):
        order = self.get_object()
        if order.receiver_id != request.user.id:
            return Response({"detail": "Sadece alıcı bu siparişi reddedebilir."}, status=status.HTTP_403_FORBIDDEN)
        if order.status != GiftOrder.Status.PENDING_APPROVAL:
            return Response({"detail": "Bu sipariş artık onay bekliyor durumunda değil."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.status = GiftOrder.Status.REJECTED
        order.rejection_reason = serializer.validated_data.get("rejection_reason", "")
        order.save(update_fields=["status", "rejection_reason", "updated_at"])
        GiftNotification.objects.create(
            order=order,
            recipient=order.sender,
            notification_type=GiftNotification.NotificationType.GIFT_REJECTED,
            message="Hediyen alıcı tarafından reddedildi.",
        )
        return Response(GiftOrderSerializer(order).data)


class GiftNotificationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = GiftNotification.objects.none()
    serializer_class = GiftNotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagination

    def get_queryset(self):
        return GiftNotification.objects.filter(recipient=self.request.user).select_related("order").order_by("-created_at")

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None, *args, **kwargs):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read", "updated_at"])
        return Response(self.get_serializer(notification).data)
