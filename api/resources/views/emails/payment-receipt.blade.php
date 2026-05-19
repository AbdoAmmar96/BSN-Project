<x-mail::message>
# ✅ تم استلام دفعتك

شكراً {{ $user?->name }}، تم تأكيد دفعتك بنجاح.

<x-mail::panel>
**رقم العملية:** #{{ $payment->id }}
**المبلغ:** {{ number_format((float)$payment->amount, 2) }} {{ $payment->currency }}
**بوابة الدفع:** {{ $payment->gateway ?? '—' }}
**التاريخ:** {{ $payment->paid_at?->format('Y-m-d H:i') }}
@if($payment->invoice_id) **رقم الفاتورة:** #{{ $payment->invoice_id }}
@endif
</x-mail::panel>

@if($invoice)
**حالة الفاتورة الآن:** {{ $invoice->status === 'paid' ? 'مدفوعة بالكامل ✓' : 'مدفوعة جزئياً' }}
@endif

<x-mail::button :url="$invoiceUrl" color="primary">
عرض الفاتورة
</x-mail::button>

احتفظ بهذا الإيميل كإيصال.

تحياتنا،<br>
{{ config('app.name') }}
</x-mail::message>
