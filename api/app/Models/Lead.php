<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasFactory;

    public const STATUS_NEW = 'new';
    public const STATUS_REVIEWING = 'reviewing';
    public const STATUS_QUOTED = 'quoted';
    public const STATUS_WON = 'won';
    public const STATUS_LOST = 'lost';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'lead_number', 'user_id', 'service_type', 'status', 'title', 'description',
        'smart_answers', 'budget_min_egp', 'budget_max_egp', 'deadline', 'assigned_admin_id',
    ];

    protected $casts = [
        'smart_answers' => 'array',
        'budget_min_egp' => 'decimal:2',
        'budget_max_egp' => 'decimal:2',
        'deadline' => 'date',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function assignedAdmin(): BelongsTo { return $this->belongsTo(User::class, 'assigned_admin_id'); }
    public function quotes(): HasMany { return $this->hasMany(Quote::class); }

    public function latestQuote()
    {
        return $this->hasOne(Quote::class)->latestOfMany('version');
    }
}
