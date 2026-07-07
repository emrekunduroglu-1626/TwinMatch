# Faz 3 Teslimatı — Tamamlanma Raporu

Toplam test: **56/56** (Faz 2 sonunda 35'ti; +21 yeni Faz 3 testi)

## 1. SMS Sağlayıcı Katmanı (`apps/accounts/sms.py`)
- Soyutlama: `SmsBackend` arayüzü, `SMS_PROVIDER` env ile seçim
- `console` (varsayılan): geliştirmede loga yazar
- `netgsm`: Netgsm REST API — `NETGSM_USERCODE`, `NETGSM_PASSWORD`, `NETGSM_HEADER`
  env değişkenleri zorunlu; eksikse açık RuntimeError (sessiz düşüş yok)
- OTP gönderimi `SendOtpView`e bağlandı; SMS teslim edilemezse yanıtta belirtilir
- Twilio vb. eklemek için: SmsBackend'i uygula, `_BACKENDS`e kaydet

## 2. E-posta Şifre Sıfırlama (gerçek akış)
- `POST /auth/password/reset/` → Django `default_token_generator` ile uid+token,
  deep link (`twinmatch://password-reset?uid=..&token=..`) e-postayla gönderilir
- `POST /auth/password/reset/confirm/` → token doğrulama + şifre politikası + değişim
- Token tek kullanımlık (şifre değişince otomatik geçersizleşir — test edildi)
- Enumeration koruması korunur: kayıtlı/kayıtsız e-posta aynı yanıtı alır,
  e-posta gönderim hatası da yanıtı değiştirmez
- E-posta backend: dev=console, test=locmem, prod=SMTP (env: EMAIL_HOST vb.
  SendGrid/SES/Mailgun uyumlu)

## 3. Iyzico Ödeme Akışı (`apps/subscriptions/payments.py`)
- Soyutlama: `PaymentProvider`, `PAYMENT_PROVIDER` env ile seçim (mock | iyzico)
- **Kart verisi API'mize hiç gelmez** — CheckoutForm ile kullanıcı Iyzico
  sayfasında öder; PCI-DSS kapsamı sağlayıcıda kalır
- Akış: `POST /subscriptions/checkout/` → PENDING abonelik + ödeme sayfası URL'i
  → kullanıcı öder → `POST /subscriptions/checkout/callback/` → sağlayıcıdan
  doğrulama → ACTIVE
- Callback idempotent; başkasının token'ıyla aktivasyon 404 (test edildi)
- `IyzicoPaymentProvider`: IYZWSv2 HMAC-SHA256 auth, sandbox/prod env ile
  (`IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL`)
- Kimlik bilgisi eksikse RuntimeError — üretimde yanlışlıkla mock'a düşülmez

## 4. Webhook Güvenlik Düzeltmesi (önemli zafiyet gideri)
- Önceki durum: webhook `IsAuthenticated` idi — Iyzico sunucusu JWT taşımadığı
  için üretimde HİÇ çalışmayacaktı; ayrıca herhangi bir login'li kullanıcı
  sahte webhook atabilirdi
- Yeni: `AllowAny` + gövde üzerinde HMAC-SHA256 imza doğrulaması
  (`X-Iyz-Signature` başlığı). Geçersiz imza → 401 (test edildi)

## 5. Admin Panel — kalan 3 sayfa canlıya bağlandı
- **Matches**: toplam/aktif/açılan/ortalama skor metrikleri, aşama dağılımı,
  en yüksek skorlu 5 eşleşme (`/admin/matches/`)
- **Subscriptions**: aktif/yıllık/aylık gelir, plan ve ödeme durumu dağılımı
  (`/admin/subscriptions/`)
- **Reports**: 6 moderasyon metriği — bekleyen şikayet, doğrulama kuyruğu,
  eksik profil, pasif ikiz, düşük skor (`/admin/reports/`)
- Tümünde "● Canlı / ○ Örnek veri" rozeti; backend kapalıysa zarif düşüş

## Üretim ortam değişkenleri özeti
SMS_PROVIDER=netgsm NETGSM_USERCODE=.. NETGSM_PASSWORD=.. NETGSM_HEADER=..
PAYMENT_PROVIDER=iyzico IYZICO_API_KEY=.. IYZICO_SECRET_KEY=.. IYZICO_BASE_URL=https://api.iyzipay.com
EMAIL_HOST=.. EMAIL_HOST_USER=.. EMAIL_HOST_PASSWORD=.. DEFAULT_FROM_EMAIL=..
FRONTEND_RESET_URL=https://twinmatch.app/password-reset
