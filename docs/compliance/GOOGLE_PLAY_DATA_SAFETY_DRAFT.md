# Google Play Data Safety Draft

Bu taslak Play Console formu doldurulurken kullanılacak teknik veri envanteridir.

## Toplanan veri türleri
- Personal info: e-posta, telefon, yaş onayı.
- Photos and videos: profil fotoğrafları, selfie doğrulama, intro video.
- Location: kullanıcı onayıyla yakın mekan önerileri.
- App activity: eşleşme, hediye, mekan ve bildirim aktiviteleri.
- Messages: dijital ikiz sohbetleri ve hediye notları.
- Financial info: ödeme durumu ve abonelik referansları; kart verisi ödeme sağlayıcıda tutulmalıdır.
- Device identifiers: push notification token.

## Paylaşım
- Tedarikçi/kargo: sadece hediye teslimatı için gerekli teslimat verileri.
- Ödeme sağlayıcı: ödeme ve abonelik işlemleri.
- Harita sağlayıcı: mekan önerileri.
- SMS/e-posta sağlayıcı: doğrulama ve bildirimler.

## Güvenlik
- JWT auth.
- HTTPS production zorunluluğu.
- OTP hash saklama.
- Adres kasası kullanıcılar arasında gösterilmez.
- Şikayet ve engelleme sistemi.

## Veri silme
Uygulama içinde hesap kapatma endpoint'i vardır: `/api/v1/auth/account/delete/`.
