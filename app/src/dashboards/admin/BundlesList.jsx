import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminBundlesApi } from '@/api/orders';
import PageHeader from '@/components/dashboard/PageHeader';
import { CardGridSkeleton } from '@/components/Skeleton';
import BundleForm from './BundleForm';

export default function BundlesList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bundles'],
    queryFn: () => adminBundlesApi.list(),
  });

  const remove = useMutation({
    mutationFn: (id) => adminBundlesApi.remove(id),
    onSuccess: () => {
      toast.success('تم حذف الباقة المجمّعة');
      qc.invalidateQueries({ queryKey: ['admin-bundles'] });
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, is_active }) => adminBundlesApi.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-bundles'] }),
  });

  const bundles = data?.data || [];

  const discountLabel = (b) =>
    b.discount_type === 'percentage'
      ? `خصم ${Number(b.discount_value)}٪`
      : `خصم ${Number(b.discount_value).toLocaleString()} EGP`;

  return (
    <div>
      <PageHeader
        eyebrow="إدارة المحتوى"
        title="الباقات المجمّعة (Bundles)"
        description="مجموعات باقات بسعر مخفّض"
        action={
          <button
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
          >
            <Plus size={16} /> باقة مجمّعة جديدة
          </button>
        }
      />

      {isLoading ? (
        <CardGridSkeleton count={4} cols={2} />
      ) : bundles.length === 0 ? (
        <p className="text-brand-ink/60">مفيش باقات مجمّعة لسه.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {bundles.map((b) => (
            <div key={b.id} className={`card ${!b.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between mb-1">
                <div className="font-display font-black text-lg">{b.name_ar}</div>
                <span className="font-mono text-sm text-brand-orange font-black">{discountLabel(b)}</span>
              </div>
              {b.description_ar && <p className="text-sm opacity-70 mb-3">{b.description_ar}</p>}

              <div className="flex flex-wrap gap-1.5 mb-3">
                {b.packages?.map((p) => (
                  <span key={p.id} className="inline-flex items-center gap-1 bg-brand-ink/5 text-xs font-bold px-2 py-1 rounded-full">
                    <Package size={11} /> {p.name}
                  </span>
                ))}
                {(!b.packages || b.packages.length === 0) && (
                  <span className="text-xs text-brand-ink/50">مفيش باقات مربوطة</span>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-brand-ink/10">
                <button onClick={() => setEditing(b)} className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-brand-orange">
                  <Edit2 size={12} /> تعديل
                </button>
                <button onClick={() => toggle.mutate({ id: b.id, is_active: !b.is_active })} className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-brand-orange mr-auto">
                  {b.is_active ? <><EyeOff size={12} /> إخفاء</> : <><Eye size={12} /> إظهار</>}
                </button>
                <button onClick={() => window.confirm(`حذف ${b.name_ar}؟`) && remove.mutate(b.id)} className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800">
                  <Trash2 size={12} /> حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <BundleForm
          bundle={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ['admin-bundles'] });
          }}
        />
      )}
    </div>
  );
}
