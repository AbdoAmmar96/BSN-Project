<x-mail::message>
# ✅ استلمنا طلبك

أهلاً {{ $user?->name }}، شكراً إنك اخترت {{ config('app.name') }}! طلبك وصلنا وبدأنا مراجعته.

<x-mail::panel>
**رقم الطلب:** {{ $order->order_number }}
**المشروع:** {{ $order->project_name }}
@if($order->package) **الباقة:** {{ $order->package->name }}
@endif
**الإجمالي:** {{ number_format((float)$order->total) }} {{ $order->currency }}
**العربون المدفوع:** {{ number_format((float)$order->deposit_amount) }} {{ $order->currency }}
**الباقي:** {{ number_format((float)$order->remaining_amount) }} {{ $order->currency }}
</x-mail::panel>

الخطوة الجاية: فريقنا هيراجع طلبك ويعيّن المطوّر المناسب خلال 24 ساعة، وهنبدأ شغل على طول.

<x-mail::button :url="$orderUrl" color="primary">
متابعة الطلب
</x-mail::button>

تحياتنا،<br>
{{ config('app.name') }}
</x-mail::message>
