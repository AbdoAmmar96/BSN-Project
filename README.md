# BSN — شريك الأعمال

> Full-stack web platform for **شركة شريك الأعمال لتقنية المعلومات (Business Partner / BSN)** — a digital agency CRM with public marketing site, role-based dashboards, real-time chat, invoicing, and payments.

![Stack](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white)
![Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=000)
![Stack](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Stack](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)
![Stack](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📐 Architecture

```
bsn-project/
├── api/          # Laravel 11 API  (PHP 8.2+, Sanctum, Reverb)
├── app/          # React 18 SPA    (Vite, Tailwind, React Query, Reverb client)
├── README.md
├── SETUP.md      # Detailed setup walkthrough
└── .gitignore
```

| Layer | Stack |
|---|---|
| **Backend** | Laravel 11 · Sanctum (Bearer tokens) · Reverb WebSockets · MySQL |
| **Frontend** | React 18 · Vite 5 · TailwindCSS · React Router · TanStack Query · Axios · React Hook Form · React Helmet Async |
| **Real-time** | Laravel Reverb (self-hosted, no Pusher) |
| **Email** | Queued via `database` driver, Markdown templates |
| **Payments** | Paymob (Card / Wallet / Installments) · Fawry · Kashier — strategy pattern |
| **PDF** | barryvdh/laravel-dompdf for invoice downloads |

---

## ✨ Features

### Public site
- Multi-page marketing (Home, Services, Pricing, Portfolio, About, Contact, ServiceDetail)
- **Dynamic pricing** — packages CMS, edits in admin appear instantly on `/pricing`
- **Working contact form** — saves to DB, emails all admins, honeypot + rate-limited
- Real founder photos, live screenshots for portfolio (mshots)
- Dynamic SEO meta tags per page (Open Graph + Twitter Card via Helmet)
- Mobile burger nav, scroll-to-top on route change, Arabic-first RTL

### Auth
- Email + password registration with welcome email
- Login / logout / logout-all-devices (Bearer tokens, 30-day expiry)
- **Forgot password** → emailed reset link → reset page
- Profile + change-password endpoints
- Rate-limited (login 10/min, register 5/min, forgot 3/min)

### Three role-based dashboards
| Role | Path | Highlights |
|---|---|---|
| `admin` | `/admin` | Users CRUD, Projects, Invoices, Payments, **Packages CMS**, Contact messages, Settings |
| `developer` | `/dev` | Assigned projects, Tasks Kanban, Deliverables |
| `user` (client) | `/dashboard` | My projects, invoices, payments, "New project" form |

### Chat
- Project rooms (auto-created with members), support tickets, direct DMs
- Real-time messages over Reverb WebSockets
- Image attachments (whitelisted MIME types, sanitized filenames)
- Typing indicators, read receipts, unread badges
- **Admin can't snoop** on private DMs unless explicitly a member

### Notifications (in-app + email)
- Welcome on registration
- New project alert to admins
- Payment receipt to client
- Invoice reminder 3 days before due (scheduled command)
- Project status change to client

### Production hardening
- Error boundary around all routes with Arabic fallback UI
- Skeleton loaders replace "loading..." text
- 404 page with branded design (no blind redirect to `/`)
- Lazy-loaded dashboards (code splitting per route)
- Queue all emails (`ShouldQueue`) so registration is fast
- Strict file upload validation in chat (MIME + filename sanitization)

---

## 🚀 Quick start

### Prerequisites

- PHP **8.2+**, Composer 2
- Node.js **20+**, npm
- MySQL 8 / MariaDB 10.6+

### Setup (5 minutes)

```bash
git clone <your-repo-url> bsn-project
cd bsn-project

# ---------- Backend ----------
cd api
composer install
cp .env.example .env
php artisan key:generate
# Edit DB_DATABASE/DB_USERNAME/DB_PASSWORD in .env, then:
php artisan migrate --seed
php artisan storage:link

# Start API + Reverb + queue (three terminals)
php artisan serve                   # → http://localhost:8000
php artisan reverb:start            # → ws://localhost:8080
php artisan queue:work              # processes mail/notification jobs

# ---------- Frontend ----------
cd ../app
npm install
cp .env.example .env
npm run dev                          # → http://localhost:5173
```

Open `http://localhost:5173` and sign in with any seeded account (password = `password`):

| Email | Role |
|---|---|
| `amr@bp-eg.com` | admin |
| `walid@bp-eg.com` | admin |
| `dev@bp-eg.com` | developer |
| `client@example.com` | user |

For a more thorough walkthrough see [SETUP.md](./SETUP.md).

---

## 💳 Payment Gateways

Each provider implements `App\Services\Payment\PaymentGatewayInterface` (Strategy pattern):

```
api/app/Services/Payment/
├── PaymentGatewayInterface.php
├── PaymobService.php          # cards + wallets + installments
├── FawryService.php           # cash payments via reference number
├── KashierService.php         # hosted checkout
└── PaymentManager.php         # resolves the right service per gateway
```

### Going live (real merchant accounts)

| Provider | Sign-up | KYC | Sandbox |
|---|---|---|---|
| **Kashier** | [kashier.io](https://kashier.io) | 2–3 days | `KASHIER_MODE=test` |
| **Paymob** | [paymob.com](https://paymob.com) | 5–10 days | demo merchant at `accept.paymob.com` |
| **Fawry** | [fawry.com/merchants](https://fawry.com/merchants) | 2–3 weeks | `atfawry.fawrystaging.com` |

Fill credentials in `api/.env` (see `.env.example` for the full list), register webhooks at:

- `https://your-domain.com/api/payments/paymob/webhook`
- `https://your-domain.com/api/payments/fawry/webhook`
- `https://your-domain.com/api/payments/kashier/webhook`

Webhooks **require HTTPS** in production. Test each scenario in sandbox (success / failure / cancel / timeout / duplicate webhook) before flipping to live keys.

---

## 📨 Email & Queue

In development, emails are written to `api/storage/logs/laravel.log` (`MAIL_MAILER=log`). Mailables all implement `ShouldQueue`, so they go through the `database` queue.

**Important**: emails won't actually send until a queue worker is running:

```bash
php artisan queue:work          # foreground (dev)
# or
php artisan queue:work --daemon # background (production w/ supervisor)
```

Scheduled jobs (e.g. invoice reminders) need cron:

```cron
* * * * * cd /path/to/api && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🗂️ API map

All endpoints are prefixed `/api`. See `api/routes/api.php` for the full list.

| Path | Auth | Description |
|---|---|---|
| `POST /auth/register` | public · throttle 5/min | New user + welcome mail |
| `POST /auth/login` | public · throttle 10/min | Returns Bearer token |
| `POST /auth/forgot-password` | public · throttle 3/min | Emails reset link |
| `POST /auth/reset-password` | public · throttle 5/min | Finalizes reset |
| `GET  /auth/me` | sanctum | Current user |
| `POST /contact` | public · throttle 5/min | Saves message + alerts admins |
| `GET  /packages` | public | Active pricing tiers for `/pricing` |
| `GET  /projects` · `POST /projects` | sanctum | Per-role scoped |
| `GET  /invoices/{id}/pdf` | sanctum | Downloads PDF invoice |
| `GET  /chat/rooms` · `/messages` | sanctum | Rooms + paginated history |
| `POST /chat/support` | sanctum | Opens support ticket room |
| `GET  /notifications` | sanctum | In-app notifications |
| `POST /payments/initiate` | sanctum | Starts gateway flow |
| Admin-only `/admin/*` | sanctum · role:admin | Users, packages CRUD, etc. |

Broadcast channel: `private-chat-room.{roomId}` — membership-checked in `routes/channels.php`.

---

## 🧪 Demo data

`DatabaseSeeder` + `PackageSeeder` create:
- 4 users (2 admin, 1 dev, 1 client)
- 12 packages (3 per service: web / e-commerce / branding / marketing)

Re-run with `php artisan migrate:fresh --seed`.

---

## 📁 Storage layout

```
api/storage/app/public/
├── chat/{roomId}/       # chat attachments (10MB max, whitelisted MIME)
├── avatars/             # user avatars
└── deliverables/{pid}/  # project deliverables
```

Symlinked at `api/public/storage` via `php artisan storage:link`.

---

## 🛣️ Roadmap

Shipped:
- ✅ API versioning under `/api/v1/*` (legacy paths return a 404 with hint)
- ✅ Audit logging for every admin write (`audit_logs` + `LogAdminActions` middleware)
- ✅ PWA: manifest + service worker (network-first pages, stale-while-revalidate assets)
- ✅ SEO basics: `robots.txt` + `sitemap.xml` + Open Graph meta
- ✅ i18n (i18next, AR/EN, automatic RTL/LTR)
- ✅ Zod client-side validation
- ✅ Deep health endpoint (`/api/health/deep`) for uptime monitoring
- ✅ Docker + docker-compose + Supervisor deployment templates
- ✅ GitHub Actions CI (PHPUnit + Vite build)
- ✅ 20 PHPUnit feature tests (auth, packages, contact, slug, health)

Next:
- Frontend Vitest coverage
- Sentry DSN wired in production
- Real merchant accounts for Paymob / Fawry / Kashier
- Audit log viewer UI in the admin dashboard
- API response refactor onto the new `ApiResponses` trait

---

## 📞 Contact

- Sales: +20 150 015 6690
- Tech support: +20 106 875 8847
- Email: hello@bp-eg.com
- Web: [bp-eg.com](https://bp-eg.com)

## 📄 License

MIT — see [LICENSE](./LICENSE).
