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
// PUBLIC
// ============================================
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

Route::post('/payments/paymob/webhook', [PaymentController::class, 'paymobWebhook']);
Route::post('/payments/fawry/webhook', [PaymentController::class, 'fawryWebhook']);
Route::post('/payments/kashier/webhook', [PaymentController::class, 'kashierWebhook']);

Route::get('/health', fn() => response()->json([
    'ok' => true, 'service' => 'BSN API', 'time' => now()->toIso8601String(),
]));

// Public packages list
Route::get('/packages', [PackageController::class, 'index']);

// Public contact form (rate-limited, 5 requests / minute per IP)
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1');

// ============================================
// AUTH (Sanctum) — any role
// ============================================
Route::middleware(['auth:sanctum', 'role'])->group(function () {
    // Profile + auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/logout-all', [AuthController::class, 'logoutAll']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'changePassword'])->middleware('throttle:5,1');

    // Broadcasting auth — for Echo to subscribe to private channels
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

    // ============================================
    // CHAT (new!)
    // ============================================
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

// ============================================
// ADMIN ONLY
// ============================================
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{user}', [UserController::class, 'show']);
    Route::put('/users/{user}', [UserController::class, 'update']);
    Route::delete('/users/{user}', [UserController::class, 'destroy']);
    Route::post('/users/{user}/toggle-active', [UserController::class, 'toggleActive']);

    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    Route::post('/projects/{project}/members', [ProjectController::class, 'addMember']);
    Route::delete('/projects/{project}/members/{user}', [ProjectController::class, 'removeMember']);

    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::put('/invoices/{invoice}', [InvoiceController::class, 'update']);
    Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy']);

    Route::get('/overview-stats', [InvoiceController::class, 'overviewStats']);

    // Packages CRUD (admin)
    Route::get('/packages', [PackageController::class, 'adminIndex']);
    Route::post('/packages', [PackageController::class, 'store']);
    Route::put('/packages/{package}', [PackageController::class, 'update']);
    Route::delete('/packages/{package}', [PackageController::class, 'destroy']);

    // Contact messages (admin inbox)
    Route::get('/contact-messages', [ContactController::class, 'index']);
    Route::put('/contact-messages/{contactMessage}', [ContactController::class, 'update']);
    Route::delete('/contact-messages/{contactMessage}', [ContactController::class, 'destroy']);
});

// ============================================
// DEVELOPER + ADMIN
// ============================================
Route::middleware(['auth:sanctum', 'role:admin,developer'])->prefix('dev')->group(function () {
    Route::get('/tasks', [ProjectTaskController::class, 'mine']);
});
