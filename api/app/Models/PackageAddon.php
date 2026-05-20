<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageAddon extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_type', 'name_ar', 'name_en', 'price_type',
        'price_egp', 'price_sar', 'percentage', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'price_egp' => 'decimal:2',
        'price_sar' => 'decimal:2',
        'percentage' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Resolve the addon's price against a base package price + currency.
     * Percentage addons are computed from the package price; fixed addons
     * return their stored amount in the requested currency.
     */
    public function resolvePrice(float $packagePrice, string $currency = 'EGP'): float
    {
        if ($this->price_type === 'percentage') {
            return round($packagePrice * ((float) $this->percentage / 100), 2);
        }

        if ($currency === 'SAR' && $this->price_sar !== null) {
            return (float) $this->price_sar;
        }

        return (float) $this->price_egp;
    }
}
