<x-mail::message>
# 🎉 تم قبول عرض سعر

العميل قبل عرض السعر وتم إنشاء طلب جديد في انتظار دفع العربون.

<x-mail::panel>
**العرض:** {{ $quote->quote_number }} (نسخة {{ $quote->version }})
**الطلب:** {{ $order->order_number }}
**المشروع:** {{ $lead?->title }}
**الإجمالي:** {{ number_format((float)$order->total) }} {{ $order->currency }}
**العربون المنتظر:** {{ number_format((float)$order->deposit_amount) }} {{ $order->currency }}
**العميل:** {{ $client?->name }} ({{ $client?->email }})
</x-mail::panel>

أول ما العميل يدفع العربون، الطلب هيتحوّل لمشروع ويظهر في قائمة التعيين عشان تختار له developer.

<x-mail::button :url="$adminUrl" color="primary">
افتح الطلب
</x-mail::button>

{{ config('app.name') }}
</x-mail::message>
