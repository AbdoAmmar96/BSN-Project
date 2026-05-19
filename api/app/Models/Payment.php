<?php

namespace App\Models;

use App\Mail\PaymentReceiptMail;
use App\Notifications\PaymentUpdateNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_REFUNDED = 'refunded';
    public const STATUS_EXPIRED = 'expired';

    public const GATEWAY_FAWRY = 'fawry';
    public const GATEWAY_PAYMOB_CARD = 'paymob_card';
    public const GATEWAY_PAYMOB_WALLET = 'paymob_wallet';
    public const GATEWAY_PAYMOB_INSTALLMENTS = 'paymob_installments';
    public const GATEWAY_KASHIER = 'kashier';
    public const GATEWAY_MANUAL = 'manual';

    protected $fillable = [
        'reference', 'invoice_id', 'project_id', 'user_id',
        'amount', 'currency',
        'gateway', 'gateway_transaction_id', 'gateway_order_id', 'status',
        'installment_provider', 'installment_months',
        'fawry_reference', 'fawry_expires_at',
        'card_last4', 'card_brand',
        'gateway_response', 'webhook_payload', 'hmac_verified',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fawry_expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'gateway_response' => 'array',
        'webhook_payload' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (Payment $payment) {
            if (empty($payment->reference)) {
                $payment->reference = 'BSN-PAY-' . strtoupper(Str::random(10));
            }
        });
    }

    // ============================================
    // STATUS HELPERS
    // ============================================
    public function isCompleted(): bool { return $this->status === self::STATUS_COMPLETED; }
    public function isPending(): bool { return in_array($this->status, [self::STATUS_PENDING, self::STATUS_PROCESSING]); }
    public function isFailed(): bool { return in_array($this->status, [self::STATUS_FAILED, self::STATUS_CANCELLED, self::STATUS_EXPIRED]); }

    public function markCompleted(array $gatewayData = []): void
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'paid_at' => now(),
            'gateway_response' => array_merge($this->gateway_response ?? [], $gatewayData),
        ]);

        // Update invoice
        if ($this->invoice_id) {
            $invoice = $this->invoice;
            $totalPaid = $invoice->payments()->where('status', self::STATUS_COMPLETED)->sum('amount');
            $invoice->status = $totalPaid >= $invoice->total ? 'paid' : 'partial';
            $invoice->save();
        }

        // Update project paid_amount
        if ($this->project_id) {
            $project = $this->project;
            $project->paid_amount = $project->payments()->where('status', self::STATUS_COMPLETED)->sum('amount');
            $project->save();
        }

        // Notify the client (in-app + email receipt)
        if ($this->user) {
            $this->user->notify(new PaymentUpdateNotification(
                'payment.success',
                'تم استلام دفعتك',
                "تم تأكيد دفع {$this->amount} {$this->currency}",
                ['payment_id' => $this->id, 'invoice_id' => $this->invoice_id, 'url' => '/dashboard/invoices/' . $this->invoice_id],
            ));
            Mail::to($this->user->email)->send(new PaymentReceiptMail($this->load('invoice', 'user')));
        }
    }

    public function markFailed(string $reason = null): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'gateway_response' => array_merge($this->gateway_response ?? [], ['failure_reason' => $reason]),
        ]);

        if ($this->user) {
            $this->user->notify(new PaymentUpdateNotification(
                'payment.failed',
                'فشل عملية الدفع',
                $reason ? "السبب: {$reason}" : 'حاول مرة تانية أو تواصل معانا',
                ['payment_id' => $this->id, 'invoice_id' => $this->invoice_id, 'url' => '/dashboard/invoices/' . $this->invoice_id],
            ));
        }
    }

    // ============================================
    // RELATIONS
    // ============================================
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }
}
