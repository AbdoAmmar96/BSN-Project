<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\InvoiceController;
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

    Route::get('/packages', [PackageController::class, 'index']);
    Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');

    // ----- AUTH (any role) -----
    Route::middleware(['auth:sanctum', 'role'])->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/password', [AuthController::class, 'changePassword'])->middleware('throttle:5,1');

        Route::post('/broadcasting/auth', function () {
            return Broadcast::auth(request());
        });

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
