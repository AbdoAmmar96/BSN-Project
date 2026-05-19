<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $fillable = [
        'service_type', 'name', 'price', 'currency', 'price_prefix',
        'period', 'note', 'features', 'featured', 'ribbon',
        'sort_order', 'is_active',
    ];

    protected $casts = [
        'features' => 'array',
        'featured' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
    ];
}
