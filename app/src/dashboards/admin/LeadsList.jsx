import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminLeadsApi } from '@/api/leads';
import PageHeader from '@/components/dashboard/PageHeader';
import Skeleton from 'react-loading-skeleton';

const STATUS = {
  new: { label: 'جديد', cls: 'bg-brand-orange/15 text-brand-ink' },
  reviewing: { label: 'قيد المراجعة', cls: 'bg-brand-teal/20 text-brand-ink' },
  quoted: { label: 'تم إرسال عرض', cls: 'bg-brand-purple/10 text-brand-purple' },
  won: { label: 'مكسوب', cls: 'bg-green-100 text-green-700' },
  lost: { label: 'خسارة', cls: 'bg-red-100 text-red-700' },
  archived: { label: 'مؤرشف', cls: 'bg-gray-100 text-gray-600' },
};

export default function LeadsList() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-leads'], queryFn: () => adminLeadsApi.list() });
  const leads = data?.data ?? [];

  return (
    <div>
      <PageHeader title="طلبات عروض الأسعار" subtitle="طابور الـ leads (Path B)" />

      {isLoading ? (
        <Skeleton count={4} height={64} className="mb-2" />
      ) : leads.length === 0 ? (
        <p className="text-brand-ink/60 text-sm">مفيش leads حالياً.</p>
      ) : (
        <div className="space-y-3">
          {leads.map((l) => {
            const s = STATUS[l.status] ?? STATUS.new;
            return (
              <Link key={l.id} to={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-brand-ink/15 bg-white p-4 hover:border-brand-ink transition">
                <div>
                  <div className="font-display font-black text-brand-ink text-sm">{l.title}</div>
                  <div className="text-xs text-brand-ink/55 mt-0.5">{l.lead_number} · {l.user?.name}</div>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
