import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminBundlesApi } from '@/api/orders';
import { packagesApi, SERVICE_TYPE_LABELS } from '@/api/packages';

export default function BundleForm({ bundle, onClose, onSaved }) {
  const isEdit = !!bundle;

  const [form, setForm] = useState({
    name_ar: bundle?.name_ar || '',
    name_en: bundle?.name_en || '',
    description_ar: bundle?.description_ar || '',
    discount_type: bundle?.discount_type || 'percentage',
    discount_value: bundle?.discount_value || '',
    sort_order: bundle?.sort_order ?? 0,
    is_active: bundle?.is_active ?? true,
  });
  const [packageIds, setPackageIds] = useState((bundle?.packages || []).map((p) => p.id));

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const togglePackage = (id) =>
    setPackageIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const { data: pkgData } = useQuery({ queryKey: ['packages', 'admin'], queryFn: () => packagesApi.adminList() });
  const packages = pkgData?.data || [];

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        name_ar: form.name_ar,
        name_en: form.name_en || null,
        description_ar: form.description_ar || null,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
        package_ids: packageIds,
      };
      return isEdit ? adminBundlesApi.update(bundle.id, payload) : adminBundlesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'تم تحديث الباقة المجمّعة' : 'تم إنشاء الباقة المجمّعة');
      onSaved();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'فشل الحفظ'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 md:pt-32 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white text-brand-ink rounded-2xl border-2 border-brand-ink shadow-brutal mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-ink bg-brand-cream">
          <h3 className="font-display font-black text-lg">{isEdit ? `تعديل: ${bundle.name_ar}` : 'باقة مجمّعة جديدة'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-ink/10" aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="p-5 space-y-4">
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

          <div>
            <label className="label">وصف قصير</label>
            <input type="text" className="field" value={form.description_ar} onChange={(e) => setField('description_ar', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">نوع الخصم</label>
              <select className="field" value={form.discount_type} onChange={(e) => setField('discount_type', e.target.value)}>
                <option value="percentage">نسبة (٪)</option>
                <option value="fixed">مبلغ ثابت (EGP)</option>
              </select>
            </div>
            <div>
              <label className="label">قيمة الخصم</label>
              <input type="number" step="0.01" min="0" className="field text-left" dir="ltr" required value={form.discount_value} onChange={(e) => setField('discount_value', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">الباقات داخل المجموعة</label>
            <div className="max-h-48 overflow-y-auto border-2 border-brand-ink/15 rounded-xl p-2 space-y-1">
              {packages.length === 0 && <p className="text-xs text-brand-ink/50 p-2">مفيش باقات.</p>}
              {packages.map((p) => (
                <label key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-brand-ink/5 cursor-pointer">
                  <input type="checkbox" checked={packageIds.includes(p.id)} onChange={() => togglePackage(p.id)} />
                  <span className="text-sm font-bold">{p.name}</span>
                  <span className="text-xs text-brand-ink/50 mr-auto">{SERVICE_TYPE_LABELS[p.service_type] || p.service_type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="label">ترتيب</label>
              <input type="number" className="field text-left" dir="ltr" value={form.sort_order} onChange={(e) => setField('sort_order', e.target.value)} />
            </div>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} />
              <span className="text-sm font-bold">نشطة</span>
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
