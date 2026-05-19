# syntax=docker/dockerfile:1.6

# ---- Stage 1: build vendor dir with composer ----
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --no-autoloader

# ---- Stage 2: runtime ----
FROM php:8.3-fpm-alpine

RUN apk add --no-cache \
        bash \
        git \
        curl \
        libpng-dev \
        oniguruma-dev \
        libxml2-dev \
        zip \
        unzip \
        icu-dev \
        mysql-client \
        nginx \
        supervisor \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd intl

# Install Composer (runtime, for php artisan optimize)
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy app source (excluding vendor — we'll bring it from vendor stage)
COPY . .

# Bring in vendor/ from the build stage, then dump the optimized autoloader
COPY --from=vendor /app/vendor ./vendor
RUN composer dump-autoload --optimize --no-dev

# Permissions for storage + bootstrap/cache
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Laravel cache (config/routes/views)
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache || true

EXPOSE 9000
CMD ["php-fpm"]
