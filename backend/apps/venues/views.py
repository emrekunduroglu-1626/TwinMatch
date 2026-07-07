import math

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from .models import Venue
from .serializers import VenueDetailSerializer, VenueListSerializer

from common.pagination import DefaultPagination

MAX_RADIUS_KM = 25.0



def _bounding_box_filter(queryset, lat, lng, radius_km):
    """Haversine öncesi SQL seviyesinde kaba dikdörtgen filtresi.

    1 enlem derecesi ~111 km; boylam derecesi enleme göre daralır.
    Bu ön filtre olmadan tüm aktif mekanlar Python döngüsüne girer (O(n) RAM).
    """
    lat_delta = radius_km / 111.0
    cos_lat = max(math.cos(math.radians(lat)), 0.01)  # kutup bölgesinde sıfıra bölünme koruması
    lng_delta = radius_km / (111.0 * cos_lat)
    return queryset.filter(
        latitude__gte=lat - lat_delta,
        latitude__lte=lat + lat_delta,
        longitude__gte=lng - lng_delta,
        longitude__lte=lng + lng_delta,
    )

def _haversine_km(lat1, lng1, lat2, lng2):
    radius_km = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    return radius_km * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _parse_location_params(params):
    provided = {"lat": params.get("lat"), "lng": params.get("lng"), "radius_km": params.get("radius_km")}
    if not any(value not in (None, "") for value in provided.values()):
        return None
    if not all(value not in (None, "") for value in provided.values()):
        raise ValidationError({"location": "lat, lng ve radius_km birlikte gönderilmelidir."})
    try:
        lat = float(provided["lat"])
        lng = float(provided["lng"])
        radius_km = float(provided["radius_km"])
    except (TypeError, ValueError):
        raise ValidationError({"location": "lat, lng ve radius_km geçerli sayı olmalıdır."})
    if not -90 <= lat <= 90:
        raise ValidationError({"lat": "Enlem -90 ile 90 arasında olmalıdır."})
    if not -180 <= lng <= 180:
        raise ValidationError({"lng": "Boylam -180 ile 180 arasında olmalıdır."})
    if radius_km <= 0 or radius_km > MAX_RADIUS_KM:
        raise ValidationError({"radius_km": f"Yarıçap 0 ile {int(MAX_RADIUS_KM)} km arasında olmalıdır."})
    return lat, lng, radius_km


class VenueListView(generics.ListAPIView):
    serializer_class = VenueListSerializer
    permission_classes = [AllowAny]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category", "city", "district", "is_safe_date_spot", "is_sponsored"]

    def get_queryset(self):
        queryset = Venue.objects.filter(is_active=True).select_related("category")
        location = _parse_location_params(self.request.query_params)
        if location:
            lat_f, lng_f, radius_f = location
            queryset = _bounding_box_filter(queryset, lat_f, lng_f, radius_f)
            nearby_ids = [
                venue.id
                for venue in queryset
                if _haversine_km(lat_f, lng_f, venue.latitude, venue.longitude) <= radius_f
            ]
            queryset = queryset.filter(id__in=nearby_ids)

        # Anlaşmalı/sponsorlu mekanlar açıkça sponsorlu olarak önce gelir.
        return queryset.order_by("-is_sponsored", "-safety_score", "name")


class VenueDetailView(generics.RetrieveAPIView):
    queryset = Venue.objects.filter(is_active=True).select_related("category")
    serializer_class = VenueDetailSerializer
    permission_classes = [AllowAny]


class SafeDateSpotsView(generics.ListAPIView):
    serializer_class = VenueListSerializer
    permission_classes = [AllowAny]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category", "city", "district"]

    def get_queryset(self):
        queryset = Venue.objects.filter(is_active=True, is_safe_date_spot=True, safety_score__gte=7).select_related("category")
        location = _parse_location_params(self.request.query_params)
        if location:
            lat_f, lng_f, radius_f = location
            queryset = _bounding_box_filter(queryset, lat_f, lng_f, radius_f)
            nearby_ids = [
                venue.id
                for venue in queryset
                if _haversine_km(lat_f, lng_f, venue.latitude, venue.longitude) <= radius_f
            ]
            queryset = queryset.filter(id__in=nearby_ids)
        return queryset.order_by("-is_sponsored", "-safety_score", "name")
