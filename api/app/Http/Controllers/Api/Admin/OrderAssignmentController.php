<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Notifications\PaymentUpdateNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Flow E — the bridge between "payment received" and "project in execution".
 * A paid order does not auto-start; an admin reviews it here and assigns a
 * developer, which flips the project to active.
 */
class OrderAssignmentController extends Controller
{
    /** GET /api/v1/admin/orders — all orders, with a pending-assignment filter. */
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()
            ->with(['user:id,name,email', 'package:id,name', 'project:id,status', 'assignedDeveloper:id,name'])
            ->latest();

        if ($request->boolean('pending_assignment')) {
            $query->where('status', Order::STATUS_PAID)->whereNull('developer_assigned_at');
        } elseif ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        return response()->json($query->paginate($request->integer('per_page', 20)));
    }

    public function show(Order $order): JsonResponse
    {
        return response()->json([
            'order' => $order->load([
                'user:id,name,email,phone,company',
                'package', 'addons.addon', 'attachments', 'coupon',
                'project:id,slug,status,lead_developer_id',
                'assignedDeveloper:id,name',
            ]),
        ]);
    }

    /**
     * POST /api/v1/admin/orders/{order}/assign — accept the order and assign a
     * developer. Flips order→in_progress, project→active, joins the dev to the
     * project chat room, and notifies the developer + client.
     */
    public function assign(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate(['developer_id' => 'required|integer|exists:users,id']);

        $developer = User::find($data['developer_id']);
        if (! $developer || $developer->role !== User::ROLE_DEVELOPER || ! $developer->is_active) {
            return response()->json(['message' => 'لازم تختار developer نشط.'], 422);
        }
        if ($order->status !== Order::STATUS_PAID) {
            return response()->json(['message' => 'الطلب لازم يكون مدفوع قبل التعيين.'], 422);
        }
        if (! $order->project) {
            return response()->json(['message' => 'مفيش مشروع مرتبط بالطلب بعد.'], 422);
        }

        DB::transaction(function () use ($order, $developer, $request) {
            $order->update([
                'status' => Order::STATUS_IN_PROGRESS,
                'assigned_developer_id' => $developer->id,
                'assigned_by_admin_id' => $request->user()->id,
                'developer_assigned_at' => now(),
            ]);

            $project = $order->project;
            $project->update(['status' => 'active', 'lead_developer_id' => $developer->id]);

            // Add the developer to the project's chat room.
            $room = $project->chatRoom;
            if ($room) {
                $room->users()->syncWithoutDetaching([
                    $developer->id => ['role' => 'member', 'joined_at' => now()],
                ]);
            }
        });

        // Notify the developer + client.
        $developer->notify(new PaymentUpdateNotification(
            'project.assigned',
            'اتعيّنت على مشروع جديد',
            "تم تعيينك على مشروع: {$order->project->title}.",
            ['project_id' => $order->project_id, 'url' => '/dev/projects/' . $order->project_id],
        ));
        $order->user?->notify(new PaymentUpdateNotification(
            'project.started',
            'تم تعيين فريقك!',
            'مشروعك بدأ التنفيذ. تقدر تتابع التقدّم من لوحة التحكم.',
            ['project_id' => $order->project_id, 'url' => '/dashboard/projects/' . $order->project_id],
        ));

        return response()->json(['order' => $order->fresh(['assignedDeveloper:id,name', 'project:id,status,lead_developer_id'])]);
    }

    /** POST /api/v1/admin/orders/{order}/hold — keep paid, open clarification chat. */
    public function hold(Request $request, Order $order): JsonResponse
    {
        if ($order->status !== Order::STATUS_PAID) {
            return response()->json(['message' => 'يمكن تعليق الطلبات المدفوعة فقط.'], 422);
        }

        $order->user?->notify(new PaymentUpdateNotification(
            'order.hold',
            'محتاجين توضيح',
            'فريقنا محتاج بعض التفاصيل عن طلبك. تابع المحادثة من فضلك.',
            ['order_id' => $order->id, 'url' => '/dashboard/orders/' . $order->id],
        ));

        return response()->json(['message' => 'تم تعليق الطلب وإخطار العميل.']);
    }

    /** POST /api/v1/admin/orders/{order}/cancel — cancel + flag for manual refund. */
    public function cancel(Request $request, Order $order): JsonResponse
    {
        $request->validate(['reason' => 'sometimes|nullable|string|max:500']);

        if (in_array($order->status, [Order::STATUS_CANCELLED, Order::STATUS_REFUNDED], true)) {
            return response()->json(['message' => 'الطلب ملغي بالفعل.'], 422);
        }

        $order->update(['status' => Order::STATUS_CANCELLED]);

        $order->user?->notify(new PaymentUpdateNotification(
            'order.cancelled',
            'تم إلغاء طلبك',
            $request->input('reason') ?: 'تواصل معانا لو عندك أي استفسار.',
            ['order_id' => $order->id, 'url' => '/dashboard/orders/' . $order->id],
        ));

        return response()->json(['message' => 'تم إلغاء الطلب. الاسترداد يتم يدوياً.']);
    }
}
