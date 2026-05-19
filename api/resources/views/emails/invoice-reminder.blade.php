<x-mail::message>
# ⏰ تذكير: فاتورة قاربت على الاستحقاق

{{ $user?->name }}، فاتورتك مستحقة خلال **{{ $daysUntilDue }} أيام**.

<x-mail::panel>
**رقم الفاتورة:** #{{ $invoice->id }}
**المبلغ المستحق:** {{ number_format((float)$invoice->total, 2) }} {{ $invoice->currency }}
**تاريخ الاستحقاق:** {{ $invoice->due_at?->format('Y-m-d') }}
**الحالة:** {{ $invoice->status }}
</x-mail::panel>

تقدر تدفع دلوقتي من خلال أي بوابة دفع متاحة.

<x-mail::button :url="$invoiceUrl" color="primary">
ادفع الفاتورة
</x-mail::button>

لو دفعت بالفعل، تجاهل هذا الإيميل من فضلك.

تحياتنا،<br>
{{ config('app.name') }}
</x-mail::message>
