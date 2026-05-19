<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * GET /api/admin/users
     * Filters: role, search, is_active. Paginated.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()
            ->withCount(['projectsAsClient', 'projectsAsLead', 'projectsAsMember'])
            ->latest();

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }
        if (($active = $request->query('is_active')) !== null) {
            $query->where('is_active', filter_var($active, FILTER_VALIDATE_BOOLEAN));
        }
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'data' => $query->paginate($request->query('per_page', 15)),
            'totals' => $this->userTotals(),
        ]);
    }

    /**
     * Collapse the per-role + active counters into a single grouped query
     * instead of 5 separate COUNT(*) round-trips. Cached for 60s — the totals
     * shown on the admin index don't need real-time accuracy.
     */
    private function userTotals(): array
    {
        return \Cache::remember('admin.users.totals', 60, function () {
            $byRole = User::query()
                ->selectRaw('role, COUNT(*) as c, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_c')
                ->groupBy('role')
                ->get()
                ->keyBy('role');

            return [
                'all' => $byRole->sum('c'),
                'admin' => (int) ($byRole['admin']->c ?? 0),
                'developer' => (int) ($byRole['developer']->c ?? 0),
                'user' => (int) ($byRole['user']->c ?? 0),
                'active' => (int) $byRole->sum('active_c'),
            ];
        });
    }

    /**
     * POST /api/admin/users
     * Admin can create any role.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|min:2|max:120',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => ['required', Password::min(8)],
            'role' => 'required|in:admin,developer,user',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:120',
            'position' => 'nullable|string|max:120',
            'bio' => 'nullable|string|max:1000',
            'skills' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $user = User::create($data);

        return response()->json([
            'message' => 'تم إنشاء المستخدم',
            'user' => $user,
        ], 201);
    }

    /**
     * GET /api/admin/users/{user}
     */
    public function show(User $user): JsonResponse
    {
        $user->loadCount(['projectsAsClient', 'projectsAsLead', 'projectsAsMember', 'payments']);
        return response()->json(['user' => $user]);
    }

    /**
     * PUT /api/admin/users/{user}
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|min:2|max:120',
            'email' => "sometimes|email|max:255|unique:users,email,{$user->id}",
            'password' => ['sometimes', Password::min(8)],
            'role' => 'sometimes|in:admin,developer,user',
            'phone' => 'sometimes|nullable|string|max:20',
            'company' => 'sometimes|nullable|string|max:120',
            'position' => 'sometimes|nullable|string|max:120',
            'bio' => 'sometimes|nullable|string|max:1000',
            'skills' => 'sometimes|nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'تم تحديث المستخدم',
            'user' => $user->fresh(),
        ]);
    }

    /**
     * DELETE /api/admin/users/{user}
     * Soft delete — preserves history.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Prevent admin from deleting themselves
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'لا تقدر تحذف حسابك'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'تم حذف المستخدم']);
    }

    /**
     * POST /api/admin/users/{user}/toggle-active
     */
    public function toggleActive(User $user): JsonResponse
    {
        $user->update(['is_active' => !$user->is_active]);
        return response()->json([
            'message' => $user->is_active ? 'تم تفعيل الحساب' : 'تم إيقاف الحساب',
            'user' => $user,
        ]);
    }
}
