import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminOrdersApi } from '@/api/leads';
import PageHeader from '@/components/dashboard/PageHeader';
import Skeleton from 'react-loading-skeleton';

const STATUS = {
  draft: 'مسودة',
  pending_payment: 'في انتظار الدفع',
  paid: 'محتاج تعيين',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  refunded: 'مسترد',
};

export default function AdminOrdersList() {
  const [pendingOnly, setPendingOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', pendingOnly],
    queryFn: () => adminOrdersApi.list(pendingOnly ? { pending_assignment: 1 } : {}),
  });
  const orders = data?.data ?? [];

  return (
    <div>
      <PageHeader title="الطلبات" subtitle="طلبات الباقات (Path A) + العروض المقبولة">
        <button
          onClick={() => setPendingOnly((v) => !v)}
          className={`px-4 py-2 rounded-xl font-bold text-sm border-2 transition ${
            pendingOnly ? 'bg-brand-orange text-white border-brand-orange' : 'bg-white text-brand-ink border-brand-ink'
          }`}
        >
          محتاج تعيين فقط
        </button>
      </PageHeader>

      {isLoading ? (
        <Skeleton count={4} height={64} className="mb-2" />
      ) : orders.length === 0 ? (
        <p className="text-brand-ink/60 text-sm">مفيش طلبات.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const needsAssign = o.status === 'paid' && !o.assigned_developer_id;
            return (
              <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-brand-ink/15 bg-white p-4 hover:border-brand-ink transition">
                <div>
                  <div className="font-display font-black text-brand-ink text-sm">{o.project_name || o.order_number}</div>
                  <div className="text-xs text-brand-ink/55 mt-0.5">{o.order_number} · {o.user?.name}</div>
                </div>
                <div className="text-left">
                  <div className="font-display font-black text-brand-purple text-sm">{Number(o.total).toLocaleString()} {o.currency}</div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${needsAssign ? 'bg-brand-orange/15 text-brand-ink' : 'bg-brand-ink/5 text-brand-ink/60'}`}>
                    {STATUS[o.status] ?? o.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
