# Android / iOS Mağaza Hazırlığı — Yapılanlar ve Kalan Adımlar

## Bu yamada eklenenler

### app.json — tam mağaza konfigürasyonu
- **iOS**: `bundleIdentifier` (com.twinmatch.app), `buildNumber`, iPhone-only,
  `usesNonExemptEncryption: false` (App Store ihracat beyanını otomatik geçer),
  Info.plist izin metinleri Türkçe: kamera (selfie doğrulama), fotoğraf kitaplığı,
  konum (yakındaki mekanlar), Face ID.
- **Android**: `versionCode`, adaptive icon, yalnızca gereken izinler
  (CAMERA + konum); RECORD_AUDIO ve READ_CONTACTS açıkça engellendi
  (`blockedPermissions`) — kütüphanelerin izin sızdırmasını önler.
  `allowBackup: false` — token/DB'nin cihaz yedeğine kopyalanmasını keser.
- `scheme: "twinmatch"` — deep link altyapısı hazır.

### Assets
- `assets/icon.png` (1024×1024), `assets/adaptive-icon.png`, `assets/splash.png`
  — ikiz halka motifi, marka rengi (#0ea5a4 / #0b1020). Store'a girmeden önce
  tasarımcı versiyonuyla değiştirilebilir; format ve boyutlar hazır.

### eas.json — üç build profili
- `development` (Android emülatör 10.0.2.2 API), `preview` (staging HTTPS, internal dağıtım),
  `production` (autoIncrement + https://api.twinmatch.app).
- iOS ATS gereği production'da HTTPS zorunlu — profil bunu garanti eder.

### Güvenli oturum saklama (kritik zafiyet gideri)
- Önceki durum: token'lar yalnızca bellekte → uygulama kapanınca oturum düşer;
  alternatif olan AsyncStorage ise şifresizdir.
- Yeni: `expo-secure-store` → iOS Keychain / Android Keystore.
  `AFTER_FIRST_UNLOCK` erişim sınıfı, cihaz kilidi açılmadan token okunamaz.
  `allowBackup: false` ile birlikte yedek üzerinden token sızması kapatıldı.
- `App.tsx` açılışta `bootstrap()` çağırır: Keychain'den oturum geri yüklenir,
  token geçersizse sessizce temizlenip login'e düşülür.

## Backend düzeltmeleri
- **Django 6 forward-compat**: `CheckConstraint(check=...)` → `condition=...`
  (safety app model + migration). Django 6'da `check` kwarg kaldırıldı.
- **Venue sorgu optimizasyonu**: haversine döngüsünden önce SQL bounding-box
  ön filtresi. Önceden her istek tüm aktif mekanları RAM'e çekiyordu (O(n));
  artık yalnızca dikdörtgen içindeki adaylar hesaplanıyor.

## Mağaza yayını için kalan operasyonel adımlar
1. `eas login` + `eas init` → gerçek `projectId`'yi app.json'a yaz.
2. Apple Developer (99$/yıl) + Google Play Console (25$ tek seferlik) hesapları.
3. `eas build --profile production --platform all`
4. `eas submit` → TestFlight / Internal Testing.
5. Store listeleme: ekran görüntüleri, gizlilik politikası URL'i,
   veri güvenliği formu (Google) / App Privacy (Apple) — konum, kamera,
   kişisel bilgiler beyan edilmeli.
6. 18+ içerik derecelendirmesi (dating kategorisi) her iki mağazada zorunlu.
