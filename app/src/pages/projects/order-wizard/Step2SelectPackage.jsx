import { Check } from 'lucide-react';
import { useOrderWizard } from '@/store/orderWizard';

export default function Step2SelectPackage({ packages }) {
  const { packageId, setPackage, currency } = useOrderWizard();

  const price = (p) => (currency === 'SAR' && p.price_sar != null ? p.price_sar : p.price);

  return (
    <div>
      <h2 className="font-display font-black text-2xl text-brand-ink mb-1">اختار الباقة</h2>
      <p className="text-brand-ink/60 text-sm mb-6">قارن واختار اللي يناسبك.</p>

      {packages.length === 0 && (
        <p className="text-brand-ink/50 text-sm">مفيش باقات متاحة للخدمة دي حالياً.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {packages.map((p) => {
          const selected = packageId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPackage(p.id)}
              className={`text-right rounded-2xl border-[2.5px] p-5 transition relative ${
                selected
                  ? 'border-brand-purple bg-brand-purple/5 shadow-[4px_4px_0_#5C15CC]'
                  : 'border-brand-ink/20 bg-white hover:border-brand-ink'
              }`}
            >
              {selected && (
                <span className="absolute top-3 left-3 w-6 h-6 rounded-full bg-brand-purple text-white flex items-center justify-center">
                  <Check size={14} />
                </span>
              )}
              {p.ribbon && (
                <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-orange/15 text-brand-ink mb-2">
                  {p.ribbon}
                </span>
              )}
              <div className="font-display font-black text-lg text-brand-ink">{p.name}</div>
              <div className="font-display font-black text-2xl text-brand-purple mt-1">
                {Number(price(p)).toLocaleString()} <span className="text-sm">{currency}</span>
              </div>
              {p.delivery_days && (
                <div className="text-xs text-brand-ink/60 mt-1">تسليم خلال {p.delivery_days} يوم</div>
              )}
              {Array.isArray(p.features) && (
                <ul className="mt-3 space-y-1">
                  {p.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="text-xs text-brand-ink/70 flex items-start gap-1">
                      <Check size={13} className="text-brand-teal mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
