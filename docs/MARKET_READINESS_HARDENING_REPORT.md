# TwinMatch Market Readiness Hardening Report

Bu paket, Faz 1 + Faz 2 uygulamasındaki market öncesi zafiyetleri kapatmak için sertleştirilmiş sürümdür.

## Kapatılan kritik maddeler

1. **Mobil gerçek backend bağlantısı**
   - `mobile/src/services/api.ts` eklendi.
   - Auth, gift ve venue store'ları gerçek `/api/v1` endpointlerine bağlandı.
   - Login, register, age confirm, gift settings, address vault, catalog, orders, notifications ve venues akışları backend client üzerinden çalışacak şekilde güçlendirildi.

2. **Freemium kilidi backend seviyesinde uygulandı**
   - Freemium/Basic kullanıcı `can_receive` veya `can_send` ayarını API üzerinden açamaz.
   - Hediye gönderme sadece aktif Plus/Gold veya Premium/Platinum abonelikle mümkün.

3. **`can_send` kontrolü zorunlu hale getirildi**
   - Gönderen kullanıcının aktif hediye aboneliği ve `GiftSetting.can_send=True` olması gerekir.

4. **Adres kasası kabul güvenliği**
   - Alıcı doğrulanmış ve eksiksiz AddressVault olmadan hediyeyi kabul edemez.
   - Zorunlu alanlar: adres, şehir, ilçe, posta kodu, maskeli telefon, `is_verified=True`.

5. **Hediye notu moderasyonu güçlendirildi**
   - Telefon, e-posta, URL, sosyal medya handle, WhatsApp/Telegram/Instagram yönlendirmeleri, posta kodu ve adres benzeri ifadeler maskelenir.
   - Not 500 karakterle sınırlandı.

6. **Katalog ve mekan validation düzeltildi**
   - Hatalı `min_price` / `max_price` artık 400 döner.
   - Hatalı `lat/lng/radius_km` artık tüm listeyi döndürmez, 400 döner.
   - `radius_km` maksimum 25 km ile sınırlandı.

7. **Kullanıcı güvenliği eklendi**
   - `apps.safety` eklendi.
   - Kullanıcı engelleme ve şikayet endpointleri eklendi.
   - Genel kullanıcı bloğu hediye kabul akışını da keser.

8. **Hesap silme / veri dışa aktarma eklendi**
   - `/api/v1/auth/privacy/export/`
   - `/api/v1/auth/account/delete/`

9. **Production settings sertleştirildi**
   - Production'da `DJANGO_SECRET_KEY` zorunlu.
   - CORS `*` kapatıldı.
   - HTTPS, secure cookie, HSTS ve host kısıtları eklendi.

10. **Mobile dependency audit temizlendi**
    - NPM overrides ile mobile audit: 0 vulnerability.

11. **Admin mock fallback kontrol altına alındı**
    - `VITE_ENABLE_MOCK_FALLBACK=true` olmadıkça UAT/production ortamında mock fallback kullanılmaz.

12. **Market compliance dokümanları eklendi**
    - Privacy Policy draft
    - Terms of Use draft
    - Google Play Data Safety draft
    - UAT checklist
    - Store release checklist

## Test sonuçları

| Test | Sonuç |
|---|---|
| Backend testleri | 35 test OK |
| Backend migration check | No changes detected |
| Admin build | Başarılı |
| Admin audit | 0 vulnerability |
| Mobile typecheck | Başarılı |
| Mobile audit | 0 vulnerability |

## Hâlâ gerçek operasyon gerektiren maddeler

Aşağıdakiler kodla hazırlanmıştır, fakat gerçek markete çıkmadan önce hesabın/operasyonun tamamlaması gerekir:

- App Store Connect ve Google Play Console formlarının gerçek şirket bilgileriyle doldurulması.
- Canlı SMS sağlayıcı, ödeme sağlayıcı, Amazon/Çiçeksepeti tedarikçi sözleşmeleri ve Google Maps API anahtarları.
- Gerçek cihazlarda TestFlight / Google Play Internal Testing.
- Hukukçu onaylı Privacy Policy ve Terms metinleri.
- Canlı domain ve SSL ayarları.
- Production ortamında gerçek `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` değerleri.
