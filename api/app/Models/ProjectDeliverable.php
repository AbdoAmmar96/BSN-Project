<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectDeliverable extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 'uploaded_by', 'title', 'description',
        'file_path', 'mime_type', 'size', 'is_final', 'approved_at',
    ];

    protected $casts = [
        'is_final' => 'boolean',
        'approved_at' => 'datetime',
    ];

    protected $appends = ['file_url', 'size_human'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function getFileUrlAttribute(): string
    {
        return asset('storage/' . $this->file_path);
    }

    public function getSizeHumanAttribute(): string
    {
        $bytes = $this->size;
        if ($bytes >= 1024 * 1024) return round($bytes / 1024 / 1024, 2) . ' MB';
        if ($bytes >= 1024) return round($bytes / 1024, 2) . ' KB';
        return $bytes . ' B';
    }
}
