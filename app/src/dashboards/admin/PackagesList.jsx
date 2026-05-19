import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { packagesApi, SERVICE_TYPE_LABELS } from '@/api/packages';
import PageHeader from '@/components/dashboard/PageHeader';
import Badge from '@/components/dashboard/Badge';
import PackageForm from './PackageForm';
import { CardGridSkeleton } from '@/components/Skeleton';
import toast from 'react-hot-toast';

export default function PackagesList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // package | 'new' | null

  const { data, isLoading } = useQuery({
    queryKey: ['packages', 'admin'],
    queryFn: () => packagesApi.adminList(),
  });

  const remove = useMutation({
    mutationFn: (id) => packagesApi.remove(id),
    onSuccess: () => {
      toast.success('تم حذف الباقة');
      qc.invalidateQueries({ queryKey: ['packages'] });
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, is_active }) => packagesApi.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['packages'] }),
  });

  const packages = data?.data || [];
  const grouped = packages.reduce((acc, p) => {
    (acc[p.service_type] ||= []).push(p);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        eyebrow="إدارة الباقات"
        title="الباقات والأسعار"
        description="عدّل الباقات اللي بتظهر في صفحة الأسعار"
        action={
          <button
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
          >
            <Plus size={16} /> باقة جديدة
          </button>
        }
      />

      {isLoading ? (
        <CardGridSkeleton count={6} cols={3} />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h3 className="font-display font-black text-lg mb-3 text-brand-purple">
                {SERVICE_TYPE_LABELS[type] || type}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className={`card relative ${!p.is_active ? 'opacity-50' : ''}`}
                  >
                    {p.featured && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Star size={10} /> مميزة
                      </span>
                    )}

                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-display font-black text-lg">{p.name}</div>
                        {p.ribbon && (
                          <Badge color="bg-brand-teal text-brand-purple-deep" size="sm">
                            {p.ribbon}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="text-xs opacity-60 font-mono">{p.price_prefix || ''}</span>
                      <span className="font-display font-black text-2xl text-brand-orange">
                        {' '}{Number(p.price).toLocaleString()}
                      </span>
                      <span className="text-xs opacity-70 mr-1">{p.currency}</span>
                      {p.period && <span className="text-xs opacity-70">{p.period}</span>}
                    </div>

                    {p.note && <p className="text-sm opacity-70 mb-2">{p.note}</p>}

                    {p.features?.length > 0 && (
                      <ul className="text-xs space-y-1 mb-3">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-brand-teal">✓</span> {f}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-brand-ink/10">
                      <button
                        onClick={() => setEditing(p)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-brand-orange"
                      >
                        <Edit2 size={12} /> تعديل
                      </button>
                      <button
                        onClick={() => toggle.mutate({ id: p.id, is_active: !p.is_active })}
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-brand-orange mr-auto"
                      >
                        {p.is_active ? <><EyeOff size={12} /> إخفاء</> : <><Eye size={12} /> إظهار</>}
                      </button>
                      <button
                        onClick={() => window.confirm(`حذف ${p.name}؟`) && remove.mutate(p.id)}
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
        <PackageForm
          package={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ['packages'] });
          }}
        />
      )}
    </div>
  );
}
