import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { quotesApi } from '@/api/leads';
import PageHeader from '@/components/dashboard/PageHeader';
import Skeleton from 'react-loading-skeleton';

export default function QuoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['quote', id], queryFn: () => quotesApi.show(id) });
  const quote = data?.quote;

  const accept = useMutation({
    mutationFn: () => quotesApi.accept(id),
    onSuccess: ({ order }) => {
      toast.success('تم قبول العرض! ادفع العربون لبدء المشروع.');
      navigate(`/dashboard/orders/${order.id}?checkout=1`);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });

  const reject = useMutation({
    mutationFn: () => quotesApi.reject(id),
    onSuccess: () => { toast.success('تم رفض العرض.'); qc.invalidateQueries({ queryKey: ['quote', id] }); },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });

  const negotiate = useMutation({
    mutationFn: () => quotesApi.negotiate(id),
    onSuccess: () => toast.success('بعتنا طلب التفاوض لفريقنا.'),
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });

  if (isLoading) return <Skeleton count={6} height={28} />;
  if (!quote) return <p className="text-brand-ink/60">العرض غير موجود.</p>;

  const fmt = (v) => `${Number(v || 0).toLocaleString()} ${quote.currency}`;
  const actionable = ['sent', 'viewed'].includes(quote.status);

  return (
    <div>
      <PageHeader title={`عرض ${quote.quote_number}`} subtitle={quote.lead?.title} />

      <div className="rounded-2xl border-[2.5px] border-brand-ink bg-white p-5 shadow-[5px_5px_0_#5C15CC]">
        <div className="space-y-2">
          {quote.items?.map((it) => (
            <div key={it.id} className="flex items-center justify-between text-sm">
              <span className="text-brand-ink/80">{it.label}{it.quantity > 1 ? ` ×${it.quantity}` : ''}</span>
              <span className="font-bold text-brand-ink">{fmt(it.total)}</span>
            </div>
          ))}
        </div>

        <hr className="my-3 border-brand-ink/10" />
        <div className="flex items-center justify-between text-sm"><span>المجموع الفرعي</span><span>{fmt(quote.subtotal)}</span></div>
        {Number(quote.discount) > 0 && <div className="flex items-center justify-between text-sm"><span>خصم</span><span>- {fmt(quote.discount)}</span></div>}
        <div className="flex items-center justify-between font-display font-black text-brand-ink mt-1"><span>الإجمالي</span><span>{fmt(quote.total)}</span></div>

        {quote.estimated_days && <p className="text-xs text-brand-ink/60 mt-3">مدة التنفيذ المتوقعة: {quote.estimated_days} يوم</p>}

        {Array.isArray(quote.payment_schedule) && (
          <div className="mt-3 rounded-xl bg-brand-purple/5 p-3 text-xs text-brand-ink/75">
            <strong className="block mb-1">جدول الدفع:</strong>
            {quote.payment_schedule.map((p, i) => <div key={i}>• {p.label}: {p.percentage}%</div>)}
          </div>
        )}

        {quote.terms && <p className="text-xs text-brand-ink/60 mt-3 whitespace-pre-line">{quote.terms}</p>}
      </div>

      {actionable ? (
        <div className="flex flex-wrap gap-2 mt-5">
          <button onClick={() => accept.mutate()} disabled={accept.isPending} className="px-5 py-2.5 rounded-xl bg-brand-orange text-white font-black disabled:opacity-50">
            ✓ أوافق وادفع العربون
          </button>
          <button onClick={() => negotiate.mutate()} disabled={negotiate.isPending} className="px-4 py-2.5 rounded-xl border-2 border-brand-ink bg-white font-bold text-brand-ink">
            💬 أريد التفاوض
          </button>
          <button onClick={() => { if (confirm('متأكد إنك عايز ترفض العرض؟')) reject.mutate(); }} disabled={reject.isPending} className="px-4 py-2.5 rounded-xl border-2 border-red-300 bg-white font-bold text-red-600">
            ✗ رفض
          </button>
        </div>
      ) : (
        <p className="text-sm text-brand-ink/60 mt-5">حالة العرض: <strong>{quote.status}</strong></p>
      )}
    </div>
  );
}
