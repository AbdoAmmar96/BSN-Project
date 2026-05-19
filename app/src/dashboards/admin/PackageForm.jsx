import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { packagesApi, SERVICE_TYPE_LABELS } from '@/api/packages';
import toast from 'react-hot-toast';

export default function PackageForm({ package: pkg, onClose, onSaved }) {
  const isEdit = !!pkg;

  const [form, setForm] = useState({
    service_type: pkg?.service_type || 'web',
    name: pkg?.name || '',
    price: pkg?.price || '',
    currency: pkg?.currency || 'EGP',
    price_prefix: pkg?.price_prefix || '',
    period: pkg?.period || '',
    note: pkg?.note || '',
    features: pkg?.features || [''],
    featured: pkg?.featured || false,
    ribbon: pkg?.ribbon || '',
    sort_order: pkg?.sort_order ?? 0,
    is_active: pkg?.is_active ?? true,
  });

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        features: form.features.filter(f => f.trim()),
      };
      return isEdit ? packagesApi.update(pkg.id, payload) : packagesApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'تم تحديث الباقة' : 'تم إنشاء الباقة');
      onSaved();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'فشل الحفظ'),
  });

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setFeature = (i, v) => setForm(f => {
    const features = [...f.features];
    features[i] = v;
    return { ...f, features };
  });
  const addFeature = () => setForm(f => ({ ...f, features: [...f.features, ''] }));
  const removeFeature = (i) => setForm(f => ({
    ...f, features: f.features.filter((_, idx) => idx !== i),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 md:pt-32 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white text-brand-ink rounded-2xl border-2 border-brand-ink shadow-brutal mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-ink bg-brand-cream">
          <h3 className="font-display font-black text-lg">
            {isEdit ? `تعديل: ${pkg.name}` : 'باقة جديدة'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand-ink/10"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
          className="p-5 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">نوع الخدمة</label>
              <select
                className="field"
                value={form.service_type}
                onChange={(e) => setField('service_type', e.target.value)}
                required
              >
                {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">اسم الباقة</label>
              <input
                type="text" className="field" required
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">السعر</label>
              <input
                type="number" step="0.01" className="field text-left" dir="ltr" required
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
              />
            </div>
            <div>
              <label className="label">العملة</label>
              <select
                className="field"
                value={form.currency}
                onChange={(e) => setField('currency', e.target.value)}
              >
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
            <div>
              <label className="label">بادئة السعر</label>
              <input
                type="text" className="field" placeholder="مثل: من"
                value={form.price_prefix}
                onChange={(e) => setField('price_prefix', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">فترة (اختياري)</label>
              <input
                type="text" className="field" placeholder="/شهر"
                value={form.period}
                onChange={(e) => setField('period', e.target.value)}
              />
            </div>
            <div>
              <label className="label">شريط (Ribbon)</label>
              <input
                type="text" className="field" placeholder="مثل: الأكتر طلباً"
                value={form.ribbon}
                onChange={(e) => setField('ribbon', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">وصف قصير</label>
            <input
              type="text" className="field"
              value={form.note}
              onChange={(e) => setField('note', e.target.value)}
            />
          </div>

          <div>
            <label className="label">المميزات</label>
            <div className="space-y-2">
              {form.features.map((f, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text" className="field flex-1"
                    placeholder={`الميزة ${i + 1}`}
                    value={f}
                    onChange={(e) => setFeature(i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(i)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-purple hover:text-brand-orange"
              >
                <Plus size={14} /> إضافة ميزة
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <label className="label">ترتيب</label>
              <input
                type="number" className="field text-left" dir="ltr"
                value={form.sort_order}
                onChange={(e) => setField('sort_order', parseInt(e.target.value) || 0)}
              />
            </div>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setField('featured', e.target.checked)}
              />
              <span className="text-sm font-bold">مميزة (featured)</span>
            </label>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setField('is_active', e.target.checked)}
              />
              <span className="text-sm font-bold">نشطة (تظهر للعملاء)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-brand-ink/10">
            <button
              type="submit"
              disabled={save.isPending}
              className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform disabled:opacity-60"
            >
              <Save size={16} /> {save.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
