<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\NewProjectAdminMail;
use App\Mail\ProjectStatusMail;
use App\Rules\MeaningfulText;
use App\Models\Project;
use App\Models\User;
use App\Notifications\ProjectStatusChangedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    /**
     * GET /api/projects
     * Scoped by role: admin sees all, dev sees assigned, user sees own.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Project::query()
            ->with([
                'client:id,name,email,company,avatar',
                'leadDeveloper:id,name,email,avatar',
            ])
            ->withCount(['tasks', 'deliverables', 'payments'])
            ->forUser($user)
            ->latest();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($service = $request->query('service_type')) {
            $query->where('service_type', $service);
        }
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'data' => $query->paginate($request->query('per_page', 15)),
            'totals' => [
                'all' => Project::forUser($user)->count(),
                'in_progress' => Project::forUser($user)->where('status', 'in_progress')->count(),
                'pending' => Project::forUser($user)->where('status', 'pending')->count(),
                'completed' => Project::forUser($user)->where('status', 'completed')->count(),
            ],
        ]);
    }

    /**
     * POST /api/projects
     * Admin: can create for any client. User: creates as themselves.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $rules = [
            'title' => ['required', 'string', 'max:255', new MeaningfulText(3, requireMultipleWords: true)],
            'description' => ['nullable', 'string', 'max:5000', new MeaningfulText(15)],
            'service_type' => 'required|in:web,ecommerce,branding,marketing,seo,email,other',
            'package_tier' => 'nullable|string|max:50',
            'status' => 'nullable|in:draft,pending,quoted,approved,in_progress,review,revision,completed,cancelled,on_hold',
            'budget' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'deadline' => 'nullable|date|after_or_equal:today',
            'start_date' => 'nullable|date',
            'meta' => 'nullable|array',
        ];

        if ($user->isAdmin()) {
            $rules['client_id'] = 'required|exists:users,id';
            $rules['lead_developer_id'] = 'nullable|exists:users,id';
        }

        $data = $request->validate($rules);

        if (!$user->isAdmin()) {
            $data['client_id'] = $user->id;
            $data['status'] = 'pending'; // user-created always starts pending
        }

        $project = Project::create($data);

        // Notify all active admins by email when a user submits a new request
        if (!$user->isAdmin()) {
            $project->loadMissing('client');
            $adminEmails = User::where('role', 'admin')->where('is_active', true)->pluck('email');
            if ($adminEmails->isNotEmpty()) {
                Mail::to($adminEmails->all())->send(new NewProjectAdminMail($project));
            }
        }

        return response()->json([
            'message' => 'تم إنشاء المشروع',
            'project' => $project->load(['client', 'leadDeveloper']),
        ], 201);
    }

    /**
     * GET /api/projects/{project}
     */
    public function show(Request $request, Project $project): JsonResponse
    {
        $this->authorize($request->user(), $project);

        $project->load([
            'client:id,name,email,company,avatar,phone',
            'leadDeveloper:id,name,email,avatar,skills',
            'members:id,name,email,avatar',
            'tasks' => fn($q) => $q->orderBy('order')->with('assignee:id,name,avatar'),
            'deliverables.uploader:id,name,avatar',
            'payments' => fn($q) => $q->latest()->limit(20),
            'invoices',
        ])->loadCount(['tasks', 'deliverables', 'payments']);

        return response()->json(['project' => $project]);
    }

    /**
     * PUT /api/projects/{project}
     */
    public function update(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();
        $this->authorize($user, $project, write: true);

        // Different fields are editable by different roles
        $rules = [
            'title' => ['sometimes', 'string', 'max:255', new MeaningfulText(3, requireMultipleWords: true)],
            'description' => ['sometimes', 'nullable', 'string', 'max:5000', new MeaningfulText(15)],
            'service_type' => 'sometimes|in:web,ecommerce,branding,marketing,seo,email,other',
            'meta' => 'sometimes|nullable|array',
        ];

        if ($user->isAdmin()) {
            $rules += [
                'client_id' => 'sometimes|exists:users,id',
                'lead_developer_id' => 'sometimes|nullable|exists:users,id',
                'status' => 'sometimes|in:draft,pending,quoted,approved,in_progress,review,revision,completed,cancelled,on_hold',
                'package_tier' => 'sometimes|nullable|string|max:50',
                'budget' => 'sometimes|nullable|numeric|min:0',
                'currency' => 'sometimes|nullable|string|size:3',
                'deadline' => 'sometimes|nullable|date',
                'start_date' => 'sometimes|nullable|date',
                'progress' => 'sometimes|integer|min:0|max:100',
            ];
        } elseif ($user->isDeveloper()) {
            // The assigned developer drives the project through its lifecycle:
            // pending_assignment → in_progress → review → revision → completed.
            $rules += [
                'status' => 'sometimes|in:in_progress,review,revision,completed',
                'progress' => 'sometimes|integer|min:0|max:100',
            ];
        }

        $data = $request->validate($rules);

        // Keep status ↔ progress in sync, whichever side changed:
        //  - marking the project completed snaps progress to 100%
        //  - dragging progress to 100% completes the project
        if (isset($data['status']) && $data['status'] === 'completed') {
            $data['progress'] = 100;
        } elseif (isset($data['progress']) && (int) $data['progress'] === 100 && ! isset($data['status'])) {
            $data['status'] = 'completed';
        }

        if (isset($data['status']) && $data['status'] === 'completed' && !$project->completed_at) {
            $data['completed_at'] = now();
        }

        $oldStatus = $project->status;
        $project->update($data);

        // Notify client if status changed
        if (isset($data['status']) && $data['status'] !== $oldStatus && $project->client) {
            $project->client->notify(new ProjectStatusChangedNotification($project, $oldStatus, $data['status']));
            Mail::to($project->client->email)->send(new ProjectStatusMail($project, $oldStatus, $data['status']));
        }

        return response()->json([
            'message' => 'تم تحديث المشروع',
            'project' => $project->fresh(['client', 'leadDeveloper']),
        ]);
    }

    /**
     * DELETE /api/projects/{project}  — admin only.
     */
    public function destroy(Request $request, Project $project): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'الحذف للأدمن فقط'], 403);
        }
        $project->delete();
        return response()->json(['message' => 'تم حذف المشروع']);
    }

    /**
     * POST /api/projects/{project}/members  — admin assigns a member.
     */
    public function addMember(Request $request, Project $project): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'sometimes|in:lead,contributor,reviewer',
        ]);
        $project->members()->syncWithoutDetaching([
            $data['user_id'] => ['role' => $data['role'] ?? 'contributor'],
        ]);
        return response()->json(['message' => 'تم إضافة العضو']);
    }

    public function removeMember(Request $request, Project $project, User $user): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $project->members()->detach($user->id);
        return response()->json(['message' => 'تم إزالة العضو']);
    }

    // ============================================
    // Helpers
    // ============================================
    protected function authorize(User $user, Project $project, bool $write = false): void
    {
        if ($user->isAdmin()) return;

        $hasAccess = $project->client_id === $user->id
            || $project->lead_developer_id === $user->id
            || $project->members()->where('user_id', $user->id)->exists();

        if (!$hasAccess) {
            abort(403, 'لا تقدر تشوف المشروع ده');
        }

        // Write checks
        if ($write && $user->isUser() && $project->client_id !== $user->id) {
            abort(403, 'لا تقدر تعدّل مشروع ليس لك');
        }
    }
}
