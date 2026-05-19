<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectTask;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectTaskController extends Controller
{
    /**
     * GET /api/projects/{project}/tasks
     */
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize($request->user(), $project);

        $tasks = $project->tasks()
            ->with('assignee:id,name,avatar')
            ->orderBy('order')
            ->orderByRaw("FIELD(priority, 'urgent','high','normal','low')")
            ->get()
            ->groupBy('status');

        return response()->json([
            'tasks' => $tasks,
            'counts' => [
                'todo' => $project->tasks()->where('status', 'todo')->count(),
                'in_progress' => $project->tasks()->where('status', 'in_progress')->count(),
                'review' => $project->tasks()->where('status', 'review')->count(),
                'done' => $project->tasks()->where('status', 'done')->count(),
            ],
        ]);
    }

    /**
     * GET /api/dev/tasks — current dev's tasks across all projects
     */
    public function mine(Request $request): JsonResponse
    {
        $user = $request->user();

        $tasks = ProjectTask::with(['project:id,title,slug', 'assignee:id,name,avatar'])
            ->where('assigned_to', $user->id)
            ->orderByRaw("FIELD(status, 'in_progress','review','todo','done')")
            ->orderByRaw("FIELD(priority, 'urgent','high','normal','low')")
            ->orderBy('due_date')
            ->paginate(20);

        return response()->json(['data' => $tasks]);
    }

    /**
     * POST /api/projects/{project}/tasks
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize($request->user(), $project, write: true);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'nullable|in:todo,in_progress,review,done',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'due_date' => 'nullable|date',
        ]);

        $data['order'] = $project->tasks()->max('order') + 1;

        $task = $project->tasks()->create($data);

        return response()->json([
            'message' => 'تم إنشاء المهمة',
            'task' => $task->load('assignee:id,name,avatar'),
        ], 201);
    }

    /**
     * PUT /api/tasks/{task}
     */
    public function update(Request $request, ProjectTask $task): JsonResponse
    {
        $this->authorize($request->user(), $task->project, write: true);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:5000',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
            'status' => 'sometimes|in:todo,in_progress,review,done',
            'priority' => 'sometimes|in:low,normal,high,urgent',
            'due_date' => 'sometimes|nullable|date',
            'order' => 'sometimes|integer',
        ]);

        if (isset($data['status']) && $data['status'] === 'done' && !$task->completed_at) {
            $data['completed_at'] = now();
        }

        $task->update($data);

        return response()->json([
            'message' => 'تم التحديث',
            'task' => $task->fresh('assignee:id,name,avatar'),
        ]);
    }

    /**
     * DELETE /api/tasks/{task}
     */
    public function destroy(Request $request, ProjectTask $task): JsonResponse
    {
        $this->authorize($request->user(), $task->project, write: true);
        $task->delete();
        return response()->json(['message' => 'تم الحذف']);
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

        if (!$hasAccess) abort(403);

        // Only admin/devs can modify tasks
        if ($write && $user->isUser()) abort(403, 'العملاء لا يقدروا يعدّلوا المهام');
    }
}
