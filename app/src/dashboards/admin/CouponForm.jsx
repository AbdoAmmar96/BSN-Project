import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminCouponsApi } from '@/api/orders';
import { SERVICE_TYPE_LABELS } from '@/api/packages';

// HTML datetime-local wants `YYYY-MM-DDTHH:mm`.
const toLocalInput = (d) => (d ? new Date(d).toISOString().slice(0, 16) : '');

export default function CouponForm({ coupon, onClose, onSaved }) {
  const isEdit = !!coupon;

  const [form, setForm] = useState({
    code: coupon?.code || '',
    discount_type: coupon?.discount_type || 'percentage',
    discount_value: coupon?.discount_value || '',
    max_discount_egp: coupon?.max_discount_egp || '',
    usage_limit: coupon?.usage_limit || '',
    per_user_limit: coupon?.per_user_limit || '',
    is_active: coupon?.is_active ?? true,
    starts_at: toLocalInput(coupon?.starts_at),
    expires_at: toLocalInput(coupon?.expires_at),
  });
  const [services, setServices] = useState(coupon?.applies_to_services || []);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleService = (s) =>
    setServices((arr) => (arr.includes(s) ? arr.filter((x) => x !== s) : [...arr, s]));

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        max_discount_egp: form.discount_type === 'percentage' && form.max_discount_egp ? parseFloat(form.max_discount_egp) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        per_user_limit: form.per_user_limit ? Number(form.per_user_limit) : null,
        applies_to_services: services.length ? services : null,
        is_active: form.is_active,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
      };
      return isEdit ? adminCouponsApi.update(coupon.id, payload) : adminCouponsApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'تم تحديث الكوبون' : 'تم إنشاء الكوبون');
      onSaved();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'فشل الحفظ'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24 md:pt-32 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white text-brand-ink rounded-2xl border-2 border-brand-ink shadow-brutal mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-ink bg-brand-cream">
          <h3 className="font-display font-black text-lg">{isEdit ? `تعديل: ${coupon.code}` : 'كوبون جديد'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-ink/10" aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">الكود</label>
              <input type="text" className="field font-mono uppercase" required value={form.code} onChange={(e) => setField('code', e.target.value)} placeholder="WELCOME10" />
            </div>
            <div>
              <label className="label">نوع الخصم</label>
              <select className="field" value={form.discount_type} onChange={(e) => setField('discount_type', e.target.value)}>
                <option value="percentage">نسبة (٪)</option>
                <option value="fixed">مبلغ ثابت (EGP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">قيمة الخصم</label>
              <input type="number" step="0.01" min="0" className="field text-left" dir="ltr" required value={form.discount_value} onChange={(e) => setField('discount_value', e.target.value)} />
            </div>
            {form.discount_type === 'percentage' && (
              <div>
                <label className="label">حد أقصى للخصم (EGP)</label>
                <input type="number" step="0.01" min="0" className="field text-left" dir="ltr" value={form.max_discount_egp} onChange={(e) => setField('max_discount_egp', e.target.value)} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">حد الاستخدام الكلي</label>
              <input type="number" min="1" className="field text-left" dir="ltr" placeholder="بلا حدود" value={form.usage_limit} onChange={(e) => setField('usage_limit', e.target.value)} />
            </div>
            <div>
              <label className="label">حد الاستخدام لكل عميل</label>
              <input type="number" min="1" className="field text-left" dir="ltr" placeholder="بلا حدود" value={form.per_user_limit} onChange={(e) => setField('per_user_limit', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">الخدمات المسموحة (فاضي = كل الخدمات)</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => (
                <label key={k} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 cursor-pointer text-sm font-bold ${services.includes(k) ? 'border-brand-purple bg-brand-purple/10 text-brand-purple' : 'border-brand-ink/15 text-brand-ink/60'}`}>
                  <input type="checkbox" className="hidden" checked={services.includes(k)} onChange={() => toggleService(k)} />
                  {v}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">يبدأ (اختياري)</label>
              <input type="datetime-local" className="field text-left" dir="ltr" value={form.starts_at} onChange={(e) => setField('starts_at', e.target.value)} />
            </div>
            <div>
              <label className="label">ينتهي (اختياري)</label>
              <input type="datetime-local" className="field text-left" dir="ltr" value={form.expires_at} onChange={(e) => setField('expires_at', e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} />
            <span className="text-sm font-bold">نشط</span>
          </label>

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
