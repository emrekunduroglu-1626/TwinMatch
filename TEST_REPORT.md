# TwinMatch Test & Fix Report

## Summary

The project was extracted, inspected, fixed, and re-tested across backend, admin panel, mobile app, Docker Compose, CI workflow, and npm lockfiles.

## Fixes Applied

1. **Backend migrations added**
   - Added initial Django migrations for all model apps.
   - Added `pgvector.django.extensions.VectorExtension()` before creating the `VectorField`-based profile model.

2. **Backend protected endpoint permissions fixed**
   - `apps/profiles/views.py` no longer exposes user profile endpoints via `AllowAny`.
   - `apps/digital_twin/views.py` now protects user-specific digital twin endpoints with `IsAuthenticated`.
   - `SurveyQuestionsView` remains public because it only returns static survey questions.

3. **Backend smoke tests added**
   - Added `backend/tests/test_smoke.py`.
   - Tests cover health endpoint, auth skeleton endpoints, and unauthenticated access checks for protected endpoints.

4. **Admin panel dependency/security fix**
   - Upgraded admin panel Vite toolchain.
   - Admin `npm audit --audit-level=moderate` now reports `0 vulnerabilities`.

5. **Mobile dependency validation fix**
   - Added missing `expo-font` peer dependency required by `@expo/vector-icons`.
   - Mobile TypeScript typecheck passes.

6. **Docker Compose fixed**
   - Admin panel port corrected from `4173` to `5173`.
   - Admin panel Docker command now uses `npm ci` and binds Vite to `0.0.0.0:5173`.
   - Admin panel Node image updated to Node 22.

7. **GitHub Actions CI improved**
   - Added PostgreSQL/pgvector service for backend checks.
   - Added migration verification and migration application step.
   - Added backend tests, admin build/audit, and mobile typecheck.

8. **Lockfiles re-cleaned**
   - Removed all internal Artifactory `resolved` URLs from npm lockfiles after dependency changes.

## Commands Run

### Backend

```bash
python -m compileall -q .
DJANGO_SETTINGS_MODULE=config.settings.development python manage.py check
DJANGO_SETTINGS_MODULE=config.settings.development python manage.py makemigrations --check --dry-run
DJANGO_SETTINGS_MODULE=config.settings.development python manage.py test --verbosity 2
```

Result:

```text
System check identified no issues (0 silenced).
Ran 3 tests in 0.013s
OK
```

Note: `makemigrations --check --dry-run` was run without a local PostgreSQL server in this sandbox, so Django emitted a connection warning while checking migration history, then confirmed `No changes detected`. The GitHub Actions workflow now includes a pgvector PostgreSQL service and will run migrations against PostgreSQL.

### Admin Panel

```bash
npm ci
npm run build
npm audit --audit-level=moderate
```

Result:

```text
✓ built successfully
found 0 vulnerabilities
```

### Mobile

```bash
npm ci --ignore-scripts --omit=optional
npm run typecheck
npx expo-doctor
```

Result:

```text
tsc --noEmit: passed
expo-doctor: 14/17 checks passed
```

`expo-doctor` could not complete three checks because the sandbox could not reach Expo API hosts (`exp.host`, `api.expo.dev`). The real project issue it found locally, missing `expo-font`, was fixed.

## Remaining Notes

- Mobile `npm audit` still reports vulnerabilities inside the Expo SDK 51 / React Native 0.74 dependency tree. The automated fix requires a breaking migration to Expo 56 and React Native 0.86, so it was not forced inside this MVP package.
- Backend full dependency installation in this sandbox was limited by Python 3.13/native package resolution. The project Dockerfile and CI use Python 3.12, which is the intended runtime.
- Docker itself is not available in this sandbox, so `docker compose up --build` could not be executed here. The Compose file was corrected and CI now covers backend database/migration checks.
