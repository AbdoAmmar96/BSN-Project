import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { paymentsApi, GATEWAY_LABELS, GATEWAY_ICONS } from '@/api/payments';
import PageHeader from '@/components/dashboard/PageHeader';
import DataTable from '@/components/dashboard/DataTable';
import Badge from '@/components/dashboard/Badge';
import EmptyState from '@/components/dashboard/EmptyState';
import { CreditCard, Eye } from 'lucide-react';

const STATUS_MAP = {
  pending: { label: 'في الانتظار', color: 'bg-yellow-200 text-yellow-800' },
  processing: { label: 'قيد المعالجة', color: 'bg-blue-200 text-blue-800' },
  completed: { label: 'مكتمل', color: 'bg-green-500 text-white' },
  failed: { label: 'فشل', color: 'bg-red-500 text-white' },
  cancelled: { label: 'ملغي', color: 'bg-gray-400 text-white' },
  expired: { label: 'منتهي', color: 'bg-gray-500 text-white' },
  refunded: { label: 'مسترد', color: 'bg-purple-300 text-purple-900' },
};

export default function UserPaymentsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.list({ per_page: 50 }),
  });

  const payments = data?.data?.data || [];
  const totalPaid = payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter(p => ['pending', 'processing'].includes(p.status)).reduce((s, p) => s + Number(p.amount), 0);

  const columns = [
    {
      key: 'reference', label: 'المرجع',
      render: (p) => (
        <div>
          <div className="font-mono text-sm font-bold" dir="ltr">{p.reference}</div>
          <div className="text-xs opacity-60 font-mono mt-0.5">
            {new Date(p.created_at).toLocaleDateString('ar-EG')}
          </div>
        </div>
      ),
    },
    {
      key: 'gateway', label: 'طريقة الدفع',
      render: (p) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{GATEWAY_ICONS[p.gateway]}</span>
          <span className="text-sm">{GATEWAY_LABELS[p.gateway]}</span>
        </div>
      ),
    },
    {
      key: 'amount', label: 'المبلغ', align: 'center',
      render: (p) => (
        <span className="font-display font-black">
          {Number(p.amount).toLocaleString()} <span className="text-xs opacity-70 font-mono">{p.currency}</span>
        </span>
      ),
    },
    {
      key: 'status', label: 'الحالة', align: 'center',
      render: (p) => {
        const s = STATUS_MAP[p.status];
        return <Badge color={s?.color} size="sm">{s?.label || p.status}</Badge>;
      },
    },
    {
      key: 'actions', label: '', align: 'center',
      render: (p) => (
        <Link
          to={`/payment/checkout/${p.id}`}
          className="p-2 rounded-lg hover:bg-brand-orange/10 text-brand-orange inline-flex"
          title="عرض"
        >
          <Eye size={16} />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="MY PAYMENTS"
        title="سجل المدفوعات"
        description="كل العمليات المالية اللي عملتها"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <div className="bg-green-500 text-white rounded-xl border-[2.5px] border-brand-ink p-4 shadow-brutal-sm">
          <div className="text-xs font-mono opacity-90 mb-1">إجمالي المدفوع</div>
          <div className="font-display font-black text-2xl">{totalPaid.toLocaleString()} EGP</div>
        </div>
        <div className="bg-yellow-300 text-yellow-900 rounded-xl border-[2.5px] border-brand-ink p-4 shadow-brutal-sm">
          <div className="text-xs font-mono opacity-90 mb-1">معلّق</div>
          <div className="font-display font-black text-2xl">{totalPending.toLocaleString()} EGP</div>
        </div>
        <div className="bg-white text-brand-ink rounded-xl border-[2.5px] border-brand-ink p-4 shadow-brutal-sm">
          <div className="text-xs font-mono opacity-70 mb-1">عدد العمليات</div>
          <div className="font-display font-black text-2xl">{payments.length}</div>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={payments}
        loading={isLoading}
        empty={
          <EmptyState
            icon={CreditCard}
            title="لسه ما فيش مدفوعات"
            description="هتظهر هنا أول ما تبدأ أول دفعة"
          />
        }
      />
    </div>
  );
}
