<x-mail::message>
# 🚀 طلب مشروع جديد

عميل قدّم طلب جديد محتاج مراجعتك.

<x-mail::panel>
**العنوان:** {{ $project->title }}
**نوع الخدمة:** {{ $project->service_type }}
@if($project->package_tier) **الباقة:** {{ $project->package_tier }}
@endif
@if($project->budget) **الميزانية:** {{ number_format((float)$project->budget) }} {{ $project->currency }}
@endif
@if($project->deadline) **الموعد المطلوب:** {{ $project->deadline->format('Y-m-d') }}
@endif

**العميل:** {{ $client?->name }} ({{ $client?->email }})
@if($client?->phone) **الهاتف:** {{ $client->phone }}
@endif
</x-mail::panel>

@if($project->description)
**التفاصيل:**

{{ $project->description }}
@endif

<x-mail::button :url="$adminUrl" color="primary">
افتح المشروع
</x-mail::button>

تحياتنا،<br>
{{ config('app.name') }}
</x-mail::message>
