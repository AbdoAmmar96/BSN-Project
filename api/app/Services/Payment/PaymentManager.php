<?php

namespace App\Services\Payment;

use App\Models\Payment;
use InvalidArgumentException;

/**
 * Resolves the appropriate gateway implementation given a Payment.
 * Used by PaymentController so it doesn't care which gateway it's talking to.
 */
class PaymentManager
{
    public function for(Payment|string $paymentOrGateway): PaymentGatewayInterface
    {
        $gateway = $paymentOrGateway instanceof Payment
            ? $paymentOrGateway->gateway
            : $paymentOrGateway;

        // All Paymob variants share one service
        if (str_starts_with($gateway, 'paymob')) {
            return new PaymobService();
        }

        return match ($gateway) {
            'fawry' => new FawryService(),
            'kashier' => new KashierService(),
            'mock' => new MockGateway(),
            default => throw new InvalidArgumentException("Unknown gateway: {$gateway}"),
        };
    }

    /**
     * Initiate payment — wraps gateway selection + parameter mapping.
     */
    public function initiate(Payment $payment, array $params = []): array
    {
        $service = $this->for($payment);

        // Map gateway to method for Paymob
        if ($payment->gateway === Payment::GATEWAY_PAYMOB_CARD) $params['method'] = 'card';
        if ($payment->gateway === Payment::GATEWAY_PAYMOB_WALLET) $params['method'] = 'wallet';
        if ($payment->gateway === Payment::GATEWAY_PAYMOB_INSTALLMENTS) $params['method'] = 'installments';

        return $service->initiate($payment, $params);
    }
}
