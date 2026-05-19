import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { paymentsApi, GATEWAY_LABELS, GATEWAY_ICONS } from '@/api/payments';
import PageHeader from '@/components/dashboard/PageHeader';
import DataTable from '@/components/dashboard/DataTable';
import Badge from '@/components/dashboard/Badge';
import EmptyState from '@/components/dashboard/EmptyState';
import { CreditCard, Eye, Search, Filter } from 'lucide-react';
import clsx from 'clsx';

const STATUS_MAP = {
  pending: { label: 'في الانتظار', color: 'bg-yellow-200 text-yellow-800' },
  processing: { label: 'قيد المعالجة', color: 'bg-blue-200 text-blue-800' },
  completed: { label: 'مكتمل', color: 'bg-green-500 text-white' },
  failed: { label: 'فشل', color: 'bg-red-500 text-white' },
  cancelled: { label: 'ملغي', color: 'bg-gray-400 text-white' },
  expired: { label: 'منتهي', color: 'bg-gray-500 text-white' },
  refunded: { label: 'مسترد', color: 'bg-purple-300 text-purple-900' },
};

export default function AdminPaymentsList() {
  const [statusFilter, setStatusFilter] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payments', { statusFilter, gatewayFilter }],
    queryFn: () => paymentsApi.list({
      status: statusFilter,
      gateway: gatewayFilter,
      per_page: 30,
    }),
  });

  const payments = data?.data?.data || [];

  const totals = {
    completed: payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount), 0),
    pending: payments.filter(p => ['pending', 'processing'].includes(p.status)).reduce((s, p) => s + Number(p.amount), 0),
    failed: payments.filter(p => p.status === 'failed').length,
    count: payments.length,
  };

  const columns = [
    {
      key: 'reference', label: 'المرجع',
      render: (p) => (
        <div>
          <div className="font-mono text-xs font-bold" dir="ltr">{p.reference}</div>
          <div className="text-xs opacity-60 mt-0.5">{new Date(p.created_at).toLocaleDateString('ar-EG')}</div>
        </div>
      ),
    },
    {
      key: 'user', label: 'الدافع',
      render: (p) => p.user
        ? <div className="text-sm"><div className="font-bold">{p.user.name}</div><div className="text-xs opacity-60">{p.user.email}</div></div>
        : '—',
    },
    {
      key: 'gateway', label: 'البوابة',
      render: (p) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span>{GATEWAY_ICONS[p.gateway]}</span>
          <span className="font-mono">{p.gateway}</span>
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
      render: (p) => <Badge color={STATUS_MAP[p.status]?.color} size="sm">{STATUS_MAP[p.status]?.label}</Badge>,
    },
    {
      key: 'actions', label: '', align: 'center',
      render: (p) => (
        <Link to={`/payment/checkout/${p.id}`} className="p-2 rounded-lg hover:bg-brand-orange/10 text-brand-orange inline-flex">
          <Eye size={16} />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN / PAYMENTS"
        title="إدارة المدفوعات"
        description="كل العمليات المالية في النظام"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-green-500 text-white rounded-xl border-[2.5px] border-brand-ink p-3 shadow-brutal-sm">
          <div className="text-xs font-mono opacity-90">مكتمل</div>
          <div className="font-display font-black text-xl">{totals.completed.toLocaleString()} EGP</div>
        </div>
        <div className="bg-yellow-300 text-yellow-900 rounded-xl border-[2.5px] border-brand-ink p-3 shadow-brutal-sm">
          <div className="text-xs font-mono opacity-90">معلّق</div>
          <div className="font-display font-black text-xl">{totals.pending.toLocaleString()} EGP</div>
        </div>
        <div className="bg-red-500 text-white rounded-xl border-[2.5px] border-brand-ink p-3 shadow-brutal-sm">
          <div className="text-xs font-mono opacity-90">فاشلة</div>
          <div className="font-display font-black text-xl">{totals.failed}</div>
        </div>
        <div className="bg-white text-brand-ink rounded-xl border-[2.5px] border-brand-ink p-3 shadow-brutal-sm">
          <div className="text-xs font-mono opacity-70">عدد العمليات</div>
          <div className="font-display font-black text-xl">{totals.count}</div>
        </div>
      </div>

      <div className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-4 mb-5 shadow-brutal-sm flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-brand-orange" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 px-3 rounded-xl border-2 border-brand-ink/15 focus:border-brand-orange focus:outline-none text-sm font-bold"
        >
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select
          value={gatewayFilter}
          onChange={(e) => setGatewayFilter(e.target.value)}
          className="py-2 px-3 rounded-xl border-2 border-brand-ink/15 focus:border-brand-orange focus:outline-none text-sm font-bold"
        >
          <option value="">كل البوابات</option>
          {Object.entries(GATEWAY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={payments}
        loading={isLoading}
        empty={<EmptyState icon={CreditCard} title="مفيش مدفوعات" />}
      />
    </div>
  );
}
