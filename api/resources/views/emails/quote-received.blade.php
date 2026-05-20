<x-mail::message>
# 📄 جهّزنالك عرض سعر

أهلاً {{ $user?->name }}، راجعنا طلبك «{{ $lead?->title }}» وجهّزنالك عرض سعر مخصّص.

<x-mail::panel>
**رقم العرض:** {{ $quote->quote_number }} (نسخة {{ $quote->version }})
**الإجمالي:** {{ number_format((float)$quote->total) }} {{ $quote->currency }}
@if($quote->expires_at) **صالح حتى:** {{ $quote->expires_at->format('Y-m-d') }}
@endif
</x-mail::panel>

افتح العرض عشان تشوف التفاصيل وتقبله أو تطلب تعديل.

<x-mail::button :url="$quoteUrl" color="primary">
عرض التفاصيل
</x-mail::button>

تحياتنا،<br>
{{ config('app.name') }}
</x-mail::message>
