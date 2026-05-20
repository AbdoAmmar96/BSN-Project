<?php

namespace App\Models;

use App\Observers\OrderObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[ObservedBy(OrderObserver::class)]
class Order extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_PENDING_PAYMENT = 'pending_payment';
    public const STATUS_PAID = 'paid';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REFUNDED = 'refunded';

    protected $fillable = [
        'order_number', 'user_id', 'package_id', 'bundle_id', 'coupon_id', 'status',
        'currency', 'package_price', 'addons_total', 'subtotal', 'discount', 'total',
        'deposit_amount', 'remaining_amount',
        'project_name', 'description', 'expected_launch_date',
        'invoice_id', 'project_id',
        'paid_at', 'assigned_developer_id', 'assigned_by_admin_id', 'developer_assigned_at',
    ];

    protected $casts = [
        'package_price' => 'decimal:2',
        'addons_total' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'expected_launch_date' => 'date',
        'paid_at' => 'datetime',
        'developer_assigned_at' => 'datetime',
    ];

    // ============================================
    // RELATIONS
    // ============================================
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function package(): BelongsTo { return $this->belongsTo(Package::class); }
    public function bundle(): BelongsTo { return $this->belongsTo(Bundle::class); }
    public function coupon(): BelongsTo { return $this->belongsTo(Coupon::class); }
    public function invoice(): BelongsTo { return $this->belongsTo(Invoice::class); }
    public function project(): BelongsTo { return $this->belongsTo(Project::class); }
    public function assignedDeveloper(): BelongsTo { return $this->belongsTo(User::class, 'assigned_developer_id'); }
    public function assignedByAdmin(): BelongsTo { return $this->belongsTo(User::class, 'assigned_by_admin_id'); }

    public function addons(): HasMany { return $this->hasMany(OrderAddon::class); }
    public function attachments(): HasMany { return $this->hasMany(OrderAttachment::class); }
    public function payments(): HasMany { return $this->hasMany(Payment::class); }

    // ============================================
    // HELPERS
    // ============================================
    public function isPaid(): bool { return in_array($this->status, [self::STATUS_PAID, self::STATUS_IN_PROGRESS, self::STATUS_COMPLETED], true); }
    public function awaitingAssignment(): bool { return $this->status === self::STATUS_PAID && $this->developer_assigned_at === null; }
}
