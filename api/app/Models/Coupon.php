<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'discount_type', 'discount_value', 'max_discount_egp',
        'usage_limit', 'usage_count', 'per_user_limit',
        'applies_to_services', 'is_active', 'starts_at', 'expires_at',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'max_discount_egp' => 'decimal:2',
        'applies_to_services' => 'array',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Is the coupon usable right now (active, within window, under global cap)?
     */
    public function isRedeemable(): bool
    {
        if (! $this->is_active) {
            return false;
        }
        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        if ($this->usage_limit !== null && $this->usage_count >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    public function appliesToService(?string $serviceType): bool
    {
        if (empty($this->applies_to_services)) {
            return true; // null/empty = all services
        }

        return in_array($serviceType, $this->applies_to_services, true);
    }

    /**
     * Compute the discount amount for a given subtotal, honoring the
     * percentage ceiling when set.
     */
    public function discountFor(float $subtotal): float
    {
        if ($this->discount_type === 'percentage') {
            $amount = $subtotal * ((float) $this->discount_value / 100);
            if ($this->max_discount_egp !== null) {
                $amount = min($amount, (float) $this->max_discount_egp);
            }
        } else {
            $amount = (float) $this->discount_value;
        }

        return round(min($amount, $subtotal), 2);
    }
}
