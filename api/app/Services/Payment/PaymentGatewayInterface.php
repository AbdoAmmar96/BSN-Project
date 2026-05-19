<?php

namespace App\Services\Payment;

use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Unified contract that every payment gateway (Fawry, Paymob, Kashier) implements.
 * This is the strategy pattern — controllers don't care which gateway they're talking to.
 */
interface PaymentGatewayInterface
{
    /**
     * Initiate payment — returns data needed by frontend to complete checkout.
     * The shape varies per gateway:
     *  - Fawry: returns a reference number to display
     *  - Paymob: returns an iframe URL or wallet redirect
     *  - Kashier: returns a hosted-payment URL
     *
     * @return array  ['type' => 'redirect|iframe|reference', 'data' => mixed]
     */
    public function initiate(Payment $payment, array $params = []): array;

    /**
     * Verify a webhook callback from the gateway.
     * Validates signatures/HMAC and updates payment status.
     */
    public function handleWebhook(Request $request): array;

    /**
     * Check payment status by querying the gateway directly.
     * Useful for reconciliation when webhooks are missed.
     */
    public function checkStatus(Payment $payment): string;

    /**
     * Issue a refund.
     */
    public function refund(Payment $payment, float $amount, string $reason = ''): array;

    /**
     * Gateway identifier (matches Payment::GATEWAY_* constants).
     */
    public function name(): string;
}
