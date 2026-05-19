<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>فاتورة {{ $invoice->invoice_number ?? '#' . $invoice->id }}</title>
<style>
  @page { margin: 28px 36px; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #0F0830; line-height: 1.5; }
  .header { display: table; width: 100%; border-bottom: 3px solid #F15A24; padding-bottom: 14px; margin-bottom: 22px; }
  .brand { display: table-cell; vertical-align: middle; }
  .brand-mark { font-size: 26px; font-weight: 900; color: #F15A24; letter-spacing: -1px; }
  .brand-name { font-size: 11px; color: #5C15CC; margin-top: 2px; }
  .meta { display: table-cell; vertical-align: middle; text-align: left; }
  .meta .label { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
  .meta .num { font-size: 18px; font-weight: 900; color: #0F0830; }
  .meta .status {
    display: inline-block; margin-top: 4px; padding: 2px 10px; border-radius: 100px;
    font-size: 10px; font-weight: bold; background: #F15A24; color: #fff;
  }
  .status.paid { background: #16a34a; }
  .status.cancelled { background: #6b7280; }

  .row { display: table; width: 100%; margin-bottom: 18px; }
  .col { display: table-cell; vertical-align: top; padding-left: 20px; }
  .col:last-child { padding-left: 0; }
  .col-title { font-size: 9px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .col-value { font-weight: bold; }

  table.items { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 18px; }
  table.items thead th {
    background: #5C15CC; color: #fff; font-size: 11px; padding: 9px 10px; text-align: right;
  }
  table.items thead th:last-child, table.items tbody td:last-child { text-align: left; }
  table.items tbody td { padding: 9px 10px; border-bottom: 1px solid #eee; font-size: 11px; }
  table.items tbody tr:last-child td { border-bottom: 2px solid #0F0830; }

  .totals { width: 100%; margin-top: 4px; }
  .totals .t-row { display: table; width: 100%; padding: 4px 0; }
  .totals .t-label { display: table-cell; text-align: left; padding-right: 20px; color: #555; font-size: 11px; }
  .totals .t-value { display: table-cell; text-align: left; font-weight: bold; width: 140px; }
  .totals .grand .t-label { font-size: 13px; color: #0F0830; font-weight: bold; padding-top: 8px; border-top: 1px dashed #ccc; }
  .totals .grand .t-value { font-size: 18px; color: #F15A24; padding-top: 8px; border-top: 1px dashed #ccc; }

  .notes { margin-top: 22px; padding: 12px 14px; background: #f7f3ff; border-right: 3px solid #5C15CC; font-size: 11px; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #eee; font-size: 10px; color: #888; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <div class="brand">
    <div class="brand-mark">BSN</div>
    <div class="brand-name">شريك الأعمال — Business Partner</div>
  </div>
  <div class="meta">
    <div class="label">رقم الفاتورة</div>
    <div class="num">{{ $invoice->invoice_number ?? ('#' . $invoice->id) }}</div>
    <span class="status {{ in_array($invoice->status, ['paid','cancelled']) ? $invoice->status : '' }}">
      {{ ['draft'=>'مسودة','sent'=>'مُرسلة','partial'=>'مدفوعة جزئياً','paid'=>'مدفوعة','overdue'=>'متأخرة','cancelled'=>'ملغية'][$invoice->status] ?? $invoice->status }}
    </span>
  </div>
</div>

<div class="row">
  <div class="col">
    <div class="col-title">العميل</div>
    <div class="col-value">{{ $invoice->user?->name ?? '—' }}</div>
    <div>{{ $invoice->user?->email }}</div>
    @if($invoice->user?->company) <div>{{ $invoice->user->company }}</div> @endif
  </div>
  <div class="col">
    <div class="col-title">المشروع</div>
    <div class="col-value">{{ $invoice->project?->title ?? '—' }}</div>
  </div>
  <div class="col">
    <div class="col-title">تاريخ الإصدار</div>
    <div class="col-value">{{ $invoice->issued_at?->format('Y-m-d') ?? $invoice->created_at?->format('Y-m-d') }}</div>
    <div class="col-title" style="margin-top:6px;">تاريخ الاستحقاق</div>
    <div class="col-value">{{ $invoice->due_at?->format('Y-m-d') ?? '—' }}</div>
  </div>
</div>

<table class="items">
  <thead>
    <tr>
      <th style="width:48%;">البند</th>
      <th style="width:14%;">الكمية</th>
      <th style="width:18%;">السعر</th>
      <th style="width:20%;">الإجمالي</th>
    </tr>
  </thead>
  <tbody>
    @foreach(($invoice->items ?? []) as $item)
      <tr>
        <td>{{ $item['description'] ?? '—' }}</td>
        <td>{{ $item['quantity'] ?? 1 }}</td>
        <td>{{ number_format((float)($item['price'] ?? 0), 2) }}</td>
        <td>{{ number_format((float)($item['quantity'] ?? 1) * (float)($item['price'] ?? 0), 2) }}</td>
      </tr>
    @endforeach
  </tbody>
</table>

<div class="totals">
  <div class="t-row"><div class="t-label">المجموع الفرعي</div><div class="t-value">{{ number_format((float)$invoice->subtotal, 2) }} {{ $invoice->currency }}</div></div>
  @if((float)$invoice->tax > 0)
  <div class="t-row"><div class="t-label">ضريبة</div><div class="t-value">{{ number_format((float)$invoice->tax, 2) }} {{ $invoice->currency }}</div></div>
  @endif
  @if((float)$invoice->discount > 0)
  <div class="t-row"><div class="t-label">خصم</div><div class="t-value">- {{ number_format((float)$invoice->discount, 2) }} {{ $invoice->currency }}</div></div>
  @endif
  <div class="t-row grand"><div class="t-label">الإجمالي</div><div class="t-value">{{ number_format((float)$invoice->total, 2) }} {{ $invoice->currency }}</div></div>
</div>

@if($invoice->notes)
  <div class="notes"><strong>ملاحظات:</strong><br>{{ $invoice->notes }}</div>
@endif

<div class="footer">
  شركة شريك الأعمال لتقنية المعلومات · bp-eg.com · hello@bp-eg.com<br>
  تم إنشاء الفاتورة في {{ now()->format('Y-m-d H:i') }}
</div>

</body>
</html>
