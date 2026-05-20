<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number', 'project_id', 'user_id',
        'subtotal', 'tax', 'discount', 'total', 'currency',
        'status', 'issued_at', 'due_at', 'items', 'notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'issued_at' => 'date',
        'due_at' => 'date',
        'items' => 'array',
    ];

    // Expose computed paid/remaining in API responses.
    protected $appends = ['paid_amount', 'remaining_amount'];

    protected static function booted(): void
    {
        static::creating(function (Invoice $invoice) {
            if (empty($invoice->invoice_number)) {
                $prefix = config('app.invoice_prefix', 'BSN');
                $year = now()->format('Y');
                $count = static::whereYear('created_at', $year)->count() + 1;
                $invoice->invoice_number = sprintf('%s-%s-%04d', $prefix, $year, $count);
            }
        });
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getPaidAmountAttribute(): float
    {
        return (float) $this->payments()->where('status', 'completed')->sum('amount');
    }

    public function getRemainingAmountAttribute(): float
    {
        return (float) max(0, $this->total - $this->paid_amount);
    }
}
