import { Check } from 'lucide-react';
import { useOrderWizard } from '@/store/orderWizard';

export default function Step3Addons({ addons }) {
  const { addonIds, toggleAddon, currency, pricing } = useOrderWizard();

  // Live per-addon prices come back in pricing.addon_lines when selected.
  const livePrice = (id) => pricing?.addon_lines?.find((l) => l.id === id)?.price;

  const label = (a) => {
    if (a.price_type === 'percentage') return `+${a.percentage}%`;
    const p = currency === 'SAR' && a.price_sar != null ? a.price_sar : a.price_egp;
    return `+${Number(p).toLocaleString()} ${currency}`;
  };

  return (
    <div>
      <h2 className="font-display font-black text-xl text-brand-ink mb-1">إضافات (اختياري)</h2>
      <p className="text-brand-ink/60 text-sm mb-6">اختار اللي محتاجه (تقدر تختار أكتر من واحد) — السعر بيتحدّث تلقائياً.</p>

      {addons.length === 0 && (
        <p className="text-brand-ink/50 text-sm">مفيش إضافات متاحة للخدمة دي.</p>
      )}

      <div className="space-y-3">
        {addons.map((a) => {
          const checked = addonIds.includes(a.id);
          const lp = livePrice(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAddon(a.id)}
              className={`w-full text-right rounded-2xl border-2 p-4 flex items-center justify-between gap-3 transition ${
                checked ? 'border-brand-teal bg-brand-teal/10' : 'border-brand-ink/20 bg-white hover:border-brand-ink'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-7 h-7 shrink-0 rounded-md border-[2.5px] border-brand-ink flex items-center justify-center transition ${
                    checked ? 'bg-brand-teal' : 'bg-brand-ink/5'
                  }`}
                  aria-hidden="true"
                >
                  {checked && <Check size={18} strokeWidth={3} className="text-brand-ink" />}
                </span>
                <span className="font-bold text-brand-ink text-sm truncate">{a.name_ar}</span>
              </span>
              <span className="font-display font-black text-brand-purple text-sm">
                {checked && lp != null ? `+${Number(lp).toLocaleString()} ${currency}` : label(a)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
