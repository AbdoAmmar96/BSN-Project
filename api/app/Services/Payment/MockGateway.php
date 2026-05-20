<?php

namespace App\Services\Payment;

use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Dev-only gateway that simulates a successful payment instantly. Used while the
 * real gateways (Paymob/Fawry/Kashier) aren't wired up yet, so the rest of the
 * flow (Payment::markCompleted → OrderObserver → project creation) can be
 * exercised end-to-end.
 *
 * Guarded by config('services.mock_payments.enabled'); never enable in prod.
 */
class MockGateway implements PaymentGatewayInterface
{
    public function name(): string
    {
        return 'mock';
    }

    public function initiate(Payment $payment, array $params = []): array
    {
        // Complete immediately — this fires the same side-effects a real
        // webhook would (invoice/project/order fulfilment).
        $payment->markCompleted([
            'mock' => true,
            'note' => 'Simulated payment (dev mode)',
            'completed_at' => now()->toIso8601String(),
        ]);

        return [
            'type' => 'success',
            'data' => ['payment_id' => $payment->id],
        ];
    }

    public function handleWebhook(Request $request): array
    {
        return ['ok' => true, 'status' => 'completed'];
    }

    public function checkStatus(Payment $payment): string
    {
        return $payment->status;
    }

    public function refund(Payment $payment, float $amount, string $reason = ''): array
    {
        $payment->update(['status' => Payment::STATUS_REFUNDED]);

        return ['ok' => true, 'refunded' => $amount];
    }
}
