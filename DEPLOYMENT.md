# Production Deployment

Two deployment paths, depending on infrastructure:

1. **Docker Compose** — single host, fastest path. Good for staging + small prod.
2. **Bare-metal / VPS** — Nginx + PHP-FPM + Supervisor + MySQL directly. Cheaper and easier to debug.

---

## Option 1 — Docker Compose

### Prerequisites
- Docker 24+ and Docker Compose v2
- A DNS A-record pointing your domain at the host
- TLS certs (use Caddy or Traefik in front for auto Let's Encrypt)

### Steps

```bash
git clone <repo> bsn-project
cd bsn-project

# 1. Configure backend secrets
cp api/.env.example api/.env
# edit api/.env — set:
#   APP_ENV=production
#   APP_DEBUG=false
#   APP_URL=https://api.your-domain.com
#   DB_HOST=db  DB_USERNAME=bsn  DB_PASSWORD=<strong>
#   MAIL_MAILER=smtp + real credentials
#   Payment gateway keys (Paymob/Fawry/Kashier)

# 2. Configure root compose env
cat > .env <<EOF
DB_DATABASE=bsn
DB_USERNAME=bsn
DB_PASSWORD=<strong>
DB_ROOT_PASSWORD=<strong>
API_PORT=8000
APP_PORT=80
REVERB_PORT=8080
VITE_API_URL=https://api.your-domain.com
VITE_REVERB_HOST=ws.your-domain.com
VITE_REVERB_SCHEME=https
VITE_REVERB_PORT=443
EOF

# 3. Build + start
docker compose up -d --build

# 4. First-time setup inside the api container
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --force
docker compose exec api php artisan db:seed --force        # optional: demo data
docker compose exec api php artisan storage:link

# 5. Verify
curl https://api.your-domain.com/api/health
```

### Putting it behind HTTPS

Place a TLS-terminating reverse proxy (Caddy, Traefik, or Nginx) in front of the compose stack:

```caddy
api.your-domain.com {
    reverse_proxy localhost:8000
}

app.your-domain.com {
    reverse_proxy localhost:80
}

ws.your-domain.com {
    reverse_proxy localhost:8080
}
```

Reverb (WebSockets) needs `ws://` upgraded to `wss://` — Caddy and Traefik handle this automatically.

### Updating

```bash
git pull
docker compose build --pull
docker compose up -d
docker compose exec api php artisan migrate --force
docker compose exec api php artisan config:cache route:cache view:cache
```

---

## Option 2 — Bare-metal (Ubuntu 22.04 / 24.04)

### Install system packages

```bash
sudo apt update
sudo apt install -y nginx mysql-server supervisor \
    php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-curl \
    php8.3-zip php8.3-gd php8.3-intl php8.3-bcmath php8.3-redis \
    nodejs npm composer git
```

### Backend

```bash
sudo mkdir -p /var/www/bsn && sudo chown $USER:$USER /var/www/bsn
cd /var/www/bsn
git clone <repo> .

cd api
composer install --no-dev --optimize-autoloader
cp .env.example .env
# edit .env (same as Docker option above)
php artisan key:generate
sudo mysql -e "CREATE DATABASE bsn; CREATE USER 'bsn'@'localhost' IDENTIFIED BY '<strong>'; GRANT ALL ON bsn.* TO 'bsn'@'localhost'; FLUSH PRIVILEGES;"
php artisan migrate --force
php artisan storage:link

sudo chown -R www-data:www-data storage bootstrap/cache
```

### Frontend

```bash
cd /var/www/bsn/app
npm ci
# create production env
cat > .env <<EOF
VITE_API_URL=https://api.your-domain.com
VITE_REVERB_APP_KEY=bsn-key
VITE_REVERB_HOST=ws.your-domain.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
EOF
npm run build
# dist/ is what Nginx will serve
```

### Nginx — API site

`/etc/nginx/sites-available/bsn-api`:

```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    root /var/www/bsn/api/public;
    index index.php;

    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
    location ~ /\.(?!well-known) { deny all; }
}
```

### Nginx — Frontend site

`/etc/nginx/sites-available/bsn-app`:

```nginx
server {
    listen 80;
    server_name app.your-domain.com;
    root /var/www/bsn/app/dist;
    index index.html;

    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(js|css|woff2?|svg|png|jpg|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable both sites:

```bash
sudo ln -s /etc/nginx/sites-available/bsn-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/bsn-app /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Get TLS certs
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com -d app.your-domain.com
```

### Supervisor — queue worker + Reverb

`/etc/supervisor/conf.d/bsn.conf`:

```ini
[program:bsn-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/bsn/api/artisan queue:work --sleep=3 --tries=3 --timeout=120
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/bsn-queue.log
stopwaitsecs=3600

[program:bsn-reverb]
command=php /var/www/bsn/api/artisan reverb:start --host=0.0.0.0 --port=8080
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/bsn-reverb.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```

### Cron — scheduled jobs (invoice reminders)

```bash
sudo crontab -u www-data -e
# add:
* * * * * cd /var/www/bsn/api && php artisan schedule:run >> /dev/null 2>&1
```

### WebSocket subdomain

Put `ws.your-domain.com` in front of port 8080 — Nginx upstream block:

```nginx
server {
    listen 443 ssl http2;
    server_name ws.your-domain.com;
    # ... TLS config ...
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600;
    }
}
```

---

## Database backups

The database is the only piece of state you cannot rebuild from the codebase, so backing it up is non-negotiable for production. Two layers:

### Layer 1 — nightly logical dump

A `mysqldump` cron, written to a directory that is itself off-host (S3 / rsync to a different VPS / Backblaze B2).

```bash
sudo crontab -e
# nightly at 02:30 UTC
30 2 * * * /usr/local/bin/bsn-backup.sh >> /var/log/bsn-backup.log 2>&1
```

`/usr/local/bin/bsn-backup.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

STAMP=$(date -u +%Y%m%d-%H%M)
OUT=/var/backups/bsn
KEEP_DAYS=14

mkdir -p "$OUT"

mysqldump \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --default-character-set=utf8mb4 \
  -u bsn -p"$DB_PASSWORD" bsn \
  | gzip > "$OUT/bsn-$STAMP.sql.gz"

# Ship off-host (pick one)
aws s3 cp "$OUT/bsn-$STAMP.sql.gz" "s3://bsn-backups/db/"

# Local rotation
find "$OUT" -name 'bsn-*.sql.gz' -mtime +$KEEP_DAYS -delete
```

Make it executable and inject `$DB_PASSWORD` from `/etc/bsn.env` (chmod 600):

```bash
sudo chmod +x /usr/local/bin/bsn-backup.sh
echo 'export DB_PASSWORD=<strong>' | sudo tee /etc/bsn.env > /dev/null
sudo chmod 600 /etc/bsn.env
```

Update the cron line to load that env:

```cron
30 2 * * * . /etc/bsn.env && /usr/local/bin/bsn-backup.sh
```

### Layer 2 — uploaded files

Avatars, chat attachments, and project deliverables live in `api/storage/app/public/`. If you lose them, paying clients lose deliverables. Rsync nightly to the same off-host destination:

```cron
0 3 * * * rsync -az --delete /var/www/bsn/api/storage/app/public/ user@backup-host:/srv/bsn-storage/
```

In a docker-compose deployment the storage volume is `apistorage`; mount it on the host with `docker compose cp` or run rsync inside a sidecar container that mounts the same volume read-only.

### Restoring

Test the restore at least once before you need it for real:

```bash
# 1. Pull the latest dump
aws s3 cp s3://bsn-backups/db/bsn-LATEST.sql.gz .

# 2. Spin up a scratch DB to verify it loads
mysql -u root -p -e "CREATE DATABASE bsn_restore"
gunzip -c bsn-LATEST.sql.gz | mysql -u root -p bsn_restore

# 3. Smoke-check key tables
mysql -u root -p bsn_restore -e "SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM invoices;"
```

**Document the recovery procedure separately** so anyone on-call can run it. A backup you've never restored is a hope, not a backup.

### Migration rollback safety

Always pair every destructive migration (drop column, drop table, rename) with a working `down()` method, and test it locally before deploying:

```bash
php artisan migrate
php artisan migrate:rollback --step=1
php artisan migrate
```

If a migration can't be rolled back safely (e.g. it deletes data), say so explicitly in the migration's PHPDoc and take a manual dump before running it in production.

---

## Going-live checklist

- [ ] `APP_ENV=production`, `APP_DEBUG=false` in `api/.env`
- [ ] Generated a real `APP_KEY` (32 random bytes)
- [ ] DB password is strong + unique
- [ ] `php artisan migrate --force` succeeded
- [ ] `php artisan config:cache route:cache view:cache` after every deploy
- [ ] Queue worker process is running (`supervisorctl status`)
- [ ] Reverb is running and reachable via WSS
- [ ] Cron `schedule:run` line exists for `www-data`
- [ ] Payment gateway webhook URLs registered (Paymob/Fawry/Kashier)
- [ ] HTTPS enforced on all three subdomains (api, app, ws)
- [ ] Backup strategy in place (mysqldump nightly to S3 / off-host)
- [ ] Test the full flow end-to-end in staging before flipping DNS
