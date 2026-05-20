import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import PageHeader from '@/components/dashboard/PageHeader';
import Skeleton from 'react-loading-skeleton';
import { Plus } from 'lucide-react';

const STATUS_LABELS = {
  draft: 'مسودة',
  pending_payment: 'في انتظار الدفع',
  paid: 'في انتظار المراجعة',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  refunded: 'مسترد',
};

export default function UserOrdersList() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list(),
  });

  const orders = data?.data ?? [];

  return (
    <div>
      <PageHeader title="طلباتي" subtitle="الباقات اللي طلبتها">
        <Link to="/dashboard/projects/new" className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-brand-purple text-white font-bold text-sm">
          <Plus size={16} /> طلب جديد
        </Link>
      </PageHeader>

      {isLoading ? (
        <Skeleton count={4} height={64} className="mb-2" />
      ) : orders.length === 0 ? (
        <p className="text-brand-ink/60 text-sm">لسه مفيش طلبات. ابدأ طلبك الأول!</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/dashboard/orders/${o.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border-2 border-brand-ink/15 bg-white p-4 hover:border-brand-ink transition"
            >
              <div>
                <div className="font-display font-black text-brand-ink text-sm">{o.project_name || o.order_number}</div>
                <div className="text-xs text-brand-ink/55 mt-0.5">{o.package?.name} · {o.order_number}</div>
              </div>
              <div className="text-left">
                <div className="font-display font-black text-brand-purple text-sm">
                  {Number(o.total).toLocaleString()} {o.currency}
                </div>
                <span className="text-[11px] font-bold text-brand-ink/60">{STATUS_LABELS[o.status] ?? o.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
