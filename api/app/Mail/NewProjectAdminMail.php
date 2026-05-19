<?php

namespace App\Mail;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewProjectAdminMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Project $project) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🚀 طلب مشروع جديد: ' . $this->project->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.new-project-admin',
            with: [
                'project' => $this->project,
                'client' => $this->project->client,
                'adminUrl' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')) . '/admin/projects/' . $this->project->id,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
