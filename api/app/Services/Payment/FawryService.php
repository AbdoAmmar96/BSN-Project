<?php

namespace App\Services\Payment;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Fawry FawryPay integration.
 *
 * Flow:
 *  1. Generate a payment request — returns reference number
 *  2. User pays at any Fawry outlet / wallet using that number within 48 hours
 *  3. Webhook (signed) notifies us when payment is complete
 *
 * Docs: https://developer.fawrystaging.com/docs/server-apis/charge-request
 */
class FawryService implements PaymentGatewayInterface
{
    protected string $baseUrl;
    protected string $merchantCode;
    protected string $secureKey;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.fawry.base_url'), '/');
        $this->merchantCode = config('services.fawry.merchant_code');
        $this->secureKey = config('services.fawry.secure_key');
    }

    public function name(): string
    {
        return 'fawry';
    }

    public function initiate(Payment $payment, array $params = []): array
    {
        $user = $payment->user;

        // Charge items required for signature
        $chargeItems = [[
            'itemId' => $payment->reference,
            'description' => 'Payment for ' . ($payment->invoice?->invoice_number ?? $payment->reference),
            'price' => number_format($payment->amount, 2, '.', ''),
            'quantity' => 1,
        ]];

        // Signature: merchantCode + merchantRefNum + customerProfileId + paymentMethod + amount(2dp) + itemId + qty + price(2dp) + secureKey
        $signatureString = $this->merchantCode
            . $payment->reference
            . $user->id
            . 'PayAtFawry'
            . number_format($payment->amount, 2, '.', '')
            . $payment->reference
            . '1'
            . number_format($payment->amount, 2, '.', '')
            . $this->secureKey;
        $signature = hash('sha256', $signatureString);

        $body = [
            'merchantCode' => $this->merchantCode,
            'merchantRefNum' => $payment->reference,
            'customerProfileId' => (string) $user->id,
            'customerName' => $user->name,
            'customerMobile' => $user->phone ?? '01000000000',
            'customerEmail' => $user->email,
            'paymentMethod' => 'PayAtFawry',
            'amount' => number_format($payment->amount, 2, '.', ''),
            'currencyCode' => $payment->currency,
            'description' => 'BSN payment ' . $payment->reference,
            'chargeItems' => $chargeItems,
            'signature' => $signature,
        ];

        $response = Http::post("{$this->baseUrl}/ECommerceWeb/Fawry/payments/charge", $body);

        if (!$response->successful()) {
            throw new \RuntimeException('Fawry initiate failed: ' . $response->body());
        }

        $data = $response->json();
        $reference = $data['referenceNumber'] ?? null;
        $expiresAt = isset($data['expirationTime']) ? \Carbon\Carbon::createFromTimestampMs($data['expirationTime']) : now()->addHours(48);

        if (!$reference) {
            throw new \RuntimeException('Fawry response missing reference: ' . json_encode($data));
        }

        $payment->update([
            'gateway_transaction_id' => $reference,
            'fawry_reference' => $reference,
            'fawry_expires_at' => $expiresAt,
            'status' => Payment::STATUS_PENDING,
            'gateway_response' => $data,
        ]);

        return [
            'type' => 'reference',
            'data' => [
                'reference_number' => $reference,
                'expires_at' => $expiresAt->toIso8601String(),
                'expires_at_human' => $expiresAt->locale('ar')->isoFormat('dddd D MMMM · h:mm a'),
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'instructions_ar' => 'روح لأي منفذ فوري وقول الرقم ده ' . $reference . ' وادفع المبلغ نقداً أو بالموبايل وُلت',
                'instructions_en' => 'Visit any Fawry outlet, provide reference ' . $reference . ', and pay the amount.',
            ],
        ];
    }

    public function handleWebhook(Request $request): array
    {
        $payload = $request->all();

        // Refuse if either the secret or the inbound signature is missing —
        // hash_equals('', '') returns true and would accept unsigned payloads.
        if (empty($this->secureKey) || empty($payload['messageSignature'] ?? '')) {
            Log::warning('Fawry webhook rejected: missing secret or signature');
            return ['ok' => false, 'reason' => 'missing_signature'];
        }

        // Fawry signature verification
        // signature = SHA-256(fawryRefNumber + merchantRefNumber + paymentAmount + orderAmount + orderStatus + paymentMethod + paymentRefrenceNumber + secureKey)
        $expectedSignature = hash('sha256',
            ($payload['fawryRefNumber'] ?? '') .
            ($payload['merchantRefNumber'] ?? '') .
            number_format((float) ($payload['paymentAmount'] ?? 0), 2, '.', '') .
            number_format((float) ($payload['orderAmount'] ?? 0), 2, '.', '') .
            ($payload['orderStatus'] ?? '') .
            ($payload['paymentMethod'] ?? '') .
            ($payload['paymentRefrenceNumber'] ?? '') .
            $this->secureKey
        );

        $isValid = hash_equals($expectedSignature, $payload['messageSignature'] ?? '');

        if (!$isValid) {
            Log::warning('Fawry webhook signature mismatch', ['expected' => $expectedSignature, 'received' => $payload['messageSignature'] ?? null]);
            return ['ok' => false, 'reason' => 'invalid_signature'];
        }

        $payment = Payment::where('reference', $payload['merchantRefNumber'] ?? '')
            ->orWhere('fawry_reference', $payload['fawryRefNumber'] ?? '')
            ->first();

        if (!$payment) {
            return ['ok' => false, 'reason' => 'not_found'];
        }

        $payment->update([
            'webhook_payload' => $payload,
            'hmac_verified' => '1',
        ]);

        $status = strtoupper($payload['orderStatus'] ?? '');
        if ($status === 'PAID') {
            $payment->markCompleted($payload);
            return ['ok' => true, 'status' => 'completed'];
        }

        if (in_array($status, ['EXPIRED', 'CANCELLED', 'REFUNDED', 'FAILED'])) {
            $payment->update(['status' => strtolower($status)]);
            return ['ok' => true, 'status' => strtolower($status)];
        }

        return ['ok' => true, 'status' => 'pending'];
    }

    public function checkStatus(Payment $payment): string
    {
        $signature = hash('sha256', $this->merchantCode . $payment->reference . $this->secureKey);

        $response = Http::get("{$this->baseUrl}/ECommerceWeb/Fawry/payments/status/v2", [
            'merchantCode' => $this->merchantCode,
            'merchantRefNumber' => $payment->reference,
            'signature' => $signature,
        ]);

        if (!$response->successful()) return $payment->status;

        $data = $response->json();
        return match (strtoupper($data['paymentStatus'] ?? '')) {
            'PAID' => Payment::STATUS_COMPLETED,
            'NEW', 'UNPAID' => Payment::STATUS_PENDING,
            'EXPIRED' => Payment::STATUS_EXPIRED,
            'CANCELED', 'CANCELLED' => Payment::STATUS_CANCELLED,
            'REFUNDED' => Payment::STATUS_REFUNDED,
            default => Payment::STATUS_FAILED,
        };
    }

    public function refund(Payment $payment, float $amount, string $reason = ''): array
    {
        $signature = hash('sha256',
            $this->merchantCode . $payment->reference . number_format($amount, 2, '.', '') . $reason . $this->secureKey
        );

        $response = Http::post("{$this->baseUrl}/ECommerceWeb/Fawry/payments/refund", [
            'merchantCode' => $this->merchantCode,
            'referenceNumber' => $payment->gateway_transaction_id,
            'refundAmount' => number_format($amount, 2, '.', ''),
            'reason' => $reason,
            'signature' => $signature,
        ]);

        return $response->json() ?? ['error' => 'no_response'];
    }
}
