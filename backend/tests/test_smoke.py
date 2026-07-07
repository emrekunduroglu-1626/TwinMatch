from django.test import Client, TestCase


class HealthEndpointTests(TestCase):
    def test_health_endpoint_returns_ok(self):
        response = Client().get('/api/v1/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok'})


class ProtectedEndpointTests(TestCase):
    def test_protected_endpoints_require_authentication(self):
        client = Client()
        endpoints = [
            '/api/v1/profiles/me/',
            '/api/v1/digital-twin/status/',
            '/api/v1/matching/candidates/',
            '/api/v1/chat/conversations/',
            '/api/v1/discovery/feed/',
            '/api/v1/calendar/availability/',
            '/api/v1/subscriptions/current/',
            '/api/v1/notifications/',
            '/api/v1/admin/dashboard/',
            '/api/v1/auth/me/',
            '/api/v1/auth/logout/',
            '/api/v1/auth/age-confirm/',
        ]
        for endpoint in endpoints:
            with self.subTest(endpoint=endpoint):
                response = client.get(endpoint)
                self.assertEqual(response.status_code, 401)
