import { useState } from 'react';
import toast from 'react-hot-toast';
import { couponsApi } from '@/api/orders';
import { useOrderWizard } from '@/store/orderWizard';

export default function Step4ProjectDetails() {
  const w = useOrderWizard();
  const [checking, setChecking] = useState(false);

  const applyCoupon = async () => {
    if (!w.couponCode.trim()) return;
    setChecking(true);
    try {
      const res = await couponsApi.validate({
        code: w.couponCode.trim(),
        package_id: w.packageId,
        addon_ids: w.addonIds,
        currency: w.currency,
      });
      res.valid ? toast.success(res.message) : toast.error(res.message);
    } catch {
      toast.error('تعذّر التحقق من الكوبون');
    } finally {
      setChecking(false);
    }
  };

  const field = 'w-full rounded-xl border-2 border-brand-ink/25 focus:border-brand-purple px-4 py-2.5 text-brand-ink outline-none transition';

  return (
    <div>
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">تفاصيل المشروع</h2>
      <p className="text-brand-ink/60 text-sm mb-6">عرّفنا أكتر عن مشروعك.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-brand-ink mb-1.5">اسم المشروع *</label>
          <input
            className={field}
            value={w.projectName}
            onChange={(e) => w.setDetails({ projectName: e.target.value })}
            placeholder="مثلاً: متجر ملابس أونلاين"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-brand-ink mb-1.5">وصف مختصر</label>
          <textarea
            className={field}
            rows={4}
            value={w.description}
            onChange={(e) => w.setDetails({ description: e.target.value })}
            placeholder="إيه اللي محتاجه بالظبط؟"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-brand-ink mb-1.5">موعد إطلاق متوقع</label>
          <input
            type="date"
            className={field}
            value={w.expectedLaunchDate}
            onChange={(e) => w.setDetails({ expectedLaunchDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-brand-ink mb-1.5">كود خصم</label>
          <div className="flex gap-2">
            <input
              className={field}
              value={w.couponCode}
              onChange={(e) => w.setCoupon(e.target.value.toUpperCase())}
              placeholder="SUMMER2026"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={checking}
              className="px-4 rounded-xl bg-brand-ink text-white font-bold disabled:opacity-50 shrink-0"
            >
              {checking ? '...' : 'تطبيق'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
