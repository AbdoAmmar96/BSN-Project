<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use App\Models\Message;
use App\Models\MessageRead;
use App\Models\Project;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;

class ChatController extends Controller
{
    /**
     * GET /api/chat/rooms — list rooms the user belongs to.
     */
    public function rooms(Request $request): JsonResponse
    {
        $user = $request->user();

        $rooms = $user->chatRooms()
            ->with([
                'project:id,title,slug,service_type',
                'lastMessage.sender:id,name,avatar',
                'users:id,name,avatar,role',
            ])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function (ChatRoom $room) use ($user) {
                return [
                    'id' => $room->id,
                    'name' => $this->roomDisplayName($room, $user),
                    'type' => $room->type,
                    'avatar' => $this->roomDisplayAvatar($room, $user),
                    'project' => $room->project,
                    'last_message' => $room->lastMessage ? [
                        'body' => $room->lastMessage->body,
                        'type' => $room->lastMessage->type,
                        'sender_name' => $room->lastMessage->sender?->name,
                        'created_at' => $room->lastMessage->created_at?->toIso8601String(),
                    ] : null,
                    'unread_count' => $room->unreadCountForUser($user->id),
                    'members_count' => $room->users()->count(),
                    'updated_at' => $room->last_message_at?->toIso8601String() ?? $room->updated_at->toIso8601String(),
                ];
            });

        return response()->json(['data' => $rooms]);
    }

    /**
     * GET /api/chat/rooms/{room} — single room with recent messages.
     */
    public function show(Request $request, ChatRoom $room): JsonResponse
    {
        $this->authorize($request->user(), $room);

        $messages = $room->messages()
            ->with('sender:id,name,avatar', 'replyTo.sender:id,name,avatar')
            ->latest()
            ->limit(50)
            ->get()
            ->reverse()
            ->values();

        // Mark room as read
        $room->users()->updateExistingPivot($request->user()->id, [
            'last_read_at' => now(),
        ]);

        return response()->json([
            'room' => $room->load([
                'project:id,title,slug,service_type',
                'users:id,name,avatar,role',
            ]),
            'messages' => $messages,
        ]);
    }

    /**
     * POST /api/chat/rooms/project/{project} — get or create project's room.
     */
    public function projectRoom(Request $request, Project $project): JsonResponse
    {
        $user = $request->user();

        // Authorize access to project
        $hasAccess = $user->isAdmin()
            || $project->client_id === $user->id
            || $project->lead_developer_id === $user->id
            || $project->members()->where('user_id', $user->id)->exists();
        if (!$hasAccess) abort(403);

        $room = ChatRoom::firstOrCreate(
            ['project_id' => $project->id, 'type' => 'project'],
            [
                'name' => $project->title,
                'created_by' => $user->id,
                'last_message_at' => now(),
            ]
        );

        // Sync members: client + lead developer + project members
        $memberIds = collect([$project->client_id, $project->lead_developer_id])
            ->filter()
            ->concat($project->members()->pluck('user_id'))
            ->unique()
            ->values()
            ->all();

        foreach ($memberIds as $uid) {
            $room->users()->syncWithoutDetaching([
                $uid => ['role' => 'member', 'joined_at' => now()],
            ]);
        }

        return response()->json([
            'room' => $room->load([
                'project:id,title,slug,service_type',
                'users:id,name,avatar,role',
            ]),
        ]);
    }

    /**
     * POST /api/chat/rooms/direct/{user} — get or create direct room with another user.
     */
    public function directRoom(Request $request, User $other): JsonResponse
    {
        $user = $request->user();

        if ($user->id === $other->id) {
            return response()->json(['message' => 'لا تقدر تكلم نفسك'], 422);
        }

        // Find room where both users are members and type=direct
        $room = ChatRoom::query()
            ->where('type', 'direct')
            ->whereNull('project_id')
            ->whereHas('users', fn($q) => $q->where('users.id', $user->id))
            ->whereHas('users', fn($q) => $q->where('users.id', $other->id))
            ->first();

        if (!$room) {
            $room = ChatRoom::create([
                'type' => 'direct',
                'created_by' => $user->id,
                'last_message_at' => now(),
            ]);
            $room->users()->attach([
                $user->id => ['role' => 'member', 'joined_at' => now()],
                $other->id => ['role' => 'member', 'joined_at' => now()],
            ]);
        }

        return response()->json([
            'room' => $room->load('users:id,name,avatar,role'),
        ]);
    }

    /**
     * POST /api/chat/support — open a support ticket (creates a support room
     * with the first available admin and posts the initial message).
     */
    public function supportTicket(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'subject' => 'required|string|max:120',
            'body' => 'required|string|max:5000',
        ]);

        $admin = User::where('role', 'admin')
            ->where('is_active', true)
            ->where('id', '!=', $user->id)
            ->orderBy('id')
            ->first();

        if (!$admin) {
            return response()->json(['message' => 'مفيش أدمن متاح حالياً'], 503);
        }

        $room = ChatRoom::create([
            'type' => 'support',
            'name' => $data['subject'],
            'created_by' => $user->id,
            'last_message_at' => now(),
        ]);

        $room->users()->attach([
            $user->id => ['role' => 'member', 'joined_at' => now()],
            $admin->id => ['role' => 'admin', 'joined_at' => now()],
        ]);

        $message = $room->messages()->create([
            'user_id' => $user->id,
            'type' => 'text',
            'body' => $data['body'],
        ]);

        $room->update(['last_message_at' => $message->created_at]);

        return response()->json([
            'room' => $room->load('users:id,name,avatar,role'),
        ], 201);
    }

    /**
     * GET /api/chat/rooms/{room}/messages — paginated message history.
     */
    public function messages(Request $request, ChatRoom $room): JsonResponse
    {
        $this->authorize($request->user(), $room);

        $query = $room->messages()
            ->with('sender:id,name,avatar', 'replyTo.sender:id,name,avatar')
            ->latest();

        // Load older messages via 'before' param (cursor)
        if ($before = $request->query('before_id')) {
            $query->where('id', '<', $before);
        }

        $messages = $query->limit(30)->get()->reverse()->values();

        return response()->json([
            'data' => $messages,
            'has_more' => $messages->count() === 30,
        ]);
    }

    /**
     * POST /api/chat/rooms/{room}/messages — send a message.
     */
    public function send(Request $request, ChatRoom $room): JsonResponse
    {
        $this->authorize($request->user(), $room);

        // Whitelist of safe MIME types + matching extensions
        $allowedMimes = [
            // Images
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            // Documents
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'text/csv',
            // Archives
            'application/zip',
        ];
        $allowedExts = 'jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt,csv,zip';

        $data = $request->validate([
            'body' => 'required_without:attachment|nullable|string|max:5000',
            'reply_to_id' => 'nullable|exists:messages,id',
            'attachment' => [
                'nullable', 'file', 'max:10240', // 10MB
                'mimetypes:' . implode(',', $allowedMimes),
                'mimes:' . $allowedExts,
            ],
        ]);

        $messageData = [
            'user_id' => $request->user()->id,
            'reply_to_id' => $data['reply_to_id'] ?? null,
            'body' => $data['body'] ?? null,
            'type' => 'text',
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');

            // Defense-in-depth: re-check MIME (validation should catch but verify)
            $mime = $file->getMimeType();
            if (!in_array($mime, $allowedMimes, true)) {
                abort(422, 'نوع الملف غير مسموح');
            }

            // Sanitize the displayed filename — keep original for UX but strip path
            $rawName = $file->getClientOriginalName();
            $safeName = preg_replace('/[\/\\\\\x00-\x1F]/', '_', basename($rawName));
            $safeName = mb_substr($safeName, 0, 200);

            // Storage path uses a Laravel-generated random hash (no user input)
            $path = $file->store("chat/{$room->id}", 'public');

            $messageData['attachment_path'] = $path;
            $messageData['attachment_name'] = $safeName;
            $messageData['attachment_mime'] = $mime;
            $messageData['attachment_size'] = $file->getSize();
            $messageData['type'] = str_starts_with($mime, 'image/') ? 'image' : 'file';
        }

        $message = $room->messages()->create($messageData);

        // Update room's last activity
        $room->update(['last_message_at' => now()]);

        // Mark sender's own message as read
        $room->users()->updateExistingPivot($request->user()->id, ['last_read_at' => now()]);

        // Broadcast (best-effort — a down WebSocket server must not fail the send)
        try {
            broadcast(new MessageSent($message))->toOthers();
        } catch (\Throwable $e) {
            report($e);
        }

        // Notify other room members (excluding sender)
        $recipients = $room->users()
            ->where('users.id', '!=', $request->user()->id)
            ->get();
        if ($recipients->isNotEmpty()) {
            Notification::send($recipients, new NewMessageNotification($message->load('sender')));
        }

        return response()->json([
            'message' => $message->load('sender:id,name,avatar'),
        ], 201);
    }

    /**
     * POST /api/chat/rooms/{room}/read — mark room as read.
     */
    public function markRead(Request $request, ChatRoom $room): JsonResponse
    {
        $this->authorize($request->user(), $room);
        $room->users()->updateExistingPivot($request->user()->id, ['last_read_at' => now()]);
        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/chat/rooms/{room}/typing — broadcast typing event.
     */
    public function typing(Request $request, ChatRoom $room): JsonResponse
    {
        $this->authorize($request->user(), $room);
        $isTyping = (bool) $request->input('is_typing', true);
        try {
            broadcast(new UserTyping($room->id, $request->user(), $isTyping))->toOthers();
        } catch (\Throwable $e) {
            report($e);
        }
        return response()->json(['ok' => true]);
    }

    /**
     * DELETE /api/chat/messages/{message} — delete own message.
     */
    public function deleteMessage(Request $request, Message $message): JsonResponse
    {
        if ($message->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            abort(403);
        }
        $message->delete();
        return response()->json(['ok' => true]);
    }

    // ============================================
    // Helpers
    // ============================================
    protected function authorize(User $user, ChatRoom $room): void
    {
        // Membership is the ONLY gate — admins must be explicitly added to a
        // room (which happens automatically for project + support rooms) to
        // view it. This protects private direct messages from being read by
        // any admin account.
        $isMember = $room->users()->where('users.id', $user->id)->exists();
        if (!$isMember) abort(403, 'مش عضو في المحادثة دي');
    }

    protected function roomDisplayName(ChatRoom $room, User $user): string
    {
        if ($room->type === 'project') return $room->project?->title ?? $room->name ?? 'مشروع';
        if ($room->type === 'direct') {
            $other = $room->users->where('id', '!=', $user->id)->first();
            return $other?->name ?? 'محادثة';
        }
        return $room->name ?? 'محادثة';
    }

    protected function roomDisplayAvatar(ChatRoom $room, User $user): ?string
    {
        if ($room->type === 'direct') {
            $other = $room->users->where('id', '!=', $user->id)->first();
            return $other?->avatar;
        }
        return null;
    }
}
