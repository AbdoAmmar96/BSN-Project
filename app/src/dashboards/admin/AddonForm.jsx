import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAddonsApi } from '@/api/orders';
import { SERVICE_TYPE_LABELS } from '@/api/packages';

export default function AddonForm({ addon, onClose, onSaved }) {
  const isEdit = !!addon;

  const [form, setForm] = useState({
    service_type: addon?.service_type || 'web',
    name_ar: addon?.name_ar || '',
    name_en: addon?.name_en || '',
    price_type: addon?.price_type || 'fixed',
    price_egp: addon?.price_egp || '',
    price_sar: addon?.price_sar || '',
    percentage: addon?.percentage || '',
    sort_order: addon?.sort_order ?? 0,
    is_active: addon?.is_active ?? true,
  });

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        service_type: form.service_type,
        name_ar: form.name_ar,
        name_en: form.name_en || null,
        price_type: form.price_type,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };
      if (form.price_type === 'fixed') {
        payload.price_egp = parseFloat(form.price_egp);
        payload.price_sar = form.price_sar ? parseFloat(form.price_sar) : null;
      } else {
        payload.percentage = parseFloat(form.percentage);
      }
      return isEdit ? adminAddonsApi.update(addon.id, payload) : adminAddonsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'تم تحديث الإضافة' : 'تم إنشاء الإضافة');
      onSaved();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'فشل الحفظ'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 md:pt-32 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white text-brand-ink rounded-2xl border-2 border-brand-ink shadow-brutal mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-ink bg-brand-cream">
          <h3 className="font-display font-black text-lg">{isEdit ? `تعديل: ${addon.name_ar}` : 'إضافة جديدة'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-ink/10" aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">نوع الخدمة</label>
              <select className="field" value={form.service_type} onChange={(e) => setField('service_type', e.target.value)} required>
                {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">نوع السعر</label>
              <select className="field" value={form.price_type} onChange={(e) => setField('price_type', e.target.value)}>
                <option value="fixed">مبلغ ثابت</option>
                <option value="percentage">نسبة من الباقة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الاسم (عربي)</label>
              <input type="text" className="field" required value={form.name_ar} onChange={(e) => setField('name_ar', e.target.value)} />
            </div>
            <div>
              <label className="label">الاسم (إنجليزي)</label>
              <input type="text" className="field" value={form.name_en} onChange={(e) => setField('name_en', e.target.value)} />
            </div>
          </div>

          {form.price_type === 'fixed' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">السعر (EGP)</label>
                <input type="number" step="0.01" className="field text-left" dir="ltr" required value={form.price_egp} onChange={(e) => setField('price_egp', e.target.value)} />
              </div>
              <div>
                <label className="label">السعر (SAR — اختياري)</label>
                <input type="number" step="0.01" className="field text-left" dir="ltr" value={form.price_sar} onChange={(e) => setField('price_sar', e.target.value)} />
              </div>
            </div>
          ) : (
            <div>
              <label className="label">النسبة (٪)</label>
              <input type="number" step="0.01" min="0" max="100" className="field text-left" dir="ltr" required value={form.percentage} onChange={(e) => setField('percentage', e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="label">ترتيب</label>
              <input type="number" className="field text-left" dir="ltr" value={form.sort_order} onChange={(e) => setField('sort_order', e.target.value)} />
            </div>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} />
              <span className="text-sm font-bold">نشطة (تظهر للعملاء)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-brand-ink/10">
            <button type="submit" disabled={save.isPending} className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform disabled:opacity-60">
              <Save size={16} /> {save.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
