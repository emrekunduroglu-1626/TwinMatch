from django.urls import path

from .views import (
    CancelSubscriptionView,
    CheckoutCallbackView,
    CheckoutView,
    CurrentSubscriptionView,
    IyzicoWebhookView,
    PlansView,
)


urlpatterns = [
    path("plans/", PlansView.as_view(), name="subscriptions-plans"),
    path("checkout/", CheckoutView.as_view(), name="subscriptions-checkout"),
    path("checkout/callback/", CheckoutCallbackView.as_view(), name="subscriptions-checkout-callback"),
    path("webhook/iyzico/", IyzicoWebhookView.as_view(), name="subscriptions-webhook-iyzico"),
    path("current/", CurrentSubscriptionView.as_view(), name="subscriptions-current"),
    path("cancel/", CancelSubscriptionView.as_view(), name="subscriptions-cancel"),
]