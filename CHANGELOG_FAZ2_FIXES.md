# Faz 1-2 Tamamlama Yaması — Değişiklik Özeti

## 1. Gerçek Auth Katmanı (önceden %100 skeleton'du)
- **Register**: e-posta/telefon benzersizlik + Django şifre validasyonu, kayıt sonrası otomatik JWT
- **Login**: JWT access (30 dk) + refresh (14 gün), refresh rotasyonu, enumeration koruması
  (yanlış şifre ve olmayan e-posta aynı mesajı döner)
- **Logout**: refresh token blacklist (simplejwt token_blacklist)
- **OTP**: SHA-256 hash ile saklanır (düz metin asla), 3 dk TTL, 5 deneme limiti,
  tek kullanımlık, yeni kod eskisini iptal eder. DEBUG=True'da debug_code döner (SMS entegrasyonu TODO)
- **Age-confirm / Me**: gerçek kullanıcı güncellemesi + profil dönüşü
- **Password reset**: hesap varlığı sızdırılmaz (her zaman aynı 200 yanıtı)
- **Rate limiting**: auth endpoint'lerinde 10/dk, genel anon 60/dk, user 240/dk

## 2. Güvenlik Sertleştirmeleri
- AUTH_PASSWORD_VALIDATORS eklendi (min 8, yaygın şifre + tamamen sayısal engeli)
- SIMPLE_JWT: ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION
- Admin panel token'ları bellek içi tutulur (localStorage yok → XSS'e karşı)

## 3. Performans / Kararlılık
- MatchHistoryView: DefaultPagination eklendi (önceden tüm kayıtlar tek yanıtta)
- RevealMatchView: profile null-guard (profile'sız kullanıcıda 500 yerine boş alan)

## 4. Admin Panel — Gerçek API Entegrasyonu
- src/services/api.ts: JWT'li fetch istemcisi, 401'de otomatik refresh + retry
- LoginPage: admin girişi (backend olmadan "demo görünüm" seçeneği korunur)
- DashboardPage: /admin/dashboard/ canlı metrikler + dönüşüm hunisi ("● Canlı veri" rozeti)
- UsersPage: /admin/users/ canlı liste, arama, aktif/pasif toggle (PUT /status/)
- Backend kapalıysa sayfalar otomatik mock veriye düşer

## 5. Test Kapsamı: 3 → 25
- tests/test_auth.py: 22 yeni test (register/login/token/OTP/age/reset güvenlik senaryoları dahil)
- config/settings/test.py: SQLite + pgvector yaması, PostgreSQL'siz CI
- CI workflow test adımı config.settings.test kullanacak şekilde güncellendi

## Bilinen TODO'lar (Faz 3)
- SMS sağlayıcı (Netgsm/Twilio) ve e-posta sıfırlama entegrasyonu
- Iyzico ödeme akışı
- Admin panelde Matches/Subscriptions/Reports sayfalarının canlı API'ye bağlanması
  (api.ts'te getMatchStats/getSubscriptionStats/getReports hazır)
