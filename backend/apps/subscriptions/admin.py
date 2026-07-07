from django.contrib import admin

from .models import Payment, Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "plan", "status", "is_annual", "expires_at")
    search_fields = ("user__email",)
    list_filter = ("plan", "status", "is_annual")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("user", "amount", "currency", "status", "created_at")
    search_fields = ("user__email", "iyzico_payment_id")
    list_filter = ("status", "currency")