import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { invoicesApi, INVOICE_STATUS } from '@/api/invoices';
import PageHeader from '@/components/dashboard/PageHeader';
import DataTable from '@/components/dashboard/DataTable';
import Badge from '@/components/dashboard/Badge';
import EmptyState from '@/components/dashboard/EmptyState';
import { FileText, Plus, Trash2, Edit, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminInvoicesList() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'invoices', { status }],
    queryFn: () => invoicesApi.list({ status, per_page: 30 }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => invoicesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'invoices'] });
      toast.success('تم الحذف');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });

  const onDelete = (inv) => {
    if (!confirm(`حذف فاتورة ${inv.invoice_number}؟`)) return;
    deleteMut.mutate(inv.id);
  };

  const invoices = data?.data?.data || [];

  const columns = [
    {
      key: 'invoice_number', label: 'الفاتورة',
      render: (i) => (
        <div>
          <div className="font-mono font-bold text-sm" dir="ltr">{i.invoice_number}</div>
          <div className="text-xs opacity-60 mt-0.5">{new Date(i.created_at).toLocaleDateString('ar-EG')}</div>
        </div>
      ),
    },
    {
      key: 'user', label: 'العميل',
      render: (i) => (
        <div className="text-sm">
          <div className="font-bold">{i.user?.name}</div>
          <div className="text-xs opacity-60">{i.user?.company || i.user?.email}</div>
        </div>
      ),
    },
    {
      key: 'project', label: 'المشروع',
      render: (i) => <span className="text-sm">{i.project?.title || '—'}</span>,
    },
    {
      key: 'total', label: 'الإجمالي', align: 'center',
      render: (i) => (
        <span className="font-display font-black">
          {Number(i.total).toLocaleString()} <span className="text-xs opacity-70 font-mono">{i.currency}</span>
        </span>
      ),
    },
    {
      key: 'status', label: 'الحالة', align: 'center',
      render: (i) => <Badge color={INVOICE_STATUS[i.status]?.color} size="sm">{INVOICE_STATUS[i.status]?.label}</Badge>,
    },
    {
      key: 'actions', label: '', align: 'center',
      render: (i) => (
        <div className="flex items-center justify-center gap-1">
          <Link to={`/admin/invoices/${i.id}`} className="p-2 rounded-lg hover:bg-brand-orange/10 text-brand-orange" title="تعديل">
            <Edit size={16} />
          </Link>
          <button onClick={() => onDelete(i)} className="p-2 rounded-lg hover:bg-red-100 text-red-600" title="حذف">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN / INVOICES"
        title="إدارة الفواتير"
        description="إصدار وتعديل فواتير العملاء"
        action={
          <Link to="/admin/invoices/new" className="btn-primary">
            <Plus size={16} /> فاتورة جديدة
          </Link>
        }
      />

      <div className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-4 mb-5 shadow-brutal-sm flex flex-wrap gap-3 items-center">
        <Filter size={16} className="text-brand-orange" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="py-2 px-3 rounded-xl border-2 border-brand-ink/15 focus:border-brand-orange focus:outline-none text-sm font-bold"
        >
          <option value="">كل الحالات</option>
          {Object.entries(INVOICE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        rows={invoices}
        loading={isLoading}
        empty={
          <EmptyState
            icon={FileText}
            title="مفيش فواتير لسه"
            description="ابدأ بإصدار أول فاتورة لعميل"
            action={<Link to="/admin/invoices/new" className="btn-primary inline-flex"><Plus size={16} /> فاتورة جديدة</Link>}
          />
        }
      />
    </div>
  );
}
