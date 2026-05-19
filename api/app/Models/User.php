<?php

namespace App\Models;

use App\Notifications\ResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_DEVELOPER = 'developer';
    public const ROLE_USER = 'user';

    protected $fillable = [
        'name', 'email', 'password', 'role',
        'phone', 'avatar', 'company', 'position', 'bio', 'skills',
        'locale', 'is_active',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'last_seen_at' => 'datetime',
        'skills' => 'array',
        'is_active' => 'boolean',
    ];

    protected $appends = ['avatar_url'];

    // ============================================
    // ROLE HELPERS
    // ============================================
    public function isAdmin(): bool       { return $this->role === self::ROLE_ADMIN; }
    public function isDeveloper(): bool   { return $this->role === self::ROLE_DEVELOPER; }
    public function isUser(): bool        { return $this->role === self::ROLE_USER; }

    public function hasRole(string|array $roles): bool
    {
        return in_array($this->role, (array) $roles);
    }

    // ============================================
    // ACCESSORS
    // ============================================
    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return str_starts_with($this->avatar, 'http')
                ? $this->avatar
                : asset('storage/' . $this->avatar);
        }
        // Generate from initials via DiceBear or similar
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=5C15CC&color=fff&bold=true';
    }

    // ============================================
    // RELATIONS
    // ============================================

    // Client relations
    public function projectsAsClient(): HasMany
    {
        return $this->hasMany(Project::class, 'client_id');
    }

    // Developer relations
    public function projectsAsLead(): HasMany
    {
        return $this->hasMany(Project::class, 'lead_developer_id');
    }

    public function projectsAsMember(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function assignedTasks(): HasMany
    {
        return $this->hasMany(ProjectTask::class, 'assigned_to');
    }

    // Payment relations
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    // Chat relations
    public function chatRooms(): BelongsToMany
    {
        return $this->belongsToMany(ChatRoom::class, 'chat_room_users')
            ->withPivot('role', 'last_read_at', 'joined_at', 'left_at', 'is_muted')
            ->whereNull('chat_room_users.left_at');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    // ============================================
    // SCOPES
    // ============================================
    public function scopeActive($query) { return $query->where('is_active', true); }
    public function scopeRole($query, string $role) { return $query->where('role', $role); }

    /**
     * Send the password reset email via our custom Arabic notification
     * (links to the frontend SPA instead of the API).
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
