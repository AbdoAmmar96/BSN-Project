<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProjectStatusChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Project $project,
        public ?string $oldStatus,
        public string $newStatus,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $labels = [
            'draft' => 'مسودة',
            'pending' => 'في الانتظار',
            'quoted' => 'تم إرسال عرض السعر',
            'approved' => 'تمت الموافقة',
            'in_progress' => 'جاري العمل',
            'review' => 'قيد المراجعة',
            'revision' => 'مراجعة وتعديلات',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغي',
            'on_hold' => 'موقّف مؤقتاً',
        ];

        $from = $labels[$this->oldStatus] ?? $this->oldStatus;
        $to = $labels[$this->newStatus] ?? $this->newStatus;

        return [
            'kind' => 'project.status',
            'title' => 'تحديث حالة مشروع: ' . $this->project->title,
            'body' => $this->oldStatus
                ? "تغيّرت الحالة من \"{$from}\" إلى \"{$to}\""
                : "الحالة الحالية: {$to}",
            'project_id' => $this->project->id,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'url' => '/dashboard/projects/' . $this->project->id,
        ];
    }
}
