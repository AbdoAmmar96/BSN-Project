<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderAddon extends Model
{
    use HasFactory;

    protected $fillable = ['order_id', 'package_addon_id', 'price'];

    protected $casts = ['price' => 'decimal:2'];

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function addon(): BelongsTo { return $this->belongsTo(PackageAddon::class, 'package_addon_id'); }
}
