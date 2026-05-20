<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class OrderAttachment extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'filename', 'original_name', 'mime_type', 'size', 'path'];

    protected $casts = ['size' => 'integer'];

    protected $appends = ['url'];

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
