<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id', 'lead_developer_id', 'title', 'slug', 'description',
        'service_type', 'package_tier', 'status',
        'budget', 'currency', 'paid_amount',
        'start_date', 'deadline', 'completed_at',
        'progress', 'meta',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'start_date' => 'date',
        'deadline' => 'date',
        'completed_at' => 'date',
        'meta' => 'array',
    ];

    protected $appends = ['remaining_amount', 'is_overdue'];

    protected static function booted(): void
    {
        static::creating(function (Project $project) {
            if (empty($project->slug)) {
                $project->slug = Str::slug($project->title) . '-' . Str::random(6);
            }
        });
    }

    // ============================================
    // ACCESSORS
    // ============================================
    public function getRemainingAmountAttribute(): float
    {
        return (float) ($this->budget - $this->paid_amount);
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->deadline && $this->deadline->isPast()
            && !in_array($this->status, ['completed', 'cancelled']);
    }

    // ============================================
    // RELATIONS
    // ============================================
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function leadDeveloper(): BelongsTo
    {
        return $this->belongsTo(User::class, 'lead_developer_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class);
    }

    public function deliverables(): HasMany
    {
        return $this->hasMany(ProjectDeliverable::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function chatRoom(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ChatRoom::class)->where('type', 'project');
    }

    public function order(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Order::class);
    }

    // ============================================
    // SCOPES
    // ============================================
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['completed', 'cancelled']);
    }

    public function scopeForUser($query, User $user)
    {
        if ($user->isAdmin()) {
            return $query;
        }
        if ($user->isDeveloper()) {
            return $query->where(function ($q) use ($user) {
                $q->where('lead_developer_id', $user->id)
                  ->orWhereHas('members', fn($m) => $m->where('user_id', $user->id));
            });
        }
        return $query->where('client_id', $user->id);
    }
}
