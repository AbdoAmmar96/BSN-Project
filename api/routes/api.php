<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProjectDeliverableController;
use App\Http\Controllers\Api\ProjectTaskController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

// ============================================
// Unversioned (infrastructure)
// ============================================
// Lightweight liveness — uptime monitors hit this every minute.
Route::get('/health', fn() => response()->json([
    'ok' => true,
    'service' => 'BSN API',
    'version' => 'v1',
    'time' => now()->toIso8601String(),
]));

// Deep health — checks DB, cache, queue, and writable storage. Slower; meant
// for dashboards and alerting (`?detailed=1` returns per-check timings).
Route::get('/health/deep', function (\Illuminate\Http\Request $request) {
    $checks = [];
    $allOk = true;

    $time = function (callable $fn) {
        $start = microtime(true);
        try {
            $ok = $fn();
            return ['ok' => (bool) $ok, 'ms' => (int) ((microtime(true) - $start) * 1000)];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage(), 'ms' => (int) ((microtime(true) - $start) * 1000)];
        }
    };

    $checks['db'] = $time(fn () => \DB::connection()->getPdo() && \DB::select('select 1 as ok'));
    $checks['cache'] = $time(function () {
        $key = '__health_' . bin2hex(random_bytes(4));
        \Cache::put($key, 1, 5);
        $hit = \Cache::get($key) === 1;
        \Cache::forget($key);
        return $hit;
    });
    $checks['queue'] = $time(fn () => config('queue.default') !== null);
    $checks['storage'] = $time(fn () => is_writable(storage_path('app')) && is_writable(storage_path('logs')));

    foreach ($checks as $c) {
        if (empty($c['ok'])) {
            $allOk = false;
            break;
        }
    }

    return response()->json([
        'ok' => $allOk,
        'service' => 'BSN API',
        'version' => 'v1',
        'time' => now()->toIso8601String(),
        'checks' => $checks,
    ], $allOk ? 200 : 503);
});

// Webhooks stay unversioned — providers register a fixed URL with us
Route::post('/payments/paymob/webhook', [PaymentController::class, 'paymobWebhook']);
Route::post('/payments/fawry/webhook', [PaymentController::class, 'fawryWebhook']);
Route::post('/payments/kashier/webhook', [PaymentController::class, 'kashierWebhook']);

// ============================================
// API v1
// ============================================
Route::prefix('v1')->group(function () {

    // ----- PUBLIC -----
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');
    Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:10,1');

    Route::get('/packages', [PackageController::class, 'index']);
    Route::get('/packages/{package}', [PackageController::class, 'show'])->whereNumber('package');
    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');

    // ----- AUTH (any role) -----
    Route::middleware(['auth:sanctum', 'role'])->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/password', [AuthController::class, 'changePassword'])->middleware('throttle:5,1');
        Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification'])->middleware('throttle:3,1');

        Route::post('/broadcasting/auth', function () {
            return Broadcast::auth(request());
        });

        // Orders (Path A — package purchase)
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::post('/orders/calculate', [OrderController::class, 'calculate']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::put('/orders/{order}', [OrderController::class, 'update']);
        Route::post('/orders/{order}/checkout', [OrderController::class, 'checkout']);
        Route::post('/orders/{order}/attachments', [OrderController::class, 'uploadAttachment']);

        // Addons catalog for the order wizard
        Route::get('/packages/addons', [PackageController::class, 'addons']);

        // Coupons
        Route::post('/coupons/validate', [CouponController::class, 'validateCode'])->middleware('throttle:30,1');

        // Leads + Quotes (Path B — custom quote, user side)
        Route::get('/leads', [LeadController::class, 'index']);
        Route::post('/leads', [LeadController::class, 'store']);
        Route::get('/leads/{lead}', [LeadController::class, 'show']);
        Route::get('/quotes', [QuoteController::class, 'index']);
        Route::get('/quotes/{quote}', [QuoteController::class, 'show']);
        Route::post('/quotes/{quote}/accept', [QuoteController::class, 'accept']);
        Route::post('/quotes/{quote}/reject', [QuoteController::class, 'reject']);
        Route::post('/quotes/{quote}/negotiate', [QuoteController::class, 'negotiate']);

        // Projects
        Route::get('/projects', [ProjectController::class, 'index']);
        Route::post('/projects', [ProjectController::class, 'store']);
        Route::get('/projects/{project}', [ProjectController::class, 'show']);
        Route::put('/projects/{project}', [ProjectController::class, 'update']);

        // Tasks
        Route::get('/projects/{project}/tasks', [ProjectTaskController::class, 'index']);
        Route::post('/projects/{project}/tasks', [ProjectTaskController::class, 'store']);
        Route::put('/tasks/{task}', [ProjectTaskController::class, 'update']);
        Route::delete('/tasks/{task}', [ProjectTaskController::class, 'destroy']);

        // Deliverables
        Route::get('/projects/{project}/deliverables', [ProjectDeliverableController::class, 'index']);
        Route::post('/projects/{project}/deliverables', [ProjectDeliverableController::class, 'store']);
        Route::post('/deliverables/{deliverable}/approve', [ProjectDeliverableController::class, 'approve']);
        Route::delete('/deliverables/{deliverable}', [ProjectDeliverableController::class, 'destroy']);

        // Invoices
        Route::get('/invoices', [InvoiceController::class, 'index']);
        Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
        Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf']);

        // Payments
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments/initiate', [PaymentController::class, 'initiate']);
        Route::get('/payments/{payment}', [PaymentController::class, 'show']);
        Route::post('/payments/{payment}/recheck', [PaymentController::class, 'recheck']);

        // Chat
        Route::get('/chat/rooms', [ChatController::class, 'rooms']);
        Route::get('/chat/rooms/{room}', [ChatController::class, 'show']);
        Route::get('/chat/rooms/{room}/messages', [ChatController::class, 'messages']);
        Route::post('/chat/rooms/{room}/messages', [ChatController::class, 'send']);
        Route::post('/chat/rooms/{room}/read', [ChatController::class, 'markRead']);
        Route::post('/chat/rooms/{room}/typing', [ChatController::class, 'typing']);
        Route::post('/chat/rooms/project/{project}', [ChatController::class, 'projectRoom']);
        Route::post('/chat/rooms/direct/{other}', [ChatController::class, 'directRoom']);
        Route::post('/chat/support', [ChatController::class, 'supportTicket']);
        Route::delete('/chat/messages/{message}', [ChatController::class, 'deleteMessage']);

        // Notifications
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

        // Onboarding (optional 3-step intro after signup)
        Route::get('/onboarding', [\App\Http\Controllers\Api\OnboardingController::class, 'show']);
        Route::post('/onboarding', [\App\Http\Controllers\Api\OnboardingController::class, 'store']);
        Route::post('/onboarding/skip', [\App\Http\Controllers\Api\OnboardingController::class, 'skip']);
    });

    // ----- ADMIN ONLY -----
    Route::middleware(['auth:sanctum', 'role:admin', 'audit'])->prefix('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store'])->middleware('throttle:30,1');
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update'])->middleware('throttle:60,1');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('throttle:30,1');
        Route::post('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);

        Route::delete('/projects/{project}', [ProjectController::class, 'destroy'])->middleware('throttle:30,1');
        Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
        Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);

        Route::post('/invoices', [InvoiceController::class, 'store'])->middleware('throttle:60,1');
        Route::put('/invoices/{invoice}', [InvoiceController::class, 'update'])->middleware('throttle:60,1');
        Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->middleware('throttle:30,1');

        Route::get('/overview-stats', [InvoiceController::class, 'overviewStats']);

        // Packages CRUD
        Route::get('/packages', [PackageController::class, 'adminIndex']);
        Route::post('/packages', [PackageController::class, 'store'])->middleware('throttle:30,1');
        Route::put('/packages/{package}', [PackageController::class, 'update'])->middleware('throttle:60,1');
        Route::delete('/packages/{package}', [PackageController::class, 'destroy'])->middleware('throttle:30,1');

        // Contact messages
        Route::get('/contact-messages', [ContactController::class, 'index']);
        Route::put('/contact-messages/{contactMessage}', [ContactController::class, 'update']);
        Route::delete('/contact-messages/{contactMessage}', [ContactController::class, 'destroy']);

        // Leads (Path B admin)
        Route::get('/leads', [\App\Http\Controllers\Api\Admin\LeadController::class, 'index']);
        Route::get('/leads/{lead}', [\App\Http\Controllers\Api\Admin\LeadController::class, 'show']);
        Route::post('/leads/{lead}/assign', [\App\Http\Controllers\Api\Admin\LeadController::class, 'assign']);
        Route::post('/leads/{lead}/quote', [\App\Http\Controllers\Api\Admin\LeadController::class, 'buildQuote']);

        // Orders + developer assignment (Flow E)
        Route::get('/orders', [\App\Http\Controllers\Api\Admin\OrderAssignmentController::class, 'index']);
        Route::get('/orders/{order}', [\App\Http\Controllers\Api\Admin\OrderAssignmentController::class, 'show']);
        Route::post('/orders/{order}/assign', [\App\Http\Controllers\Api\Admin\OrderAssignmentController::class, 'assign']);
        Route::post('/orders/{order}/hold', [\App\Http\Controllers\Api\Admin\OrderAssignmentController::class, 'hold']);
        Route::post('/orders/{order}/cancel', [\App\Http\Controllers\Api\Admin\OrderAssignmentController::class, 'cancel']);

        // Quotes (Path B admin)
        Route::get('/quotes', [\App\Http\Controllers\Api\Admin\QuoteController::class, 'index']);
        Route::get('/quotes/{quote}', [\App\Http\Controllers\Api\Admin\QuoteController::class, 'show']);
        Route::put('/quotes/{quote}', [\App\Http\Controllers\Api\Admin\QuoteController::class, 'update']);
        Route::post('/quotes/{quote}/items', [\App\Http\Controllers\Api\Admin\QuoteController::class, 'addItem']);
        Route::delete('/quotes/{quote}/items/{item}', [\App\Http\Controllers\Api\Admin\QuoteController::class, 'removeItem']);
        Route::post('/quotes/{quote}/send', [\App\Http\Controllers\Api\Admin\QuoteController::class, 'send']);
        Route::post('/quotes/{quote}/version', [\App\Http\Controllers\Api\Admin\QuoteController::class, 'createVersion']);

        // Addons CRUD (CMS)
        Route::get('/addons', [\App\Http\Controllers\Api\Admin\AddonController::class, 'index']);
        Route::post('/addons', [\App\Http\Controllers\Api\Admin\AddonController::class, 'store'])->middleware('throttle:30,1');
        Route::get('/addons/{addon}', [\App\Http\Controllers\Api\Admin\AddonController::class, 'show']);
        Route::put('/addons/{addon}', [\App\Http\Controllers\Api\Admin\AddonController::class, 'update'])->middleware('throttle:60,1');
        Route::delete('/addons/{addon}', [\App\Http\Controllers\Api\Admin\AddonController::class, 'destroy'])->middleware('throttle:30,1');

        // Bundles CRUD (CMS)
        Route::get('/bundles', [\App\Http\Controllers\Api\Admin\BundleController::class, 'index']);
        Route::post('/bundles', [\App\Http\Controllers\Api\Admin\BundleController::class, 'store'])->middleware('throttle:30,1');
        Route::get('/bundles/{bundle}', [\App\Http\Controllers\Api\Admin\BundleController::class, 'show']);
        Route::put('/bundles/{bundle}', [\App\Http\Controllers\Api\Admin\BundleController::class, 'update'])->middleware('throttle:60,1');
        Route::delete('/bundles/{bundle}', [\App\Http\Controllers\Api\Admin\BundleController::class, 'destroy'])->middleware('throttle:30,1');

        // Coupons CRUD (CMS)
        Route::get('/coupons', [\App\Http\Controllers\Api\Admin\CouponController::class, 'index']);
        Route::post('/coupons', [\App\Http\Controllers\Api\Admin\CouponController::class, 'store'])->middleware('throttle:30,1');
        Route::get('/coupons/{coupon}', [\App\Http\Controllers\Api\Admin\CouponController::class, 'show']);
        Route::put('/coupons/{coupon}', [\App\Http\Controllers\Api\Admin\CouponController::class, 'update'])->middleware('throttle:60,1');
        Route::delete('/coupons/{coupon}', [\App\Http\Controllers\Api\Admin\CouponController::class, 'destroy'])->middleware('throttle:30,1');

        // Audit logs viewer
        Route::get('/audit-logs', [\App\Http\Controllers\Api\AuditLogController::class, 'index']);
    });

    // ----- DEVELOPER + ADMIN -----
    Route::middleware(['auth:sanctum', 'role:admin,developer'])->prefix('dev')->group(function () {
        Route::get('/tasks', [ProjectTaskController::class, 'mine']);
    });
});

// ============================================
// Fallback — any /api/* path that isn't matched above.
// Returns a clear hint about the new /v1/ namespace.
// ============================================
Route::fallback(function () {
    return response()->json([
        'message' => 'Endpoint not found. The API is now versioned — use /api/v1/* paths.',
        'docs' => '/api/health',
    ], 404);
});
