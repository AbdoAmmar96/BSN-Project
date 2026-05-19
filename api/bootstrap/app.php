<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        channels: __DIR__ . '/../routes/channels.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Sanctum SPA middleware for the React frontend
        $middleware->statefulApi();

        // CSRF — exempt webhooks and broadcasting auth (uses bearer token)
        $middleware->validateCsrfTokens(except: [
            'api/payments/*/webhook',
            'broadcasting/auth',
            'api/broadcasting/auth',
        ]);

        // Role middleware alias
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
            'audit' => \App\Http\Middleware\LogAdminActions::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function ($request, $e) {
            return $request->is('api/*') || $request->expectsJson();
        });

        // Forward unhandled exceptions to Sentry when the package is installed
        // and a DSN is configured. Wrapped so missing dependencies never break
        // boot.
        $exceptions->reportable(function (\Throwable $e) {
            if (app()->bound('sentry') && env('SENTRY_LARAVEL_DSN')) {
                \Sentry\Laravel\Integration::captureUnhandledException($e);
            }
        });
    })
    ->create();
