<x-mail::message>
# 📩 رسالة تواصل جديدة

عميل محتمل بعت لينا من صفحة التواصل.

<x-mail::panel>
**الاسم:** {{ $contact->name }}
**البريد:** {{ $contact->email }}
@if($contact->phone) **الهاتف:** {{ $contact->phone }}
@endif
@if($contact->subject) **الموضوع:** {{ $contact->subject }}
@endif
@if($contact->source) **المصدر:** {{ $contact->source }}
@endif
**وقت الإرسال:** {{ $contact->created_at?->format('Y-m-d H:i') }}
</x-mail::panel>

**نص الرسالة:**

{{ $contact->message }}

<x-mail::button :url="$adminUrl" color="primary">
عرض في لوحة الأدمن
</x-mail::button>

ردّ على الإيميل ده مباشرة للرد على العميل.

تحياتنا،<br>
{{ config('app.name') }}
</x-mail::message>
