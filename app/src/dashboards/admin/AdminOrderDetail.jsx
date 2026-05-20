import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminOrdersApi } from '@/api/leads';
import { usersApi } from '@/api/users';
import PageHeader from '@/components/dashboard/PageHeader';
import Skeleton from 'react-loading-skeleton';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [devId, setDevId] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['admin-order', id], queryFn: () => adminOrdersApi.show(id) });
  const order = data?.order;

  // Active developers for the assignment picker.
  const { data: devData } = useQuery({
    queryKey: ['developers'],
    queryFn: () => usersApi.list({ role: 'developer', is_active: true }),
  });
  const developers = devData?.data?.data ?? devData?.data ?? [];

  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-order', id] });

  const assign = useMutation({
    mutationFn: () => adminOrdersApi.assign(id, Number(devId)),
    onSuccess: () => { toast.success('تم القبول وتعيين الـ developer'); refresh(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });
  const hold = useMutation({
    mutationFn: () => adminOrdersApi.hold(id),
    onSuccess: () => { toast.success('تم تعليق الطلب'); refresh(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });
  const cancel = useMutation({
    mutationFn: () => adminOrdersApi.cancel(id, ''),
    onSuccess: () => { toast.success('تم إلغاء الطلب'); refresh(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });

  if (isLoading) return <Skeleton count={6} height={28} />;
  if (!order) return <p className="text-brand-ink/60">الطلب غير موجود.</p>;

  const fmt = (v) => `${Number(v || 0).toLocaleString()} ${order.currency}`;
  const needsAssign = order.status === 'paid' && !order.assigned_developer_id;

  return (
    <div>
      <PageHeader title={`الطلب ${order.order_number}`} subtitle={`${order.user?.name} · ${order.user?.email}`} />

      {/* Assignment panel — Flow E */}
      {needsAssign && (
        <div className="rounded-2xl border-[2.5px] border-brand-orange bg-brand-orange/5 p-5 mb-5">
          <h3 className="font-display font-black text-brand-ink mb-3">قبول الطلب وتعيين developer</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={devId}
              onChange={(e) => setDevId(e.target.value)}
              className="rounded-xl border-2 border-brand-ink/25 px-4 py-2.5 text-brand-ink outline-none focus:border-brand-purple min-w-[200px]"
            >
              <option value="">اختار developer...</option>
              {developers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button onClick={() => assign.mutate()} disabled={!devId || assign.isPending} className="px-5 py-2.5 rounded-xl bg-brand-orange text-white font-black disabled:opacity-40">
              قبول وتعيين
            </button>
            <button onClick={() => hold.mutate()} disabled={hold.isPending} className="px-4 py-2.5 rounded-xl border-2 border-brand-ink bg-white font-bold text-brand-ink">
              تعليق للتوضيح
            </button>
            <button onClick={() => { if (confirm('إلغاء الطلب؟')) cancel.mutate(); }} disabled={cancel.isPending} className="px-4 py-2.5 rounded-xl border-2 border-red-300 bg-white font-bold text-red-600">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {order.assigned_developer && (
        <div className="rounded-xl bg-brand-teal/10 p-3 mb-5 text-sm text-brand-ink">
          المطوّر المعيّن: <strong>{order.assigned_developer.name}</strong>
        </div>
      )}

      {/* Order summary */}
      <div className="rounded-2xl border-2 border-brand-ink/15 bg-white p-5">
        <h3 className="font-display font-black text-brand-ink mb-1">{order.project_name}</h3>
        {order.description && <p className="text-brand-ink/70 text-sm mb-4">{order.description}</p>}

        <div className="space-y-1.5 text-sm">
          <Row label="الحالة" value={order.status} />
          <Row label="الباقة" value={order.package?.name} />
          {order.addons?.map((a) => <Row key={a.id} label={`+ ${a.addon?.name_ar}`} value={fmt(a.price)} />)}
          <hr className="my-2 border-brand-ink/10" />
          <Row label="الإجمالي" value={fmt(order.total)} strong />
          <Row label="العربون المدفوع" value={fmt(order.deposit_amount)} />
        </div>

        {order.attachments?.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold text-brand-ink/60 mb-2">المرفقات</h4>
            {order.attachments.map((f) => (
              <a key={f.id} href={f.url} target="_blank" rel="noreferrer" className="block text-sm text-brand-purple">{f.original_name}</a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className={`flex items-center justify-between ${strong ? 'font-display font-black text-brand-ink' : 'text-brand-ink/75'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
