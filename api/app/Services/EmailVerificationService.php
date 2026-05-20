<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Issues and consumes one-time email-verification tokens. The raw token is
 * only ever sent in the email; the database stores its SHA-256 hash.
 */
class EmailVerificationService
{
    public const TTL_HOURS = 24;

    /**
     * Generate a fresh token for the user, persist its hash, and email the
     * verification link pointing at the SPA.
     */
    public function sendLink(User $user): void
    {
        // Clear any prior tokens so only the newest link works.
        DB::table('email_verification_tokens')->where('user_id', $user->id)->delete();

        $raw = Str::random(64);

        DB::table('email_verification_tokens')->insert([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $raw),
            'expires_at' => now()->addHours(self::TTL_HOURS),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $frontend = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');
        $verifyUrl = "{$frontend}/verify-email?token={$raw}&id={$user->id}";

        Mail::to($user->email)->send(new EmailVerificationMail($user, $verifyUrl));
    }

    /**
     * Validate the raw token for a user. On success marks the user verified,
     * deletes the token, and returns true. Returns false on any mismatch.
     */
    public function verify(int $userId, string $rawToken): bool
    {
        $row = DB::table('email_verification_tokens')
            ->where('user_id', $userId)
            ->where('token_hash', hash('sha256', $rawToken))
            ->first();

        if (! $row) {
            return false;
        }

        if (now()->greaterThan($row->expires_at)) {
            DB::table('email_verification_tokens')->where('id', $row->id)->delete();
            return false;
        }

        User::where('id', $userId)->update(['email_verified_at' => now()]);
        DB::table('email_verification_tokens')->where('user_id', $userId)->delete();

        return true;
    }
}
