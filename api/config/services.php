<?php

return [

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    // ============================================
    // PAYMENT GATEWAYS
    // ============================================

    'paymob' => [
        'api_key' => env('PAYMOB_API_KEY'),
        'public_key' => env('PAYMOB_PUBLIC_KEY'),
        'secret_key' => env('PAYMOB_SECRET_KEY'),
        'integration_card' => env('PAYMOB_INTEGRATION_CARD'),
        'integration_wallet' => env('PAYMOB_INTEGRATION_WALLET'),
        'integration_installments' => env('PAYMOB_INTEGRATION_INSTALLMENTS'),
        'iframe_card' => env('PAYMOB_IFRAME_CARD'),
        'hmac_secret' => env('PAYMOB_HMAC_SECRET'),
        'base_url' => env('PAYMOB_BASE_URL', 'https://accept.paymob.com/api'),
    ],

    'fawry' => [
        'merchant_code' => env('FAWRY_MERCHANT_CODE'),
        'secure_key' => env('FAWRY_SECURE_KEY'),
        'base_url' => env('FAWRY_BASE_URL', 'https://atfawry.fawrystaging.com'),
    ],

    'kashier' => [
        'merchant_id' => env('KASHIER_MERCHANT_ID'),
        'api_key' => env('KASHIER_API_KEY'),
        'secret' => env('KASHIER_SECRET'),
        'mode' => env('KASHIER_MODE', 'test'),
        'base_url' => env('KASHIER_BASE_URL', 'https://test-api.kashier.io'),
    ],

    // Dev-only simulated payments. Defaults to on outside production so the
    // checkout flow is testable before real gateways are configured.
    'mock_payments' => [
        'enabled' => env('MOCK_PAYMENTS_ENABLED', env('APP_ENV') !== 'production'),
    ],

];
