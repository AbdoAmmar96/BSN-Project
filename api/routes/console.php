<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Daily at 09:00 Cairo: invoice reminders 3 days before due
Schedule::command('invoices:send-reminders --days=3')
    ->dailyAt('09:00')
    ->timezone('Africa/Cairo');
