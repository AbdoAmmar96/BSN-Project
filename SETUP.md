# Setup Guide — BSN Project

## 📋 Prerequisites

- PHP 8.2+ (recommended 8.3)
- Composer 2.x
- Node.js 20+ & npm
- MySQL 8 / MariaDB 10.6+
- Git

---

## 🔧 Part 1 — Laravel API

### 1.1 Install dependencies

```bash
cd api
composer install
```

> **ملحوظة:** الـ `composer install` هيشتكي إن في files ناقصة (artisan, public/index.php, app/Http/Kernel.php, etc.) لأن دي نسخة جزئية. أفضل طريقة:
>
> ```bash
> # في مجلد جديد، ابدأ مشروع Laravel جديد:
> composer create-project laravel/laravel:^11.0 bsn-api-fresh
> # بعدين انسخ الملفات من api/ فوق الـ fresh project
> cp -r api/app bsn-api-fresh/
> cp -r api/database bsn-api-fresh/
> cp -r api/routes bsn-api-fresh/
> cp api/bootstrap/app.php bsn-api-fresh/bootstrap/
> cp api/config/services.php bsn-api-fresh/config/
> cp api/config/cors.php bsn-api-fresh/config/
> cp api/.env.example bsn-api-fresh/.env
> # كمل الخطوات تحت من داخل bsn-api-fresh
> ```

### 1.2 Environment

```bash
cp .env.example .env
php artisan key:generate
```

عدّل في `.env`:

```env
DB_DATABASE=bsn
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 1.3 Install required packages (في حالة الـ fresh project)

```bash
composer require laravel/sanctum laravel/reverb
composer require guzzlehttp/guzzle
composer require spatie/laravel-permission   # اختياري لو حابب tags/permissions أعمق

# Publish Sanctum + Reverb configs
php artisan install:api
php artisan reverb:install
```

### 1.4 Migrate database

```bash
php artisan migrate --seed
```

ده هيعمل:
- كل الـ tables (users, projects, payments, chats, etc.)
- 4 حسابات تجريبية:
  - `amr@bp-eg.com` (admin)
  - `walid@bp-eg.com` (admin)
  - `dev@bp-eg.com` (developer)
  - `client@example.com` (user)
- كلمة المرور لكلهم: `password`

### 1.5 Storage

```bash
php artisan storage:link
```

### 1.6 Run the API server

```bash
php artisan serve
# API على http://localhost:8000
```

### 1.7 Reverb (للشات بعدين)

في terminal منفصل:

```bash
php artisan reverb:start
# WebSocket server على http://localhost:8080
```

---

## ⚛ Part 2 — React App

### 2.1 Install

```bash
cd app
npm install
```

### 2.2 Environment

```bash
cp .env.example .env
```

التطبيق هيشتغل افتراضياً مع `VITE_API_URL=http://localhost:8000` (مظبوط في الـ proxy جوّا vite.config.js).

### 2.3 Run dev server

```bash
npm run dev
# App على http://localhost:5173
```

### 2.4 Build for production

```bash
npm run build
# الـ output في dist/
```

---

## 💳 Part 3 — Payment Gateway Credentials

عدّل في `api/.env`:

### Paymob

```env
PAYMOB_API_KEY=ZXlKaGJHY2lP...        # من لوحة Paymob → Settings → API Key
PAYMOB_HMAC_SECRET=4D4DF5F3...         # HMAC verification key
PAYMOB_INTEGRATION_CARD=12345          # Integration ID للكارت
PAYMOB_INTEGRATION_WALLET=12346        # Integration ID للمحفظة
PAYMOB_INTEGRATION_INSTALLMENTS=12347  # Integration ID للتقسيط
PAYMOB_IFRAME_CARD=98765               # iframe ID
```

اضبط الـ webhook URL في Paymob dashboard:
```
https://your-domain.com/api/payments/paymob/webhook
```

### Fawry

```env
FAWRY_MERCHANT_CODE=YOUR_MERCHANT_CODE
FAWRY_SECURE_KEY=YOUR_SECURE_KEY
FAWRY_BASE_URL=https://atfawry.fawrystaging.com  # staging
# للـ production: https://www.atfawry.com
```

Webhook URL في Fawry dashboard:
```
https://your-domain.com/api/payments/fawry/webhook
```

### Kashier

```env
KASHIER_MERCHANT_ID=MID-XXX-XXX
KASHIER_API_KEY=YOUR_API_KEY
KASHIER_SECRET=YOUR_SECRET
KASHIER_MODE=test   # or 'live'
```

Webhook URL في Kashier dashboard:
```
https://your-domain.com/api/payments/kashier/webhook
```

---

## 🔐 Sanctum Configuration

لأن الـ React app على دومين منفصل، لازم تتأكد إن:

في `api/.env`:
```env
SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173,app.bp-eg.com
SESSION_DOMAIN=.localhost          # في الـ dev
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://app.bp-eg.com
```

التطبيق بيستخدم **Bearer tokens** (مش cookies)، فالـ token بيتخزّن في `localStorage` كـ `bsn_token` ويتبعت في كل request في الـ `Authorization` header.

---

## 🧪 Test the API

```bash
# Health check
curl http://localhost:8000/api/health

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amr@bp-eg.com","password":"password"}'

# Use the returned token
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📂 Project Structure

```
api/
├── app/
│   ├── Http/Controllers/Api/    # AuthController, PaymentController
│   ├── Http/Middleware/         # EnsureRole
│   ├── Models/                  # User, Project, Payment, ChatRoom, Message, ...
│   └── Services/Payment/        # Paymob, Fawry, Kashier services
├── database/
│   ├── migrations/              # All tables
│   └── seeders/                 # DatabaseSeeder
├── routes/api.php
└── bootstrap/app.php

app/
├── src/
│   ├── api/                     # axios client + endpoints
│   ├── components/              # ProtectedRoute, ui
│   ├── contexts/                # AuthContext
│   ├── layouts/                 # PublicLayout, DashboardLayout
│   ├── pages/                   # auth, public
│   ├── dashboards/              # admin, developer, user
│   ├── App.jsx                  # main router
│   └── main.jsx                 # entry
├── package.json
└── vite.config.js
```

---

## 🐛 Troubleshooting

**CORS errors في الـ browser console:**
- تأكد إن `CORS_ALLOWED_ORIGINS` في الـ API .env فيه `http://localhost:5173`
- شغّل `php artisan config:clear`

**401 على كل الـ API calls:**
- الـ token مش متخزّن في localStorage — جرّب login تاني
- في DevTools → Application → Local Storage، تأكد إن `bsn_token` موجود

**Migrations فشلت:**
- تأكد إن MySQL شغّال وإن الـ database `bsn` متعمل
- لو ظهر خطأ تشفير — استخدم `utf8mb4` collation

**Reverb مش بيشتغل:**
- تأكد إن `BROADCAST_CONNECTION=reverb` في .env
- شغّل في terminal جديد: `php artisan reverb:start --debug`

---

## 🎯 Next Steps

شوف `README.md` للـ Phase plan. اللي جاي:
- **Phase 2:** الـ public pages الباقية (Services, Pricing, Portfolio, About, Contact)
- **Phase 3:** الـ Dashboards التفصيلية لكل role
- **Phase 4:** UI للـ Payment gateways
- **Phase 5:** الشات بـ Reverb
