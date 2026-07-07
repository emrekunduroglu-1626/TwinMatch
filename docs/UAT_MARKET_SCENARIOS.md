# TwinMatch Market UAT Senaryoları

## Auth ve yaş doğrulama
- Kullanıcı kayıt olur, JWT token alır.
- Kullanıcı giriş yapar.
- Yanlış şifre ve bilinmeyen e-posta aynı hata mesajını döndürür.
- 18+ onayı olmadan setup akışı tamamlanmaz.
- Hesap silme isteği şifre doğrulaması ister.

## Freemium kilidi
- Freemium kullanıcı hediye ayarlarını açamaz.
- Freemium kullanıcı hediye gönderemez.
- Gold kullanıcı Gold ürün gönderebilir.
- Gold kullanıcı Platinum ürün gönderemez.
- Platinum kullanıcı tüm uygun ürünleri gönderebilir.

## Anonim hediye
- Gönderen `can_send=false` ise hediye gönderemez.
- Alıcı `can_receive=false` ise hediye alamaz.
- Alıcı göndereni engellediyse sipariş oluşmaz.
- Hediye notunda e-posta, telefon, sosyal kullanıcı adı ve adres maskelenir.
- Gönderen alıcının adresini, telefonunu, kurye konumunu veya tam teslimat detayını görmez.
- Alıcı doğrulanmış adres kasası olmadan hediyeyi kabul edemez.

## Mekan
- Geçersiz lat/lng 400 döndürür.
- 25 km üstü radius 400 döndürür.
- Sponsorlu mekanlar açıkça sponsorlu olarak işaretlenir.
- Safe Date Spot listesi sadece güvenlik skoru yeterli mekanları döndürür.

## Moderasyon ve güvenlik
- Kullanıcı başka kullanıcıyı engelleyebilir.
- Kullanıcı profil/mesaj/hediye notu için şikayet oluşturabilir.
- Admin dashboard bekleyen şikayetleri sayar.

## Market öncesi gerçek cihaz testi
- iOS TestFlight: iPhone 13/14/15/16 cihaz ailesi.
- Android Internal Testing: düşük/orta/yüksek segment cihazlar.
- Push notification, deep link, login persistence ve network timeout testleri.
