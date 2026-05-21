<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortfolioWork extends Model
{
    protected $fillable = [
        'title', 'company_ar', 'url', 'tag', 'description',
        'tech', 'category', 'image_path', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'tech' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['image_url'];

    /**
     * Full URL for the uploaded screenshot, or null when the admin hasn't
     * uploaded one (the frontend then falls back to an auto site screenshot).
     */
    public function getImageUrlAttribute(): ?string
    {
        if (! $this->image_path) {
            return null;
        }

        return str_starts_with($this->image_path, 'http')
            ? $this->image_path
            : asset('storage/' . $this->image_path);
    }
}
