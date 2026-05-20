<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserOnboarding extends Model
{
    use HasFactory;

    protected $table = 'user_onboarding';

    protected $fillable = ['user_id', 'looking_for', 'company_name', 'team_size', 'completed'];

    protected $casts = ['completed' => 'boolean'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
