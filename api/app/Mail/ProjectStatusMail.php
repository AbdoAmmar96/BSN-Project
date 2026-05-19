<?php

namespace App\Mail;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProjectStatusMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public const LABELS = [
        'draft' => 'مسودة',
        'pending' => 'في الانتظار',
        'quoted' => 'تم إرسال عرض السعر',
        'approved' => 'تمت الموافقة',
        'in_progress' => 'جاري العمل',
        'review' => 'قيد المراجعة',
        'revision' => 'مراجعة وتعديلات',
        'completed' => 'مكتمل ✓',
        'cancelled' => 'ملغي',
        'on_hold' => 'موقّف مؤقتاً',
    ];

    public function __construct(
        public Project $project,
        public ?string $oldStatus,
        public string $newStatus,
    ) {}

    public function envelope(): Envelope
    {
        $label = self::LABELS[$this->newStatus] ?? $this->newStatus;

        return new Envelope(
            subject: '📋 ' . $this->project->title . ' — ' . $label,
        );
    }

    public function content(): Content
    {
        $projectUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'))
            . '/dashboard/projects/' . $this->project->id;

        return new Content(
            markdown: 'emails.project-status',
            with: [
                'project' => $this->project,
                'client' => $this->project->client,
                'oldLabel' => $this->oldStatus ? (self::LABELS[$this->oldStatus] ?? $this->oldStatus) : null,
                'newLabel' => self::LABELS[$this->newStatus] ?? $this->newStatus,
                'projectUrl' => $projectUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
