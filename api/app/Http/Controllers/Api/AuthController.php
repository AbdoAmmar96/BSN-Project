<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeMail;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new user (public — role defaults to 'user').
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|min:2|max:120',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:120',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => User::ROLE_USER,
            'phone' => $data['phone'] ?? null,
            'company' => $data['company'] ?? null,
        ]);

        $token = $user->createToken('web', expiresAt: now()->addDays(30))->plainTextToken;

        Mail::to($user->email)->send(new WelcomeMail($user));

        return response()->json([
            'message' => 'تم التسجيل بنجاح',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Login with email + password.
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string|max:60',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            return response()->json([
                'message' => 'البريد أو كلمة المرور غير صحيحة',
            ], 422);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'الحساب موقوف. تواصل مع الدعم.',
            ], 403);
        }

        $deviceName = $data['device_name'] ?? $request->userAgent() ?? 'web';
        $token = $user->createToken($deviceName, expiresAt: now()->addDays(30))->plainTextToken;

        $user->update(['last_seen_at' => now()]);

        return response()->json([
            'message' => 'تم تسجيل الدخول',
            'user' => $user,
            'token' => $token,
        ]);
    }

    /**
     * Get currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load([]),
        ]);
    }

    /**
     * Logout current device.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'تم تسجيل الخروج']);
    }

    /**
     * Logout all devices.
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'تم تسجيل الخروج من كل الأجهزة']);
    }

    /**
     * Update profile.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'sometimes|string|min:2|max:120',
            'phone' => 'sometimes|nullable|string|max:20',
            'company' => 'sometimes|nullable|string|max:120',
            'position' => 'sometimes|nullable|string|max:120',
            'bio' => 'sometimes|nullable|string|max:1000',
            'skills' => 'sometimes|nullable|array',
            'locale' => 'sometimes|in:ar,en',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'تم تحديث الملف الشخصي',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * Change password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = $request->user();

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'كلمة المرور الحالية غير صحيحة'], 422);
        }

        $user->update(['password' => $data['password']]);

        return response()->json(['message' => 'تم تغيير كلمة المرور']);
    }

    /**
     * POST /api/auth/forgot-password — send reset link to email.
     * Always returns 200 to avoid email enumeration.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        PasswordBroker::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'لو الإيميل موجود عندنا، هتلاقي رابط إعادة الضبط في بريدك',
        ]);
    }

    /**
     * POST /api/auth/reset-password — finalize reset with token from email.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $status = PasswordBroker::reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();

                // Invalidate all existing tokens
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status === PasswordBroker::PASSWORD_RESET) {
            return response()->json(['message' => 'تم تغيير كلمة المرور، تقدر تسجل دخول دلوقتي']);
        }

        return response()->json([
            'message' => match ($status) {
                PasswordBroker::INVALID_TOKEN => 'الرابط غير صحيح أو منتهي الصلاحية',
                PasswordBroker::INVALID_USER  => 'البريد غير موجود',
                default => 'تعذّر إعادة الضبط، جرّب تطلب رابط جديد',
            },
        ], 422);
    }
}
