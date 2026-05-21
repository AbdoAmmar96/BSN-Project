import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminPortfolioApi } from '@/api/portfolio';
import PageHeader from '@/components/dashboard/PageHeader';
import { CardGridSkeleton } from '@/components/Skeleton';
import PortfolioForm from './PortfolioForm';

const CATEGORY_LABELS = { web: 'المواقع', ecommerce: 'المتاجر' };

// Same auto-screenshot fallback the public page uses, so the admin preview matches.
const screenshotUrl = (url) => `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=400&h=260`;

export default function PortfolioList() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // work | 'new' | null

  const { data, isLoading } = useQuery({
    queryKey: ['admin-portfolio'],
    queryFn: () => adminPortfolioApi.list(),
  });

  const remove = useMutation({
    mutationFn: (id) => adminPortfolioApi.remove(id),
    onSuccess: () => {
      toast.success('تم حذف العمل');
      qc.invalidateQueries({ queryKey: ['admin-portfolio'] });
    },
  });

  const toggle = useMutation({
    mutationFn: (work) => {
      const fd = new FormData();
      // The update endpoint re-validates the whole record, so resend the required fields.
      fd.append('title', work.title);
      fd.append('url', work.url);
      fd.append('category', work.category);
      fd.append('tag', work.tag || '');
      fd.append('company_ar', work.company_ar || '');
      fd.append('description', work.description || '');
      fd.append('sort_order', work.sort_order ?? 0);
      (work.tech || []).forEach(() => {});
      fd.append('tech', JSON.stringify(work.tech || []));
      fd.append('is_active', work.is_active ? '0' : '1');
      return adminPortfolioApi.update(work.id, fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-portfolio'] }),
    onError: (e) => toast.error(e.response?.data?.message || 'فشل التحديث'),
  });

  const works = data?.data || [];
  const grouped = works.reduce((acc, w) => {
    (acc[w.category] ||= []).push(w);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        eyebrow="إدارة المحتوى"
        title="أعمالنا (Portfolio)"
        description="الأعمال اللي بتظهر في صفحة أعمالنا — تقدر تعدّل اللينك والعنوان والوسوم والصورة"
        action={
          <button
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
          >
            <Plus size={16} /> عمل جديد
          </button>
        }
      />

      {isLoading ? (
        <CardGridSkeleton count={6} cols={3} />
      ) : works.length === 0 ? (
        <p className="text-brand-ink/60">مفيش أعمال لسه.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="font-display font-black text-lg mb-3 text-brand-purple">
                {CATEGORY_LABELS[cat] || cat} · {items.length}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((w) => (
                  <div key={w.id} className={`card flex flex-col h-full !p-0 overflow-hidden ${!w.is_active ? 'opacity-50' : ''}`}>
                    <div className="aspect-[16/10] bg-brand-ink/5 border-b-2 border-brand-ink/10 overflow-hidden">
                      <img
                        src={w.image_url || screenshotUrl(w.url)}
                        alt={w.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      {w.tag && <div className="text-[11px] font-mono font-bold text-brand-orange mb-1">{w.tag}</div>}
                      <div className="font-display font-black text-base">{w.title}</div>
                      {w.company_ar && <div className="text-xs text-brand-ink/60 mt-0.5">{w.company_ar}</div>}
                      {Array.isArray(w.tech) && w.tech.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {w.tech.map((t) => (
                            <span key={t} className="text-[10px] font-mono font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/20 rounded-full px-2 py-0.5">{t}</span>
                          ))}
                        </div>
                      )}
                      <a href={w.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-ink/50 hover:text-brand-purple mt-2 truncate">
                        <ExternalLink size={11} className="shrink-0" /> <span className="truncate">{w.url}</span>
                      </a>
                      <div className="flex gap-2 pt-3 mt-auto border-t border-brand-ink/10">
                        <button
                          onClick={() => setEditing(w)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-brand-orange"
                        >
                          <Edit2 size={12} /> تعديل
                        </button>
                        <button
                          onClick={() => toggle.mutate(w)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-brand-orange mr-auto"
                        >
                          {w.is_active ? <><EyeOff size={12} /> إخفاء</> : <><Eye size={12} /> إظهار</>}
                        </button>
                        <button
                          onClick={() => window.confirm(`حذف ${w.title}؟`) && remove.mutate(w.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={12} /> حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <PortfolioForm
          work={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            qc.invalidateQueries({ queryKey: ['admin-portfolio'] });
          }}
        />
      )}
    </div>
  );
}
