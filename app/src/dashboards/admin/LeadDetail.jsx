import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, Plus, Send } from 'lucide-react';
import { adminLeadsApi, adminQuotesApi } from '@/api/leads';
import PageHeader from '@/components/dashboard/PageHeader';
import Skeleton from 'react-loading-skeleton';

export default function LeadDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-lead', id], queryFn: () => adminLeadsApi.show(id) });
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-lead', id] });

  const lead = data?.lead;
  // Working on the latest draft quote, if any.
  const draftQuote = lead?.quotes?.find((q) => q.status === 'draft');

  const assign = useMutation({ mutationFn: () => adminLeadsApi.assign(id), onSuccess: () => { toast.success('تم التعيين'); refresh(); } });
  const build = useMutation({
    mutationFn: () => adminLeadsApi.buildQuote(id, { estimated_days: 30 }),
    onSuccess: () => { toast.success('تم إنشاء مسودة عرض'); refresh(); },
  });

  if (isLoading) return <Skeleton count={6} height={28} />;
  if (!lead) return <p className="text-brand-ink/60">الطلب غير موجود.</p>;

  return (
    <div>
      <PageHeader title={lead.title} subtitle={`${lead.lead_number} · ${lead.user?.name}`}>
        {!lead.assigned_admin_id && (
          <button onClick={() => assign.mutate()} className="px-4 py-2 rounded-xl bg-brand-ink text-white font-bold text-sm">عيّن نفسي</button>
        )}
      </PageHeader>

      {/* Lead info */}
      <div className="rounded-2xl border-2 border-brand-ink/15 bg-white p-5 mb-5">
        <p className="text-sm text-brand-ink/80 mb-3">{lead.description}</p>
        <div className="text-xs text-brand-ink/60 space-y-1">
          <div>الخدمة: <strong>{lead.service_type}</strong></div>
          {lead.budget_min_egp && <div>الميزانية: {Number(lead.budget_min_egp).toLocaleString()} – {Number(lead.budget_max_egp).toLocaleString()} EGP</div>}
          {lead.smart_answers && Object.entries(lead.smart_answers).map(([k, v]) => <div key={k}>• {k}: {String(v)}</div>)}
        </div>
      </div>

      {/* Quote builder */}
      {!draftQuote ? (
        <button onClick={() => build.mutate()} disabled={build.isPending} className="px-5 py-2.5 rounded-xl bg-brand-purple text-white font-bold disabled:opacity-50">
          + ابني عرض سعر
        </button>
      ) : (
        <QuoteBuilder quote={draftQuote} onChange={refresh} />
      )}

      {/* Sent quotes history */}
      {lead.quotes?.filter((q) => q.status !== 'draft').length > 0 && (
        <div className="mt-6">
          <h3 className="font-display font-black text-brand-ink mb-2 text-sm">العروض المرسلة</h3>
          {lead.quotes.filter((q) => q.status !== 'draft').map((q) => (
            <div key={q.id} className="flex items-center justify-between text-sm border-2 border-brand-ink/10 rounded-xl p-3 mb-2">
              <span>{q.quote_number} · نسخة {q.version}</span>
              <span className="font-bold">{Number(q.total).toLocaleString()} {q.currency} · {q.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuoteBuilder({ quote, onChange }) {
  const [item, setItem] = useState({ label: '', unit_price: '', quantity: 1 });
  const field = 'rounded-lg border-2 border-brand-ink/20 px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-purple';

  const addItem = useMutation({
    mutationFn: () => adminQuotesApi.addItem(quote.id, { label: item.label, unit_price: Number(item.unit_price), quantity: Number(item.quantity) }),
    onSuccess: () => { setItem({ label: '', unit_price: '', quantity: 1 }); onChange(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });
  const removeItem = useMutation({ mutationFn: (itemId) => adminQuotesApi.removeItem(quote.id, itemId), onSuccess: onChange });
  const send = useMutation({
    mutationFn: () => adminQuotesApi.send(quote.id),
    onSuccess: () => { toast.success('تم إرسال العرض للعميل'); onChange(); },
    onError: (e) => toast.error(e.response?.data?.message || 'حصل خطأ'),
  });

  return (
    <div className="rounded-2xl border-[2.5px] border-brand-ink bg-white p-5 shadow-[5px_5px_0_#5C15CC]">
      <h3 className="font-display font-black text-brand-ink mb-3">بناء العرض ({quote.quote_number} · نسخة {quote.version})</h3>

      <div className="space-y-2 mb-4">
        {quote.items?.map((it) => (
          <div key={it.id} className="flex items-center justify-between text-sm bg-brand-ink/5 rounded-lg px-3 py-2">
            <span className="text-brand-ink">{it.label} {it.quantity > 1 ? `×${it.quantity}` : ''}</span>
            <span className="flex items-center gap-3">
              <strong className="text-brand-ink">{Number(it.total).toLocaleString()}</strong>
              <button onClick={() => removeItem.mutate(it.id)} className="text-red-500"><Trash2 size={15} /></button>
            </span>
          </div>
        ))}
        {(!quote.items || quote.items.length === 0) && <p className="text-xs text-brand-ink/50">مفيش بنود بعد.</p>}
      </div>

      {/* Add item row */}
      <div className="flex flex-wrap gap-2 items-end mb-4">
        <input className={`${field} flex-1 min-w-[140px]`} placeholder="البند" value={item.label} onChange={(e) => setItem({ ...item, label: e.target.value })} />
        <input className={`${field} w-28`} type="number" placeholder="السعر" value={item.unit_price} onChange={(e) => setItem({ ...item, unit_price: e.target.value })} />
        <input className={`${field} w-16`} type="number" min="1" value={item.quantity} onChange={(e) => setItem({ ...item, quantity: e.target.value })} />
        <button onClick={() => addItem.mutate()} disabled={!item.label || !item.unit_price} className="px-3 py-2 rounded-lg bg-brand-ink text-white disabled:opacity-40"><Plus size={16} /></button>
      </div>

      <div className="flex items-center justify-between border-t-2 border-brand-ink/10 pt-3">
        <span className="font-display font-black text-brand-ink">الإجمالي: {Number(quote.total).toLocaleString()} {quote.currency}</span>
        <button onClick={() => send.mutate()} disabled={send.isPending || !quote.items?.length} className="px-5 py-2 rounded-xl bg-brand-orange text-white font-black disabled:opacity-50">
          <Send size={15} className="inline" /> إرسال للعميل
        </button>
      </div>
    </div>
  );
}
