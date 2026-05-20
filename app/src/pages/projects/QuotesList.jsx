import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '@/api/leads';
import PageHeader from '@/components/dashboard/PageHeader';
import Skeleton from 'react-loading-skeleton';

const STATUS = {
  sent: { label: 'جديد', cls: 'bg-brand-orange/15 text-brand-ink' },
  viewed: { label: 'تمت المشاهدة', cls: 'bg-brand-teal/20 text-brand-ink' },
  accepted: { label: 'مقبول', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'مرفوض', cls: 'bg-red-100 text-red-700' },
  expired: { label: 'منتهي', cls: 'bg-gray-100 text-gray-600' },
  draft: { label: 'مسودة', cls: 'bg-gray-100 text-gray-600' },
};

export default function QuotesList() {
  const { data, isLoading } = useQuery({ queryKey: ['quotes'], queryFn: () => quotesApi.list() });
  const quotes = data?.data ?? [];

  return (
    <div>
      <PageHeader title="عروض الأسعار" subtitle="العروض اللي وصلتك على طلباتك المخصّصة" />

      {isLoading ? (
        <Skeleton count={3} height={64} className="mb-2" />
      ) : quotes.length === 0 ? (
        <p className="text-brand-ink/60 text-sm">لسه مفيش عروض. قدّم طلب مخصّص من "مشروع جديد".</p>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => {
            const s = STATUS[q.status] ?? STATUS.draft;
            return (
              <Link key={q.id} to={`/dashboard/quotes/${q.id}`} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-brand-ink/15 bg-white p-4 hover:border-brand-ink transition">
                <div>
                  <div className="font-display font-black text-brand-ink text-sm">{q.lead?.title || q.quote_number}</div>
                  <div className="text-xs text-brand-ink/55 mt-0.5">{q.quote_number} · نسخة {q.version}</div>
                </div>
                <div className="text-left">
                  <div className="font-display font-black text-brand-purple text-sm">{Number(q.total).toLocaleString()} {q.currency}</div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
