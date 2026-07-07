# TwinMatch — Kapsamlı Teknik Plan

## 1. Proje Dizin Yapısı

### Backend (Django Monolith)
```
twinmatch/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   │   ├── __init__.py
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   ├── staging.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   ├── wsgi.py
│   │   └── asgi.py
│   ├── apps/
│   │   ├── accounts/        # User modeli, JWT auth, telefon doğrulama, 18+ onay
│   │   ├── profiles/        # Profil CRUD, fotoğraf/video yükleme
│   │   ├── verification/    # Selfie doğrulama, AWS Rekognition
│   │   ├── digital_twin/    # Dijital ikiz oluşturma, anket, kişilik analizi
│   │   ├── matching/        # 3 aşamalı eşleme, uyumluluk skoru
│   │   ├── chat/            # Dijital ikiz sohbetleri (AI-to-AI), WebSocket
│   │   ├── discovery/       # Keşfet sayfası, profil kartları
│   │   ├── calendar_app/    # Takvim, uygun zaman eşleştirme
│   │   ├── subscriptions/   # Freemium/VIP/Premium, İyzico
│   │   ├── notifications/   # Push (FCM), email, in-app
│   │   └── reports/         # Uyumluluk raporu, profil analizi
│   └── common/
│       ├── models.py        # BaseModel (created_at, updated_at)
│       ├── permissions.py
│       ├── pagination.py
│       └── utils.py
├── mobile/                  # React Native (Android önce)
│   ├── src/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/        # API calls
│   │   ├── store/           # Zustand state
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── assets/
│   ├── android/
│   └── package.json
├── admin-panel/             # React admin panel
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── store/
│   └── package.json
├── infra/
│   └── terraform/
│       ├── modules/
│       └── environments/
├── docker-compose.yml
├── .github/workflows/
└── README.md
```

---

## 2. Django API Endpoint Tasarımı

Tüm endpointler `/api/v1/` prefix'i altında.

### accounts
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /api/v1/auth/register/ | Kayıt (ad, email, şifre) |
| POST | /api/v1/auth/login/ | Giriş (JWT access + refresh token) |
| POST | /api/v1/auth/token/refresh/ | Token yenileme |
| POST | /api/v1/auth/logout/ | Çıkış |
| POST | /api/v1/auth/phone/send-otp/ | OTP gönder |
| POST | /api/v1/auth/phone/verify-otp/ | OTP doğrula |
| POST | /api/v1/auth/age-confirm/ | 18+ onay |
| POST | /api/v1/auth/password/reset/ | Şifre sıfırlama |
| GET | /api/v1/auth/me/ | Mevcut kullanıcı bilgisi |

### profiles
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/v1/profiles/me/ | Kendi profili |
| PUT | /api/v1/profiles/me/ | Profil güncelle (boy, eğitim, şehir, meslek, burç) |
| POST | /api/v1/profiles/me/photos/ | Fotoğraf yükle (min 3) |
| DELETE | /api/v1/profiles/me/photos/{id}/ | Fotoğraf sil |
| POST | /api/v1/profiles/me/video/ | Video yükle (30sn) |
| DELETE | /api/v1/profiles/me/video/ | Video sil |
| GET | /api/v1/profiles/{id}/ | Başka kullanıcının profili |

### verification
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | /api/v1/verification/selfie/ | Selfie yükle ve doğrula (AWS Rekognition) |
| GET | /api/v1/verification/status/ | Doğrulama durumu |

### digital_twin
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/v1/digital-twin/survey/questions/ | Anket soruları (20 soru) |
| POST | /api/v1/digital-twin/survey/answers/ | Anket cevapları kaydet |
| POST | /api/v1/digital-twin/partner-preferences/ | Partner tercihleri |
| POST | /api/v1/digital-twin/communication-style/ | İletişim tarzı seç |
| POST | /api/v1/digital-twin/create/ | Dijital ikizi oluştur |
| GET | /api/v1/digital-twin/status/ | Dijital ikiz durumu |

### matching
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/v1/matching/candidates/ | Aday listesi |
| POST | /api/v1/matching/initiate/{user_id}/ | Eşleme başlat |
| GET | /api/v1/matching/process/{match_id}/ | Eşleme süreci durumu (3 aşama) |
| GET | /api/v1/matching/report/{match_id}/ | Uyumluluk raporu |
| POST | /api/v1/matching/reveal/{match_id}/ | Gerçek kimlik açılımı |
| GET | /api/v1/matching/history/ | Geçmiş eşlemeler |

### chat
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/v1/chat/conversations/ | Dijital ikiz konuşmaları |
| GET | /api/v1/chat/conversations/{id}/messages/ | Konuşma mesajları |
| WS | /api/v1/ws/chat/{conversation_id}/ | Canlı sohbet (WebSocket) |

### discovery
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/v1/discovery/feed/ | Keşfet akışı (profil kartları) |
| GET | /api/v1/discovery/profile/{id}/ | Profil detay |
| POST | /api/v1/discovery/flirt/{user_id}/ | Premium: dijital ikizle flört başlat |

### calendar_app
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/v1/calendar/availability/ | Uygun zamanlar |
| POST | /api/v1/calendar/availability/ | Uygun zaman ekle |
| POST | /api/v1/calendar/schedule/{match_id}/ | Görüşme planla |
| GET | /api/v1/calendar/upcoming/ | Yaklaşan görüşmeler |

### subscriptions
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/v1/subscriptions/plans/ | Paketler (Freemium/VIP/Premium) |
| POST | /api/v1/subscriptions/checkout/ | İyzico ödeme başlat |
| POST | /api/v1/subscriptions/webhook/iyzico/ | İyzico callback |
| GET | /api/v1/subscriptions/current/ | Mevcut abonelik |
| POST | /api/v1/subscriptions/cancel/ | Abonelik iptal |

### notifications
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/v1/notifications/ | Bildirim listesi |
| PUT | /api/v1/notifications/{id}/read/ | Okundu işaretle |
| PUT | /api/v1/notifications/settings/ | Bildirim tercihleri |
| POST | /api/v1/notifications/device/ | FCM token kaydet |

### admin (reports)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | /api/v1/admin/dashboard/ | Genel istatistikler |
| GET | /api/v1/admin/users/ | Kullanıcı listesi |
| GET | /api/v1/admin/users/{id}/ | Kullanıcı detay |
| PUT | /api/v1/admin/users/{id}/status/ | Kullanıcı durumu değiştir |
| GET | /api/v1/admin/matches/ | Eşleme istatistikleri |
| GET | /api/v1/admin/subscriptions/ | Abonelik raporu |
| GET | /api/v1/admin/reports/ | Şikayet raporları |

---

## 3. Veritabanı Şeması (Django Modelleri)

### accounts.User
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| email | EmailField (unique) | E-posta |
| phone | CharField (unique, nullable) | Telefon |
| password | CharField | Hashlenmiş şifre |
| is_phone_verified | BooleanField | Telefon doğrulandı mı |
| is_age_confirmed | BooleanField | 18+ onay |
| is_active | BooleanField | Aktif mi |
| date_joined | DateTimeField | Kayıt tarihi |
| last_login | DateTimeField | Son giriş |

### profiles.Profile
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user | OneToOneField(User) | Kullanıcı |
| display_name | CharField | Görünen ad |
| birth_date | DateField | Doğum tarihi |
| gender | CharField (choices) | Cinsiyet |
| height | IntegerField | Boy (cm) |
| education | CharField | Eğitim |
| city | CharField | Şehir |
| occupation | CharField | Meslek |
| zodiac_sign | CharField | Burç |
| bio | TextField | Hakkında |
| smoking | CharField (choices) | Sigara kullanımı |
| wants_children | CharField (choices) | Çocuk isteği |
| marital_status | CharField | Medeni durum |
| embedding | VectorField(1536) | pgvector profil embedding |
| created_at | DateTimeField | Oluşturulma |
| updated_at | DateTimeField | Güncelleme |

### profiles.Photo
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| profile | ForeignKey(Profile) | Profil |
| s3_key | CharField | S3 dosya yolu |
| cdn_url | URLField | CDN URL |
| is_primary | BooleanField | Ana fotoğraf mı |
| sort_order | IntegerField | Sıralama |
| created_at | DateTimeField | Yüklenme tarihi |

### profiles.Video
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| profile | OneToOneField(Profile) | Profil |
| s3_key | CharField | S3 dosya yolu |
| cdn_url | URLField | CDN URL |
| duration | IntegerField | Süre (saniye, max 30) |
| created_at | DateTimeField | Yüklenme tarihi |

### verification.VerificationRecord
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user | OneToOneField(User) | Kullanıcı |
| selfie_s3_key | CharField | Selfie S3 yolu |
| status | CharField (choices) | pending/approved/rejected |
| rekognition_response | JSONField | AWS Rekognition sonucu |
| verified_at | DateTimeField (nullable) | Doğrulama zamanı |
| created_at | DateTimeField | Oluşturulma |

### digital_twin.SurveyAnswer
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user | ForeignKey(User) | Kullanıcı |
| question_id | IntegerField | Soru numarası |
| answer | JSONField | Cevap verisi |
| created_at | DateTimeField | Cevap tarihi |

### digital_twin.PartnerPreference
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user | OneToOneField(User) | Kullanıcı |
| age_min | IntegerField | Min yaş |
| age_max | IntegerField | Max yaş |
| preferred_city | CharField | Tercih edilen şehir |
| preferred_education | CharField | Tercih edilen eğitim |
| smoking_preference | CharField | Sigara tercihi |
| children_preference | CharField | Çocuk tercihi |
| created_at | DateTimeField | Oluşturulma |

### digital_twin.DigitalTwin
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user | OneToOneField(User) | Kullanıcı |
| system_prompt | TextField | OpenAI system prompt |
| communication_style | CharField | flirtatious/fun/romantic/distant/professional |
| personality_summary | JSONField | Kişilik özeti |
| is_active | BooleanField | Aktif mi |
| created_at | DateTimeField | Oluşturulma |
| updated_at | DateTimeField | Güncelleme |

### matching.Match
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user_a | ForeignKey(User) | Kullanıcı A |
| user_b | ForeignKey(User) | Kullanıcı B |
| stage | IntegerField (1-3) | Mevcut aşama |
| stage_1_score | FloatField (nullable) | Aşama 1 skoru |
| stage_2_score | FloatField (nullable) | Aşama 2 skoru |
| stage_3_score | FloatField (nullable) | Aşama 3 skoru |
| overall_score | FloatField (nullable) | Genel skor |
| status | CharField | in_progress/completed/failed/revealed |
| created_at | DateTimeField | Başlangıç |
| updated_at | DateTimeField | Güncelleme |

### matching.CompatibilityReport
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| match | OneToOneField(Match) | Eşleme |
| communication_score | FloatField | İletişim uyumu |
| character_score | FloatField | Karakter uyumu |
| lifestyle_score | FloatField | Yaşam tarzı uyumu |
| values_score | FloatField | Değer uyumu |
| career_score | FloatField | Kariyer uyumu |
| hobbies_score | FloatField | Hobi uyumu |
| detailed_analysis | JSONField | Detaylı analiz |
| created_at | DateTimeField | Oluşturulma |

### chat.Conversation
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| match | ForeignKey(Match) | Eşleme |
| twin_a | ForeignKey(DigitalTwin) | User A'nın ikizi |
| twin_b | ForeignKey(DigitalTwin) | User B'nin ikizi |
| status | CharField | active/paused/completed |
| total_messages | IntegerField | Toplam mesaj sayısı |
| created_at | DateTimeField | Başlangıç |

### chat.Message
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| conversation | ForeignKey(Conversation) | Konuşma |
| sender_twin | ForeignKey(DigitalTwin) | Gönderen ikiz |
| content | TextField | Mesaj içeriği |
| message_type | CharField | text/system |
| created_at | DateTimeField | Gönderim zamanı |

### discovery.FlirtRequest
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| requester | ForeignKey(User) | İsteyen |
| target | ForeignKey(User) | Hedef |
| status | CharField | pending/accepted/rejected |
| created_at | DateTimeField | İstek zamanı |

### subscriptions.Subscription
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user | ForeignKey(User) | Kullanıcı |
| plan | CharField | freemium/vip/premium |
| price_monthly | DecimalField | Aylık fiyat (TL) |
| price_yearly | DecimalField (nullable) | Yıllık fiyat |
| is_annual | BooleanField | Yıllık mı |
| iyzico_subscription_ref | CharField | İyzico referansı |
| status | CharField | active/cancelled/expired |
| started_at | DateTimeField | Başlangıç |
| expires_at | DateTimeField | Bitiş |
| created_at | DateTimeField | Oluşturulma |

### subscriptions.Payment
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user | ForeignKey(User) | Kullanıcı |
| subscription | ForeignKey(Subscription, nullable) | Abonelik |
| amount | DecimalField | Tutar |
| currency | CharField | TRY |
| iyzico_payment_id | CharField | İyzico ödeme ID |
| status | CharField | pending/completed/failed/refunded |
| created_at | DateTimeField | İşlem zamanı |

### notifications.Notification
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user | ForeignKey(User) | Kullanıcı |
| title | CharField | Başlık |
| body | TextField | İçerik |
| notification_type | CharField | match/message/system/subscription |
| is_read | BooleanField | Okundu mu |
| data | JSONField (nullable) | Ek veri |
| created_at | DateTimeField | Oluşturulma |

### notifications.DeviceToken
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user | ForeignKey(User) | Kullanıcı |
| fcm_token | CharField | FCM token |
| device_type | CharField | android/ios |
| is_active | BooleanField | Aktif mi |
| created_at | DateTimeField | Kayıt tarihi |

### calendar_app.Availability
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| user | ForeignKey(User) | Kullanıcı |
| date | DateField | Tarih |
| start_time | TimeField | Başlangıç saati |
| end_time | TimeField | Bitiş saati |
| created_at | DateTimeField | Oluşturulma |

### calendar_app.ScheduledMeeting
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | UUIDField (PK) | Benzersiz ID |
| match | ForeignKey(Match) | Eşleme |
| date | DateField | Tarih |
| start_time | TimeField | Başlangıç |
| end_time | TimeField | Bitiş |
| venue_name | CharField (nullable) | Mekan adı |
| status | CharField | scheduled/completed/cancelled |
| created_at | DateTimeField | Oluşturulma |

---

## 4. AI Dijital İkiz Mimarisi

### Dijital İkiz Oluşturma Akışı
1. Kullanıcı 20 soruluk anketi doldurur (ilişki öncelikleri: sadakat, güven, eğlence, kariyer, tutku vb.)
2. Partner tercihlerini belirler (yaş aralığı, şehir, eğitim, sigara, çocuk isteği)
3. İletişim tarzı seçer: flörtöz, eğlenceli, romantik, mesafeli, profesyonel
4. Backend bu verileri analiz ederek bir OpenAI system prompt oluşturur
5. System prompt kullanıcının kişiliğini, değerlerini, iletişim tarzını ve tercihlerini yansıtır

### System Prompt Oluşturma
```python
def generate_system_prompt(user, survey_answers, preferences, style):
    personality_traits = analyze_survey(survey_answers)
    return f"""
    Sen {user.display_name} adlı kişinin dijital ikizisin.
    Yaş: {calculate_age(user.profile.birth_date)}
    Şehir: {user.profile.city}
    Meslek: {user.profile.occupation}
    
    Kişilik Özelliklerin:
    {format_traits(personality_traits)}
    
    İletişim Tarzı: {style}
    - flörtöz: İltifat eder, espri yapar, hafif flört eder
    - eğlenceli: Samimi, enerjik, pozitif
    - romantik: Duygusal, derin, anlamlı
    - mesafeli: Ağır, ölçülü, gizemli
    - profesyonel: Ciddi, doğrudan, net
    
    İlişki Önceliklerin:
    {format_priorities(survey_answers)}
    
    Görev: Karşı tarafın dijital ikiziyle doğal ve samimi bir sohbet yap.
    Amaç: İki kişi arasındaki uyumluluğu keşfetmek.
    Asla yapay veya robot gibi konuşma.
    Türkçe konuş.
    """
```

### Çok Ajanlı Sohbet Sistemi (AI-to-AI)
1. Eşleme başladığında iki kullanıcının dijital ikizleri arasında bir konuşma başlatılır
2. Her mesaj OpenAI Chat Completions API ile üretilir
3. Her ikiz kendi system prompt'u ile çalışır
4. Konuşma tur bazlı ilerler (her ikiz sırayla mesaj gönderir)
5. Konuşma 20-30 mesaj arasında otomatik sonlanır
6. Tüm mesajlar veritabanına kaydedilir

```python
import openai
from asgiref.sync import async_to_sync

async def run_twin_conversation(twin_a, twin_b, conversation):
    """İki dijital ikiz arasında otomatik sohbet başlatır."""
    messages_a = [{"role": "system", "content": twin_a.system_prompt}]
    messages_b = [{"role": "system", "content": twin_b.system_prompt}]
    
    client = openai.AsyncOpenAI()
    
    # İlk mesajı twin_a başlatır
    messages_a.append({"role": "user", "content": "Merhaba! Tanışmak isterim."})
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages_a,
        max_tokens=200
    )
    opener = response.choices[0].message.content
    messages_a.append({"role": "assistant", "content": opener})
    save_message(conversation, twin_a, opener)
    
    for turn in range(15):  # 15 tur = ~30 mesaj
        # Twin B cevap verir
        messages_b.append({"role": "user", "content": opener})
        resp_b = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages_b,
            max_tokens=200
        )
        reply_b = resp_b.choices[0].message.content
        messages_b.append({"role": "assistant", "content": reply_b})
        save_message(conversation, twin_b, reply_b)
        
        # Twin A cevap verir
        messages_a.append({"role": "user", "content": reply_b})
        resp_a = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages_a,
            max_tokens=200
        )
        reply_a = resp_a.choices[0].message.content
        messages_a.append({"role": "assistant", "content": reply_a})
        save_message(conversation, twin_a, reply_a)
        
        opener = reply_a
    
    # Konuşma bitti, uyumluluk skoru hesapla
    await calculate_compatibility(conversation)
```

### 3 Aşamalı Eşleme Sistemi

**Aşama 1 — Temel Profil Değerlendirmesi:**
- Profil bilgileri karşılaştırılır (yaş uyumu, şehir, eğitim)
- Embedding benzerlik skoru hesaplanır (pgvector cosine similarity)
- Fotoğraf ve video mevcutluk kontrolü
- Minimum eşik: %60

**Aşama 2 — Karakter ve Yaşam Tarzı Uyumu:**
- Dijital ikizler 20-30 mesajlık sohbet yapar
- Sohbet analiz edilerek kategori bazlı skorlar çıkarılır
- Kategoriler: iletişim (%20), karakter (%20), sosyallik (%15), değerler (%15), kariyer (%15), hobi (%15)
- Minimum eşik: %70

**Aşama 3 — Kullanıcı Kararı:**
- Kullanıcıya uyumluluk raporu sunulur
- Kullanıcının belirlediği minimum uyum skoru kontrol edilir (varsayılan %85)
- Skor aşılırsa gerçek görüşme planlamaya geçiş
- Her iki kullanıcının da onaylaması gerekir

### Uyumluluk Skoru Hesaplama
```python
async def calculate_compatibility(conversation):
    """Dijital ikiz sohbetini analiz ederek uyumluluk skoru hesaplar."""
    messages = Message.objects.filter(conversation=conversation).order_by("created_at")
    full_chat = "\n".join([
        f"{'İkiz A' if m.sender_twin == conversation.twin_a else 'İkiz B'}: {m.content}"
        for m in messages
    ])
    
    analysis_prompt = """
    Aşağıdaki iki dijital ikiz arasındaki sohbeti analiz et.
    Her kategori için 0-100 arası bir skor ver:
    1. İletişim uyumu (communication)
    2. Karakter uyumu (character)
    3. Sosyallik uyumu (lifestyle)
    4. Değer uyumu (values)
    5. Kariyer uyumu (career)
    6. Hobi uyumu (hobbies)
    
    JSON formatında dön:
    {"communication": 85, "character": 90, "lifestyle": 75, "values": 88, "career": 70, "hobbies": 82}
    """
    
    client = openai.AsyncOpenAI()
    result = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": analysis_prompt},
            {"role": "user", "content": full_chat}
        ],
        response_format={"type": "json_object"}
    )
    
    scores = json.loads(result.choices[0].message.content)
    weights = {
        "communication": 0.20, "character": 0.20, "lifestyle": 0.15,
        "values": 0.15, "career": 0.15, "hobbies": 0.15
    }
    overall = sum(scores[k] * weights[k] for k in weights)
    
    CompatibilityReport.objects.create(
        match=conversation.match,
        communication_score=scores["communication"],
        character_score=scores["character"],
        lifestyle_score=scores["lifestyle"],
        values_score=scores["values"],
        career_score=scores["career"],
        hobbies_score=scores["hobbies"],
        detailed_analysis=scores,
    )
    
    match = conversation.match
    match.stage_2_score = overall
    match.overall_score = overall
    if overall >= 70:
        match.stage = 3
    else:
        match.status = "failed"
    match.save()
```

### Embedding ve Vektör Arama (pgvector)
```python
# Profil embedding oluşturma
async def create_profile_embedding(profile):
    text = f"""
    {profile.bio}
    İlgi alanları: {', '.join(profile.interests or [])}
    Meslek: {profile.occupation}
    Eğitim: {profile.education}
    Şehir: {profile.city}
    """
    client = openai.AsyncOpenAI()
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    profile.embedding = response.data[0].embedding
    profile.save()
```

```sql
-- Keşfet sayfası: En uyumlu profilleri bul (pgvector)
SELECT p.*, 1 - (p.embedding <=> %(query_embedding)s) AS similarity
FROM profiles_profile p
JOIN accounts_user u ON p.user_id = u.id
WHERE u.is_active = true
  AND p.gender = %(seeking)s
  AND p.birth_date BETWEEN %(min_date)s AND %(max_date)s
  AND p.city = %(city)s
  AND p.id != %(current_profile_id)s
ORDER BY p.embedding <=> %(query_embedding)s
LIMIT 20;
```

---

## 5. React Native Modül Yapısı

### Navigation Yapısı
```
AppNavigator (Stack)
├── AuthStack (Stack)
│   ├── SplashScreen (1)
│   ├── OnboardingScreen (2-4) — 3 sayfa, horizontal pager
│   ├── RegisterScreen (5)
│   ├── OTPVerificationScreen (6)
│   ├── AgeConfirmScreen (7)
│   └── LoginScreen
├── SetupStack (Stack)
│   ├── SelfieVerificationScreen (8)
│   ├── ProfileInfoScreen (9)
│   ├── PhotoUploadScreen (10)
│   ├── VideoUploadScreen (11)
│   ├── DigitalTwinSurveyScreen (12)
│   ├── PartnerPreferencesScreen (13)
│   ├── CommunicationStyleScreen (14)
│   └── DigitalTwinCreationScreen (15)
├── MainTab (Bottom Tab)
│   ├── DiscoveryStack (Stack)
│   │   ├── DiscoveryFeedScreen (16)
│   │   └── ProfileDetailScreen (17)
│   ├── ChatStack (Stack)
│   │   ├── ConversationListScreen (26)
│   │   └── DigitalTwinChatScreen (18)
│   ├── MatchStack (Stack)
│   │   ├── MatchProcessScreen (19)
│   │   ├── CompatibilityReportScreen (20)
│   │   ├── IdentityRevealScreen (21)
│   │   ├── CalendarScreen (22)
│   │   └── SuccessScreen (30)
│   ├── NotificationsScreen (27)
│   └── SettingsStack (Stack)
│       ├── SettingsScreen (28)
│       └── SubscriptionScreen (25)
```

### State Management (Zustand)
```
stores/
├── authStore.ts        — user, tokens, isAuthenticated
├── profileStore.ts     — profile data, photos, video
├── twinStore.ts        — digital twin status, survey progress
├── matchStore.ts       — matches, current match process
├── chatStore.ts        — conversations, messages
├── discoveryStore.ts   — feed profiles, filters
└── subscriptionStore.ts — current plan, features
```

### API Service Layer
```
services/
├── api.ts              — Axios instance, interceptors, token refresh
├── authService.ts      — login, register, OTP
├── profileService.ts   — profile CRUD, photos, video
├── twinService.ts      — survey, preferences, twin creation
├── matchService.ts     — candidates, matching process
├── chatService.ts      — conversations, WebSocket connection
├── discoveryService.ts — feed, profile detail
├── subscriptionService.ts — plans, checkout
└── notificationService.ts — FCM setup, notification list
```

### Tasarım Sistemi
| Öğe | Değer |
|-----|-------|
| Arka plan | #000000 (Siyah) |
| Accent renk | #FF6600 (Turuncu) |
| Metin | #FFFFFF (Beyaz) |
| İkincil metin | #999999 (Gri) |
| Kart arka plan | #1A1A1A (Koyu gri) |
| Primary buton | Turuncu dolgulu, beyaz metin |
| Secondary buton | Şeffaf çerçeveli |
| Köşe yuvarlaklığı | 12px (kartlar), 25px (butonlar) |
| Font | Bold başlıklar, Regular içerik |

---

## 6. AWS Altyapısı

### Mimari
```
Route 53 (DNS: twinmatch.app)
    └── CloudFront (CDN + WAF)
        ├── S3 (processed media — cdn.twinmatch.app)
        └── ALB (Application Load Balancer — api.twinmatch.app)
            └── ECS Fargate Cluster (Private Subnet)
                └── Django Service
                    ├── gunicorn (HTTP API)
                    ├── daphne/uvicorn (WebSocket — ASGI)
                    └── celery worker (async tasks)
                        ├── RDS PostgreSQL 16 + pgvector (Data Subnet)
                        ├── ElastiCache Redis (Data Subnet)
                        └── S3 (raw media uploads)
```

### VPC Tasarımı (MVP — Tek AZ yeterli, production'da Multi-AZ)
| Subnet | CIDR | İçerik |
|--------|------|--------|
| Public | 10.0.1.0/24 | ALB, NAT Gateway |
| Private | 10.0.11.0/24 | ECS Fargate tasks |
| Data | 10.0.21.0/24 | RDS, ElastiCache |

### ECS Fargate — Django Servisi
| Parametre | Değer |
|-----------|-------|
| CPU | 1024 (1 vCPU) |
| Memory | 2048 MB |
| Min tasks | 2 |
| Max tasks | 10 |
| Auto-scaling | CPU > %70 |
| Health check | GET /api/v1/health/ |
| Container | gunicorn + daphne + celery (ayrı task definitions) |

### RDS PostgreSQL
| Parametre | MVP | Production |
|-----------|-----|------------|
| Instance | db.t3.medium | db.r6g.large |
| AZ | Single-AZ | Multi-AZ |
| Storage | 50 GB gp3 | 200 GB gp3, auto-scaling |
| Extensions | pgvector, pg_trgm | + PostGIS |
| Backup | 7 gün snapshot | 14 gün + cross-region |

### ElastiCache Redis
| Parametre | Değer |
|-----------|-------|
| Instance | cache.t3.micro (MVP) |
| Kullanım | Django cache, Celery broker, session, rate limiting |

### S3 Buckets
| Bucket | Amaç | Erişim |
|--------|-------|--------|
| twinmatch-media-raw | Ham yüklemeler | Private |
| twinmatch-media-processed | İşlenmiş görseller | CloudFront origin |
| twinmatch-static | Django static dosyaları | Public |
| twinmatch-terraform-state | Terraform state | Private |

### Diğer AWS Servisleri
| Servis | Kullanım |
|--------|----------|
| SES | Email (hoşgeldin, eşleme, şifre sıfırlama) |
| SQS | Celery task queue |
| Secrets Manager | DB şifreleri, API anahtarları |
| CloudWatch | Log grupları, metrikler, alarmlar |
| KMS | Veri şifreleme anahtarları |
| WAF | CloudFront + ALB üzerinde güvenlik kuralları |
| Rekognition | Yüz doğrulama |

### Tahmini Aylık Maliyet (MVP)
| Servis | Maliyet |
|--------|---------|
| ECS Fargate (3 task: api + ws + celery) | ~$70 |
| RDS t3.medium Single-AZ | ~$60 |
| ElastiCache t3.micro | ~$15 |
| ALB | ~$20 |
| S3 + CloudFront | ~$15 |
| NAT Gateway | ~$35 |
| SES, SQS, Secrets Manager, CloudWatch | ~$15 |
| **Toplam** | **~$230/ay** |

### Terraform Modül Yapısı
```
infra/terraform/
├── modules/
│   ├── vpc/              # VPC, subnet, NAT GW, Security Groups
│   ├── ecs/              # ECS cluster, service, task definition
│   ├── rds/              # RDS PostgreSQL + pgvector
│   ├── elasticache/      # Redis
│   ├── s3/               # S3 buckets + policies
│   ├── cloudfront/       # CloudFront distribution
│   ├── alb/              # ALB + target groups + listeners
│   ├── waf/              # WAF web ACL
│   ├── sqs/              # SQS queues
│   ├── ses/              # SES domain
│   ├── iam/              # IAM roles + policies
│   └── secrets/          # Secrets Manager
├── environments/
│   ├── staging/
│   │   ├── main.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       └── terraform.tfvars
└── backend.tf            # S3 remote state + DynamoDB lock
```

---

## 7. 3. Parti Entegrasyonlar

### İyzico (Ödeme)
- **API:** İyzico API v2
- **Abonelik:** Recurring payment ile aylık/yıllık ödeme
- **Güvenlik:** 3D Secure zorunlu
- **Webhook:** Ödeme durumu takibi (POST /api/v1/subscriptions/webhook/iyzico/)
- **Geliştirme:** Sandbox (test) modu ile
- **Fiyatlandırma:**
  - Freemium: 0 TL/ay
  - VIP: 499 TL/ay | 4.999 TL/yıl
  - Premium: 999 TL/ay | 7.999 TL/yıl

### OpenAI API
- **GPT-4o:** Dijital ikiz sohbet, uyumluluk analizi
- **text-embedding-3-small:** Profil embedding (1536 boyut)
- **Moderation API:** İçerik filtresi (uygunsuz mesaj tespiti)
- **Tahmini maliyet:** $50-200/ay (kullanım bazlı)
- **Rate limiting:** Celery task queue ile kontrollü istek gönderimi

### Firebase Cloud Messaging (FCM)
- **Platform:** Android push notification (iOS sonraki faz)
- **Token yönetimi:** Device token kayıt/güncelleme/silme
- **Bildirim tipleri:** Yeni eşleme, yeni mesaj, abonelik hatırlatma, sistem duyurusu
- **Django SDK:** firebase-admin paketi ile sunucu taraflı gönderim

### AWS Rekognition
- **Yüz doğrulama:** DetectFaces + CompareFaces API
- **Liveness:** Sahte fotoğraf engelleme
- **Akış:** Selfie yükle → S3'e kaydet → Rekognition analiz → profil fotoğrafıyla karşılaştır → sonuç kaydet
- **KVKK:** Doğrulama sonrası ham selfie S3'ten silinir

---

## 8. Güvenlik

### Authentication
- **Kütüphane:** Django SimpleJWT
- **Access token:** 15 dakika ömür, RS256 imza
- **Refresh token:** 30 gün, Redis'te saklanır, rotation ile
- **Rate limiting:** django-ratelimit (5 auth denemesi/dakika/IP)

### KVKK/GDPR Uyumu
- Açık rıza metni ve onay mekanizması (kayıt sırasında)
- Veri işleme amaçlarının belirtilmesi
- Kullanıcı veri silme hakkı: `DELETE /api/v1/auth/me/delete/`
- Veri dışa aktarma hakkı: `GET /api/v1/auth/me/export/`
- Selfie verilerinin doğrulama sonrası silinmesi
- Veri işleme kayıtları (audit log)
- Çerez politikası (web admin panel için)

### Veri Şifreleme
| Katman | Yöntem |
|--------|--------|
| At rest | RDS: KMS şifreleme, S3: SSE-S3 |
| In transit | TLS 1.3 (HTTPS zorunlu) |
| Hassas veriler | Telefon, email alanları uygulama katmanında şifrelenmiş |

### Diğer Güvenlik Önlemleri
| Önlem | Yöntem |
|-------|--------|
| Input validation | Django serializers + custom validators |
| SQL injection | Django ORM (parameterized queries) |
| XSS | Django template auto-escaping |
| CSRF | Django CSRF middleware |
| CORS | django-cors-headers ile kontrollü erişim |
| File upload | Tip, boyut, içerik kontrolü (max 10MB foto, 50MB video) |
| WAF | AWS WAF — Core Rule Set, rate limiting |
| API throttling | DRF throttle classes (anon: 100/saat, auth: 1000/saat) |

---

## 9. Sprint Bazlı İş Kırılımı (Faz 1 — MVP, 8-10 Hafta)

### Sprint 1-2 (Hafta 1-4): Backend Altyapı + Auth + Kayıt
- [ ] Django projesi oluştur, apps/ yapısını kur
- [ ] PostgreSQL + pgvector + Redis Docker Compose ortamı
- [ ] accounts app: User modeli, JWT auth (SimpleJWT), register, login
- [ ] Telefon doğrulama (OTP): Twilio veya Netgsm entegrasyonu
- [ ] 18+ onay mekanizması
- [ ] AWS: Terraform ile VPC, ECS, RDS, ElastiCache kurulumu
- [ ] CI/CD: GitHub Actions (lint, test, build, deploy)
- [ ] React Native proje iskeleti + navigation yapısı
- [ ] Auth ekranları: Splash (1), Onboarding (2-4), Kayıt (5), OTP (6), 18+ Onay (7)

### Sprint 3-4 (Hafta 5-8): Profil + Dijital İkiz
- [ ] profiles app: Profil CRUD, fotoğraf/video yükleme (S3 pre-signed URL)
- [ ] verification app: Selfie doğrulama (AWS Rekognition)
- [ ] digital_twin app: 20 soruluk anket, partner tercihleri, iletişim tarzı seçimi
- [ ] Dijital ikiz system prompt oluşturma (OpenAI GPT-4o)
- [ ] Profil embedding oluşturma (text-embedding-3-small + pgvector)
- [ ] React Native: Selfie (8), Profil bilgileri (9), Fotoğraf (10), Video (11)
- [ ] React Native: Dijital ikiz anketi (12), Partner tercihleri (13), İletişim tarzı (14), İkiz oluşturma (15)

### Sprint 5-6 (Hafta 9-12): AI Eşleme + Keşfet + Sohbet
- [ ] matching app: pgvector ile benzer profil arama, 3 aşamalı eşleme sistemi
- [ ] chat app: Dijital ikiz sohbet (AI-to-AI — Celery async task), Django Channels WebSocket
- [ ] discovery app: Keşfet sayfası feed, profil kartları, uyumluluk skoru gösterimi
- [ ] Uyumluluk raporu oluşturma ve skor hesaplama (GPT-4o analiz)
- [ ] React Native: Keşfet (16), Profil detay (17), Dijital ikiz sohbeti (18)
- [ ] React Native: Eşleme süreci (19), Uyumluluk raporu (20)

### Sprint 7-8 (Hafta 13-16): Ödeme + Premium + Takvim
- [ ] subscriptions app: İyzico entegrasyonu, 3 paket (Freemium/VIP/Premium)
- [ ] calendar_app: Uygun zaman eşleştirme, görüşme planlama
- [ ] notifications app: FCM push, SES email, in-app bildirimler
- [ ] React Native: Gerçek kimlik açılımı (21), Takvim (22), Premium üyelik (25)
- [ ] React Native: Mesaj kutusu (26), Bildirimler (27), Ayarlar (28), Başarı ekranı (30)

### Sprint 9-10 (Hafta 17-20): Test + Polish + Yayın
- [ ] React admin panel (29): Kullanıcı yönetimi, istatistikler, raporlar
- [ ] End-to-end test: Tam kullanıcı akışı (kayıt → profil → ikiz → eşleme → sohbet → rapor)
- [ ] Bug fix ve UI polish
- [ ] Google Play Store yayın hazırlığı (listing, screenshots, açıklama)
- [ ] Performans optimizasyonu (API response time, embedding arama hızı)
- [ ] API dokümantasyonu (Swagger/OpenAPI)

---

## 10. Hesap Kurulum Rehberi

Tüm hesaplar henüz açılmamıştır. Aşağıdaki adımları ilgili sprint'ten önce tamamlayın.

### AWS Hesabı (Sprint 1'den önce)
1. https://aws.amazon.com → Create Account
2. Root kullanıcı için MFA aktive et
3. IAM admin kullanıcısı oluştur (root'u günlük kullanma)
4. AWS CLI yükle: `pip install awscli` → `aws configure`
5. Gerekli servisler: ECS, RDS, S3, CloudFront, ElastiCache, SES, SQS, Secrets Manager, KMS, CloudWatch, Rekognition, WAF
6. SES'te domain doğrulama yap (twinmatch.app)
7. Budget alarm kur: $300/ay uyarı

### OpenAI API (Sprint 3'ten önce)
1. https://platform.openai.com → Sign Up
2. Settings > API Keys → Create new secret key
3. Usage limits ayarla: aylık $200 hard limit önerilir
4. Kullanılacak modeller: `gpt-4o`, `text-embedding-3-small`
5. API key'i AWS Secrets Manager'a ekle

### İyzico (Sprint 7'den önce)
1. https://www.iyzico.com → Merchant hesabı başvurusu
2. Sandbox API key ve Secret key al
3. Webhook URL konfigürasyonu: `https://api.twinmatch.app/api/v1/subscriptions/webhook/iyzico/`
4. 3D Secure ayarlarını yap
5. Test kartları ile ödeme akışını doğrula
6. Production geçişi için İyzico onayı al

### Firebase (Sprint 7'den önce)
1. https://console.firebase.google.com → Create Project: "TwinMatch"
2. Android uygulaması ekle: package name `com.twinmatch.app`
3. `google-services.json` dosyasını indir → React Native projesine ekle
4. Cloud Messaging API'yi aktive et
5. Server key'i al → AWS Secrets Manager'a ekle

### Domain (Sprint 1'den önce)
1. `twinmatch.app` (veya tercih edilen) domain satın al
2. AWS Route 53'e hosted zone oluştur
3. ACM ile SSL sertifikası oluştur (*.twinmatch.app)
4. Alt domainler: `api.twinmatch.app`, `cdn.twinmatch.app`, `admin.twinmatch.app`

---

## Faz 2 — Kısa Özet (4-6 Hafta)

Faz 1 tamamlandıktan sonra eklenecek özellikler:

| Özellik | Açıklama |
|---------|----------|
| **Anonim Hediye Sistemi** | Amazon/ÇiçekSepeti API entegrasyonu, şifreli eşleme kodu ile anonim teslimat, hediye sonrası profil görüntüleme |
| **Mekan Önerileri** | Google Places API, harita entegrasyonu, anlaşmalı işletmeler, restoran/kafe/bar önerileri |
| **Mekan Avantajları** | Anlaşmalı işletmelere özel indirim ve rezervasyon |
| **Gelişmiş Admin Panel** | Detaylı analitik dashboard, A/B test altyapısı |
| **iOS Yayın** | React Native iOS build, App Store yayın |
