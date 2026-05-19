<?php

namespace App\Services\Payment;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Kashier hosted-payment integration.
 *
 * Kashier uses a hosted checkout — we build a signed URL, user is redirected,
 * pays on Kashier-hosted page, returns to our redirectUrl with status.
 *
 * Docs: https://docs.kashier.io/hosted-payment-page
 */
class KashierService implements PaymentGatewayInterface
{
    protected string $baseUrl;
    protected string $merchantId;
    protected string $apiKey;
    protected string $secret;
    protected string $mode;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.kashier.base_url'), '/');
        $this->merchantId = config('services.kashier.merchant_id');
        $this->apiKey = config('services.kashier.api_key');
        $this->secret = config('services.kashier.secret');
        $this->mode = config('services.kashier.mode', 'test');
    }

    public function name(): string
    {
        return 'kashier';
    }

    public function initiate(Payment $payment, array $params = []): array
    {
        // Build the hash for the hosted page
        // hashString = mid + orderId + amount + currency + secret
        $amountStr = number_format($payment->amount, 2, '.', '');
        $hashString = $this->merchantId . '.' . $payment->reference . '.' . $amountStr . '.' . $payment->currency . '.' . $this->secret;
        $hash = hash_hmac('sha256', $hashString, $this->secret);

        $params = [
            'merchantId' => $this->merchantId,
            'orderId' => $payment->reference,
            'amount' => $amountStr,
            'currency' => $payment->currency,
            'hash' => $hash,
            'mode' => $this->mode,
            'merchantRedirect' => url('/api/payments/kashier/return'),
            'serverWebhook' => url('/api/payments/kashier/webhook'),
            'allowedMethods' => 'card', // 'card,wallet,bank_installments'
            'failureRedirect' => 'false',
            'redirectMethod' => 'get',
            'display' => $payment->user->locale ?? 'ar',
            'metaData' => json_encode([
                'payment_id' => $payment->id,
                'user_id' => $payment->user_id,
            ]),
            'brandColor' => '%235C15CC', // URL-encoded #5C15CC (BSN purple)
        ];

        $url = 'https://checkout.kashier.io/?' . http_build_query($params);

        $payment->update([
            'status' => Payment::STATUS_PROCESSING,
            'gateway_response' => ['checkout_url' => $url, 'hash' => $hash],
        ]);

        return [
            'type' => 'redirect',
            'data' => ['redirect_url' => $url],
        ];
    }

    public function handleWebhook(Request $request): array
    {
        $payload = $request->all();
        $signature = $request->header('x-kashier-signature') ?? '';

        if (empty($this->apiKey) || empty($signature)) {
            Log::warning('Kashier webhook rejected: missing api key or signature header');
            return ['ok' => false, 'reason' => 'missing_signature'];
        }

        // Kashier signature: HMAC-SHA256 of sorted query string with API key
        ksort($payload);
        $queryString = http_build_query($payload);
        $expectedSignature = hash_hmac('sha256', $queryString, $this->apiKey);

        $isValid = hash_equals($expectedSignature, $signature);

        if (!$isValid) {
            Log::warning('Kashier webhook signature mismatch', ['expected' => $expectedSignature, 'received' => $signature]);
            return ['ok' => false, 'reason' => 'invalid_signature'];
        }

        $orderRef = $payload['orderId'] ?? $payload['merchantOrderId'] ?? null;
        $payment = Payment::where('reference', $orderRef)->first();

        if (!$payment) {
            return ['ok' => false, 'reason' => 'not_found'];
        }

        $payment->update([
            'webhook_payload' => $payload,
            'hmac_verified' => '1',
            'gateway_transaction_id' => $payload['transactionId'] ?? $payload['kashierOrderId'] ?? '',
            'card_last4' => $payload['card']['cardInfo']['maskedCard'] ?? null,
            'card_brand' => $payload['card']['cardInfo']['cardBrand'] ?? null,
        ]);

        $status = strtoupper($payload['status'] ?? $payload['transactionResponseCode'] ?? '');
        if (in_array($status, ['SUCCESS', '00'])) {
            $payment->markCompleted($payload);
            return ['ok' => true, 'status' => 'completed'];
        }

        $payment->markFailed($payload['transactionResponseMessage'] ?? 'unknown');
        return ['ok' => true, 'status' => 'failed'];
    }

    public function checkStatus(Payment $payment): string
    {
        // Kashier provides a query endpoint, but for simplicity rely on webhook
        return $payment->status;
    }

    public function refund(Payment $payment, float $amount, string $reason = ''): array
    {
        // Implement Kashier refund API call here
        // POST {base_url}/v3/orders/{orderId}/refund with auth header
        return ['todo' => 'Kashier refund — not yet implemented'];
    }
}
