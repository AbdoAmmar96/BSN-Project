<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectDeliverable;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectDeliverableController extends Controller
{
    /**
     * GET /api/projects/{project}/deliverables
     */
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorize($request->user(), $project);

        $items = $project->deliverables()
            ->with('uploader:id,name,avatar')
            ->latest()
            ->paginate(20);

        return response()->json(['data' => $items]);
    }

    /**
     * POST /api/projects/{project}/deliverables — upload a file.
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();
        $this->authorize($user, $project, upload: true);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'file' => 'required|file|max:51200', // 50MB
            'is_final' => 'sometimes|boolean',
        ]);

        $path = $request->file('file')->store("deliverables/{$project->id}", 'public');

        $deliverable = $project->deliverables()->create([
            'uploaded_by' => $user->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'file_path' => $path,
            'mime_type' => $request->file('file')->getMimeType(),
            'size' => $request->file('file')->getSize(),
            'is_final' => $data['is_final'] ?? false,
        ]);

        return response()->json([
            'message' => 'تم رفع الملف',
            'deliverable' => $deliverable->load('uploader:id,name,avatar'),
        ], 201);
    }

    /**
     * POST /api/deliverables/{deliverable}/approve — client approves.
     */
    public function approve(Request $request, ProjectDeliverable $deliverable): JsonResponse
    {
        $project = $deliverable->project;
        // Only the client (or admin) can approve
        if (!$request->user()->isAdmin() && $project->client_id !== $request->user()->id) {
            return response()->json(['message' => 'الاعتماد للعميل أو الأدمن فقط'], 403);
        }
        $deliverable->update(['approved_at' => now()]);
        return response()->json(['message' => 'تم الاعتماد', 'deliverable' => $deliverable]);
    }

    /**
     * DELETE /api/deliverables/{deliverable}
     */
    public function destroy(Request $request, ProjectDeliverable $deliverable): JsonResponse
    {
        $project = $deliverable->project;
        $this->authorize($request->user(), $project, upload: true);

        Storage::disk('public')->delete($deliverable->file_path);
        $deliverable->delete();

        return response()->json(['message' => 'تم الحذف']);
    }

    protected function authorize(User $user, Project $project, bool $upload = false): void
    {
        if ($user->isAdmin()) return;
        $hasAccess = $project->client_id === $user->id
            || $project->lead_developer_id === $user->id
            || $project->members()->where('user_id', $user->id)->exists();
        if (!$hasAccess) abort(403);

        // Only devs/admin can upload
        if ($upload && $user->isUser()) abort(403, 'العملاء يستلموا فقط');
    }
}
