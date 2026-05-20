import { Check } from 'lucide-react';
import { useOrderWizard } from '@/store/orderWizard';

export default function Step2SelectPackage({ packages }) {
  const { packageId, setPackage, currency } = useOrderWizard();

  const price = (p) => (currency === 'SAR' && p.price_sar != null ? p.price_sar : p.price);

  return (
    <div>
      <h2 className="font-display font-black text-xl text-brand-ink mb-1">اختار الباقة</h2>
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
                  ? 'border-brand-purple bg-brand-purple text-white shadow-[4px_4px_0_#0F0830]'
                  : 'border-brand-ink/20 bg-white text-brand-ink hover:border-brand-ink'
              }`}
            >
              {selected && (
                <span className="absolute top-3 left-3 w-6 h-6 rounded-full bg-white text-brand-purple flex items-center justify-center">
                  <Check size={14} />
                </span>
              )}
              {p.ribbon && (
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 ${selected ? 'bg-white/20 text-white' : 'bg-brand-orange/15 text-brand-ink'}`}>
                  {p.ribbon}
                </span>
              )}
              <div className="font-display font-black text-lg">{p.name}</div>
              <div className={`font-display font-black text-2xl mt-1 ${selected ? 'text-white' : 'text-brand-purple'}`}>
                {Number(price(p)).toLocaleString()} <span className="text-sm">{currency}</span>
              </div>
              {p.delivery_days && (
                <div className={`text-xs mt-1 ${selected ? 'text-white/80' : 'text-brand-ink/60'}`}>تسليم خلال {p.delivery_days} يوم</div>
              )}
              {Array.isArray(p.features) && (
                <ul className="mt-3 space-y-1">
                  {p.features.slice(0, 4).map((f, i) => (
                    <li key={i} className={`text-xs flex items-start gap-1 ${selected ? 'text-white/90' : 'text-brand-ink/70'}`}>
                      <Check size={13} className={`mt-0.5 shrink-0 ${selected ? 'text-white' : 'text-brand-teal'}`} /> {f}
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
