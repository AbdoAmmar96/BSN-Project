<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'service_type', 'name', 'slug', 'price', 'price_sar', 'delivery_days',
        'currency', 'price_prefix', 'period', 'note', 'description_ar', 'description_en',
        'features', 'featured', 'ribbon', 'sort_order', 'is_active',
    ];

    protected static function booted(): void
    {
        // Auto-generate a unique slug when one isn't supplied (the column is
        // NOT NULL + unique). Random suffix avoids collisions on same names.
        static::creating(function (Package $package) {
            if (empty($package->slug)) {
                $package->slug = Str::slug($package->name) . '-' . Str::lower(Str::random(6));
            }
        });
    }

    protected $casts = [
        'features' => 'array',
        'featured' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'price_sar' => 'decimal:2',
        'delivery_days' => 'integer',
    ];

    /**
     * Addons available for this package's service type (or "any").
     */
    public function addons(): HasMany
    {
        return $this->hasMany(PackageAddon::class, 'service_type', 'service_type');
    }

    public function bundles(): BelongsToMany
    {
        return $this->belongsToMany(Bundle::class, 'bundle_packages')->withTimestamps();
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Price in the requested currency, falling back to EGP when SAR is unset.
     */
    public function priceIn(string $currency = 'EGP'): float
    {
        if ($currency === 'SAR' && $this->price_sar !== null) {
            return (float) $this->price_sar;
        }

        return (float) $this->price;
    }
}
