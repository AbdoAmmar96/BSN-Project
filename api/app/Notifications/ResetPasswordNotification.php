<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/')
            . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('🔐 إعادة ضبط كلمة المرور — ' . config('app.name'))
            ->greeting('أهلاً ' . ($notifiable->name ?? '') . '،')
            ->line('استلمنا طلب إعادة ضبط كلمة المرور لحسابك.')
            ->action('غيّر كلمة المرور', $url)
            ->line('الرابط ده صالح لمدة 60 دقيقة.')
            ->line('لو ما طلبتش إعادة ضبط، تجاهل الإيميل ده — كلمة المرور لسه آمنة.');
    }
}
