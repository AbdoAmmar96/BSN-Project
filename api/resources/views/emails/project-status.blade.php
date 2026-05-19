<x-mail::message>
# 📋 تحديث حالة مشروعك

{{ $client?->name }}، حصل تحديث على مشروعك:

<x-mail::panel>
**المشروع:** {{ $project->title }}
@if($oldLabel)
**من:** {{ $oldLabel }}
**إلى:** {{ $newLabel }}
@else
**الحالة الحالية:** {{ $newLabel }}
@endif
@if($project->progress !== null) **التقدم:** {{ $project->progress }}%
@endif
</x-mail::panel>

<x-mail::button :url="$projectUrl" color="primary">
عرض تفاصيل المشروع
</x-mail::button>

لو عندك أي ملاحظات أو أسئلة، تواصل معانا من المحادثات.

تحياتنا،<br>
{{ config('app.name') }}
</x-mail::message>
