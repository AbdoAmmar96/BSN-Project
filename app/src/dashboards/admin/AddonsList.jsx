import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAddonsApi } from '@/api/orders';
import { SERVICE_TYPE_LABELS } from '@/api/packages';
import PageHeader from '@/components/dashboard/PageHeader';
import { CardGridSkeleton } from '@/components/Skeleton';
import AddonForm from './AddonForm';

export default function AddonsList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // addon | 'new' | null

  const { data, isLoading } = useQuery({
    queryKey: ['admin-addons'],
    queryFn: () => adminAddonsApi.list(),
  });

  const remove = useMutation({
    mutationFn: (id) => adminAddonsApi.remove(id),
    onSuccess: () => {
      toast.success('تم حذف الإضافة');
      qc.invalidateQueries({ queryKey: ['admin-addons'] });
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, is_active }) => adminAddonsApi.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-addons'] }),
  });

  const addons = data?.data || [];
  const grouped = addons.reduce((acc, a) => {
    (acc[a.service_type] ||= []).push(a);
    return acc;
  }, {});

  const priceLabel = (a) =>
    a.price_type === 'percentage'
      ? `${Number(a.percentage)}٪ من الباقة`
      : `${Number(a.price_egp).toLocaleString()} EGP${a.price_sar ? ` · ${Number(a.price_sar).toLocaleString()} SAR` : ''}`;

  return (
    <div>
      <PageHeader
        eyebrow="إدارة المحتوى"
        title="الإضافات (Add-ons)"
        description="الإضافات اللي بتظهر في الـ Order Wizard"
        action={
          <button
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
          >
            <Plus size={16} /> إضافة جديدة
          </button>
        }
      />

      {isLoading ? (
        <CardGridSkeleton count={6} cols={3} />
      ) : addons.length === 0 ? (
        <p className="text-brand-ink/60">مفيش إضافات لسه.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h3 className="font-display font-black text-lg mb-3 text-brand-purple">
                {SERVICE_TYPE_LABELS[type] || type}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((a) => (
                  <div key={a.id} className={`card ${!a.is_active ? 'opacity-50' : ''}`}>
                    <div className="font-display font-black text-base mb-1">{a.name_ar}</div>
                    {a.name_en && <div className="text-xs opacity-60 mb-2">{a.name_en}</div>}
                    <div className="font-mono text-sm text-brand-orange font-black mb-3">{priceLabel(a)}</div>
                    <div className="flex gap-2 pt-3 border-t border-brand-ink/10">
                      <button
                        onClick={() => setEditing(a)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-brand-orange"
                      >
                        <Edit2 size={12} /> تعديل
                      </button>
                      <button
                        onClick={() => toggle.mutate({ id: a.id, is_active: !a.is_active })}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-brand-orange mr-auto"
                      >
                        {a.is_active ? <><EyeOff size={12} /> إخفاء</> : <><Eye size={12} /> إظهار</>}
                      </button>
                      <button
                        onClick={() => window.confirm(`حذف ${a.name_ar}؟`) && remove.mutate(a.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={12} /> حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AddonForm
          addon={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ['admin-addons'] });
          }}
        />
      )}
    </div>
  );
}
