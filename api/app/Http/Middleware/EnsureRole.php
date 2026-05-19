<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Usage in routes:
     *   Route::middleware('role:admin')->group(...);
     *   Route::middleware('role:admin,developer')->group(...);
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Account is disabled.'], 403);
        }

        if (!empty($roles) && !$user->hasRole($roles)) {
            return response()->json([
                'message' => 'Forbidden — insufficient role.',
                'required' => $roles,
                'your_role' => $user->role,
            ], 403);
        }

        // Track last seen
        $user->update(['last_seen_at' => now()]);

        return $next($request);
    }
}
