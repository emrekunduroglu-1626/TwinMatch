# Mağaza Gönderim Rehberi — Adım Adım (PC'nde çalıştırılacak)

Ön koşul: Node 20+ kurulu. Tüm komutlar `mobile/` klasöründe çalıştırılır.

## 0. Hesaplar (bir kereye mahsus)
- expo.dev → ücretsiz hesap
- Apple Developer Program → developer.apple.com ($99/yıl, onay 1-2 gün)
- Google Play Console → play.google.com/console ($25 tek seferlik)

## 1. EAS kurulumu
```powershell
npm install -g eas-cli
eas login
eas init          # app.json'daki REPLACE_WITH_EAS_PROJECT_ID otomatik güncellenir
```

## 2. Derleme (iki platform tek komut)
```powershell
eas build --profile production --platform all
```
- **Android**: EAS keystore'u otomatik oluşturur ve saklar → çıktı .aab
- **iOS**: Apple hesabınla giriş ister, sertifika+profili otomatik yönetir → çıktı .ipa
- Derleme EAS bulutunda ~15-25 dk sürer; bittiğinde indirme linki verilir

## 3. Mağazaya gönderim
```powershell
eas submit --platform android --latest   # Play Console → Internal testing track
eas submit --platform ios --latest       # App Store Connect → TestFlight
```
İlk Android submit için Play Console'da uygulamayı bir kez elle oluşturman ve
bir "service account" JSON'u bağlaman istenir — eas submit adım adım yönlendirir.

## 4. Mağaza listeleme içerikleri
- Başlık/açıklama/anahtar kelimeler: `store-listing.md` (TR+EN hazır)
- Gizlilik politikası: `privacy-policy.md` → bir web adresinde yayınla
  (GitHub Pages yeterli), URL'i iki mağazaya da gir
- Veri beyanları: `data-declarations.md` → Google Data Safety ve
  Apple App Privacy formlarına birebir kopyalanabilir
- İnceleme notları + demo hesap: `review-notes.md`

## 5. Zorunlu işaretlemeler (dating kategorisi)
- İçerik derecelendirmesi: **18+ / Mature** (her iki mağaza)
- Google: "Dating" kategorisi + Families Policy dışında beyanı
- Apple: 17+ yaş sınıfı, "Unrestricted Web Access: No"

## 6. Backend canlı olmalı
İnceleme ekipleri uygulamayı gerçekten kullanır. Gönderimden ÖNCE:
- Backend'i HTTPS ile yayına al (api.twinmatch.app — eas.json production
  profili bu adresi kullanıyor)
- `review-notes.md` içindeki demo hesabın çalıştığını doğrula

## Sık takılma noktaları
- iOS "Sign in with Apple" zorunluluğu: e-posta/şifre dışında sosyal login
  EKLERSEN Apple girişi de zorunlu olur. Şu an sadece e-posta → muaf.
- Play "Data safety" formu eksikse yayın engellenir → data-declarations.md
- Ekran görüntüleri: iPhone 6.7" (1290×2796) ve Android telefon seti zorunlu;
  emulatörden `eas build --profile preview` APK'sıyla alınabilir.
