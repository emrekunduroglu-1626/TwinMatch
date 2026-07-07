# TwinMatch

TwinMatch; Django backend, Expo/React Native mobil uygulama ve React tabanlı admin panel içeren bir MVP iskeletidir.

## Monorepo yapısı

- `backend/`: Django REST API, admin endpointleri ve domain modelleri
- `mobile/`: Expo tabanlı React Native istemcisi
- `admin-panel/`: Vite + React admin paneli
- `docs/`: teknik plan ve sprint dokümantasyonu
- `docker-compose.yml`: lokal geliştirme orkestrasyonu

## Gereksinimler

- Docker Desktop
- Node.js 22+
- Python 3.12+

## Docker Compose ile çalıştırma

Ana klasörde:

```bash
docker compose up --build
```

Servisler:

- Backend API health check: `http://localhost:8000/api/v1/health/`
- Django admin: `http://localhost:8000/admin/`
- React admin panel: `http://localhost:5173/`

> Not: Backend PostgreSQL + pgvector kullanır. Compose dosyası `pgvector/pgvector:pg16` imajını başlatır.

## Backend lokal çalıştırma

PostgreSQL ve Redis'i Docker ile başlatmak en kolay yöntemdir:

```bash
docker compose up -d postgres redis
```

Sonra backend:

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py test --verbosity 2
python manage.py runserver
```

Health check:

```text
http://localhost:8000/api/v1/health/
```

## Admin panel lokal çalıştırma

```bash
cd admin-panel
npm ci
npm run build
npm run dev
```

Adres:

```text
http://localhost:5173/
```

## Mobil uygulama lokal çalıştırma

```bash
cd mobile
npm ci --ignore-scripts --omit=optional
npm run typecheck
npm run start
```

Expo Go ile terminalde çıkan QR kodu okutabilirsin.

## Test / kontrol komutları

Ana kontroller:

```bash
# Backend
cd backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test --verbosity 2

# Admin panel
cd admin-panel
npm ci
npm run build
npm audit --audit-level=moderate

# Mobile
cd mobile
npm ci --ignore-scripts --omit=optional
npm run typecheck
npx expo-doctor
```

## Admin API endpointleri

- `GET /api/v1/admin/dashboard/`
- `GET /api/v1/admin/users/?q=arama`
- `GET /api/v1/admin/users/{user_id}/`
- `PUT /api/v1/admin/users/{user_id}/status/`
- `GET /api/v1/admin/matches/`
- `GET /api/v1/admin/subscriptions/`
- `GET /api/v1/admin/reports/`

Tüm admin endpointleri JWT kimlik doğrulaması ve `is_staff=true` gerektirir.

## Sonraki adımlar

- Admin paneli gerçek API entegrasyonuna bağlamak
- Mobil uygulamada gerçek auth/API entegrasyonunu tamamlamak
- E2E test akışlarını eklemek
- Swagger/OpenAPI çıktısını CI içinde yayınlamak
