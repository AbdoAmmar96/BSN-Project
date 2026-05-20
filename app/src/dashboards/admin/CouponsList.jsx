import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminCouponsApi } from '@/api/orders';
import PageHeader from '@/components/dashboard/PageHeader';
import { CardGridSkeleton } from '@/components/Skeleton';
import CouponForm from './CouponForm';

export default function CouponsList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminCouponsApi.list(),
  });

  const remove = useMutation({
    mutationFn: (id) => adminCouponsApi.remove(id),
    onSuccess: () => {
      toast.success('تم حذف الكوبون');
      qc.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, is_active }) => adminCouponsApi.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
  });

  const coupons = data?.data || [];

  const discountLabel = (c) =>
    c.discount_type === 'percentage'
      ? `${Number(c.discount_value)}٪${c.max_discount_egp ? ` (حد أقصى ${Number(c.max_discount_egp).toLocaleString()} EGP)` : ''}`
      : `${Number(c.discount_value).toLocaleString()} EGP`;

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('ar-EG') : '—');

  return (
    <div>
      <PageHeader
        eyebrow="إدارة المحتوى"
        title="كوبونات الخصم"
        description="أكواد الخصم اللي العميل بيدخلها في الـ checkout"
        action={
          <button
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
          >
            <Plus size={16} /> كوبون جديد
          </button>
        }
      />

      {isLoading ? (
        <CardGridSkeleton count={4} cols={2} />
      ) : coupons.length === 0 ? (
        <p className="text-brand-ink/60">مفيش كوبونات لسه.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border-2 border-brand-ink/15 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-brand-ink/5 text-brand-ink/70 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-bold">الكود</th>
                <th className="text-right px-4 py-3 font-bold">الخصم</th>
                <th className="text-right px-4 py-3 font-bold">الاستخدام</th>
                <th className="text-right px-4 py-3 font-bold">ينتهي</th>
                <th className="text-right px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className={`border-t border-brand-ink/10 ${!c.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-mono font-black text-brand-purple">{c.code}</td>
                  <td className="px-4 py-3">{discountLabel(c)}</td>
                  <td className="px-4 py-3 font-mono">{c.usage_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                  <td className="px-4 py-3">{fmtDate(c.expires_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${c.is_active ? 'text-brand-teal' : 'text-brand-ink/50'}`}>
                      {c.is_active ? 'نشط' : 'متوقف'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => setEditing(c)} className="text-brand-purple hover:text-brand-orange" title="تعديل"><Edit2 size={15} /></button>
                      <button onClick={() => toggle.mutate({ id: c.id, is_active: !c.is_active })} className="text-brand-purple hover:text-brand-orange" title={c.is_active ? 'إيقاف' : 'تفعيل'}>
                        {c.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button onClick={() => window.confirm(`حذف ${c.code}؟`) && remove.mutate(c.id)} className="text-red-600 hover:text-red-800" title="حذف"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <CouponForm
          coupon={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ['admin-coupons'] });
          }}
        />
      )}
    </div>
  );
}
