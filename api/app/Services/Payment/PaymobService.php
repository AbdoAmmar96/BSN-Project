<?php

namespace App\Services\Payment;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Paymob (Accept) integration.
 *
 * Flow:
 *  1. Authenticate → get auth_token
 *  2. Register order → get order_id
 *  3. Request payment key (per integration: card / wallet / installments)
 *  4. Frontend uses the iframe with that key OR redirects to wallet/installments
 *  5. Webhook (HMAC-verified) updates Payment status
 *
 * Docs: https://docs.paymob.com/docs/getting-started
 */
class PaymobService implements PaymentGatewayInterface
{
    protected string $baseUrl;
    protected ?string $authToken = null;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.paymob.base_url'), '/');
    }

    public function name(): string
    {
        return 'paymob';
    }

    /**
     * Initiate Paymob payment.
     *
     * @param Payment $payment
     * @param array $params  ['method' => 'card|wallet|installments', 'phone' => '01xxxx' (wallet/install), 'months' => 6 (install)]
     */
    public function initiate(Payment $payment, array $params = []): array
    {
        $method = $params['method'] ?? 'card';
        $integrationId = match ($method) {
            'card' => config('services.paymob.integration_card'),
            'wallet' => config('services.paymob.integration_wallet'),
            'installments' => config('services.paymob.integration_installments'),
            default => throw new \InvalidArgumentException("Unknown Paymob method: $method"),
        };

        if (empty($integrationId)) {
            throw new \RuntimeException("Paymob integration ID for {$method} not configured.");
        }

        // Step 1: Auth
        $this->authenticate();

        // Step 2: Register order
        $orderId = $this->registerOrder($payment);

        // Step 3: Request payment key
        $paymentKey = $this->requestPaymentKey($payment, $orderId, $integrationId);

        // Save IDs
        $payment->update([
            'gateway_order_id' => $orderId,
            'status' => Payment::STATUS_PROCESSING,
            'gateway_response' => [
                'method' => $method,
                'order_id' => $orderId,
                'integration_id' => $integrationId,
            ],
        ]);

        // Step 4: Build response based on method
        return match ($method) {
            'card' => [
                'type' => 'iframe',
                'data' => [
                    'iframe_url' => sprintf(
                        'https://accept.paymob.com/api/acceptance/iframes/%s?payment_token=%s',
                        config('services.paymob.iframe_card'),
                        $paymentKey
                    ),
                    'payment_token' => $paymentKey,
                ],
            ],
            'wallet' => $this->initiateWallet($paymentKey, $params['phone'] ?? null),
            'installments' => [
                'type' => 'redirect',
                'data' => [
                    'redirect_url' => sprintf(
                        'https://accept.paymob.com/api/acceptance/post_pay?payment_token=%s',
                        $paymentKey
                    ),
                ],
            ],
        };
    }

    protected function authenticate(): void
    {
        $response = Http::post("{$this->baseUrl}/auth/tokens", [
            'api_key' => config('services.paymob.api_key'),
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Paymob auth failed: ' . $response->body());
        }

        $this->authToken = $response->json('token');
    }

    protected function registerOrder(Payment $payment): string
    {
        $response = Http::post("{$this->baseUrl}/ecommerce/orders", [
            'auth_token' => $this->authToken,
            'delivery_needed' => false,
            'amount_cents' => (int) round($payment->amount * 100),
            'currency' => $payment->currency,
            'merchant_order_id' => $payment->reference,
            'items' => [],
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Paymob order failed: ' . $response->body());
        }

        return (string) $response->json('id');
    }

    protected function requestPaymentKey(Payment $payment, string $orderId, string $integrationId): string
    {
        $user = $payment->user;

        $response = Http::post("{$this->baseUrl}/acceptance/payment_keys", [
            'auth_token' => $this->authToken,
            'amount_cents' => (int) round($payment->amount * 100),
            'expiration' => 3600,
            'order_id' => $orderId,
            'billing_data' => [
                'first_name' => explode(' ', $user->name)[0] ?? $user->name,
                'last_name' => implode(' ', array_slice(explode(' ', $user->name), 1)) ?: 'NA',
                'email' => $user->email,
                'phone_number' => $user->phone ?? '+201000000000',
                'apartment' => 'NA',
                'floor' => 'NA',
                'street' => 'NA',
                'building' => 'NA',
                'city' => 'NA',
                'country' => 'EG',
                'state' => 'NA',
            ],
            'currency' => $payment->currency,
            'integration_id' => $integrationId,
        ]);

        if (!$response->successful()) {
            throw new \RuntimeException('Paymob payment_key failed: ' . $response->body());
        }

        return $response->json('token');
    }

    protected function initiateWallet(string $paymentKey, ?string $phone): array
    {
        $response = Http::post("{$this->baseUrl}/acceptance/payments/pay", [
            'source' => [
                'identifier' => $phone,
                'subtype' => 'WALLET',
            ],
            'payment_token' => $paymentKey,
        ]);

        $redirectUrl = $response->json('redirect_url') ?? $response->json('iframe_redirection_url');

        return [
            'type' => 'redirect',
            'data' => ['redirect_url' => $redirectUrl],
        ];
    }

    public function handleWebhook(Request $request): array
    {
        $payload = $request->all();

        // Paymob HMAC verification
        // Concatenate specific fields in order, then SHA512 with secret
        $hmacFromHeader = $request->header('Hmac') ?? $request->query('hmac');
        $hmacSecret = config('services.paymob.hmac_secret');

        // Refuse the request if either side of the comparison is empty —
        // otherwise hash_equals('', '') returns true and we'd accept unsigned
        // payloads in misconfigured environments.
        if (empty($hmacSecret) || empty($hmacFromHeader)) {
            Log::warning('Paymob webhook rejected: missing secret or signature header');
            return ['ok' => false, 'reason' => 'missing_signature'];
        }

        $obj = $payload['obj'] ?? $payload;
        $concatenated = implode('', [
            $obj['amount_cents'] ?? '',
            $obj['created_at'] ?? '',
            $obj['currency'] ?? '',
            $obj['error_occured'] ?? '',
            $obj['has_parent_transaction'] ?? '',
            $obj['id'] ?? '',
            $obj['integration_id'] ?? '',
            $obj['is_3d_secure'] ?? '',
            $obj['is_auth'] ?? '',
            $obj['is_capture'] ?? '',
            $obj['is_refunded'] ?? '',
            $obj['is_standalone_payment'] ?? '',
            $obj['is_voided'] ?? '',
            $obj['order']['id'] ?? '',
            $obj['owner'] ?? '',
            $obj['pending'] ?? '',
            $obj['source_data']['pan'] ?? '',
            $obj['source_data']['sub_type'] ?? '',
            $obj['source_data']['type'] ?? '',
            $obj['success'] ?? '',
        ]);

        $calculatedHmac = hash_hmac('sha512', $concatenated, $hmacSecret);
        $isValid = hash_equals($calculatedHmac, $hmacFromHeader ?? '');

        if (!$isValid) {
            Log::warning('Paymob webhook HMAC mismatch', ['expected' => $calculatedHmac, 'received' => $hmacFromHeader]);
            return ['ok' => false, 'reason' => 'invalid_hmac'];
        }

        // Find payment by merchant_order_id (our reference) or order.id
        $merchantRef = $obj['order']['merchant_order_id'] ?? null;
        $payment = Payment::where('reference', $merchantRef)
            ->orWhere('gateway_order_id', (string) ($obj['order']['id'] ?? ''))
            ->first();

        if (!$payment) {
            Log::warning('Paymob webhook — payment not found', ['ref' => $merchantRef]);
            return ['ok' => false, 'reason' => 'not_found'];
        }

        $payment->update([
            'gateway_transaction_id' => (string) ($obj['id'] ?? ''),
            'webhook_payload' => $payload,
            'hmac_verified' => '1',
            'card_last4' => $obj['source_data']['pan'] ?? null,
            'card_brand' => $obj['source_data']['sub_type'] ?? null,
        ]);

        if (!empty($obj['success']) && empty($obj['error_occured'])) {
            $payment->markCompleted($obj);
            return ['ok' => true, 'status' => 'completed'];
        }

        $payment->markFailed($obj['data']['message'] ?? 'gateway_declined');
        return ['ok' => true, 'status' => 'failed'];
    }

    public function checkStatus(Payment $payment): string
    {
        $this->authenticate();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->authToken,
        ])->get("{$this->baseUrl}/acceptance/transactions/{$payment->gateway_transaction_id}");

        if (!$response->successful()) return $payment->status;

        $data = $response->json();
        if ($data['success'] ?? false) return Payment::STATUS_COMPLETED;
        if ($data['pending'] ?? false) return Payment::STATUS_PENDING;
        return Payment::STATUS_FAILED;
    }

    public function refund(Payment $payment, float $amount, string $reason = ''): array
    {
        $this->authenticate();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->authToken,
        ])->post("{$this->baseUrl}/acceptance/void_refund/refund", [
            'transaction_id' => $payment->gateway_transaction_id,
            'amount_cents' => (int) round($amount * 100),
        ]);

        return $response->json() ?? ['error' => 'no_response'];
    }
}
