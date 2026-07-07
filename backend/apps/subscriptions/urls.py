from django.urls import path

from .views import CancelSubscriptionView, CheckoutView, CurrentSubscriptionView, IyzicoWebhookView, PlansView


urlpatterns = [
    path("plans/", PlansView.as_view(), name="subscriptions-plans"),
    path("checkout/", CheckoutView.as_view(), name="subscriptions-checkout"),
    path("webhook/iyzico/", IyzicoWebhookView.as_view(), name="subscriptions-webhook-iyzico"),
    path("current/", CurrentSubscriptionView.as_view(), name="subscriptions-current"),
    path("cancel/", CancelSubscriptionView.as_view(), name="subscriptions-cancel"),
]