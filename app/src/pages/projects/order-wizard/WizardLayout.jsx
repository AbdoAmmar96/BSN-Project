import { Check } from 'lucide-react';
import { useOrderWizard } from '@/store/orderWizard';

const STEPS = [
  { n: 1, label: 'الخدمة' },
  { n: 2, label: 'الباقة' },
  { n: 3, label: 'الإضافات' },
  { n: 4, label: 'التفاصيل' },
  { n: 5, label: 'المراجعة' },
];

/**
 * Shared chrome for the order wizard: a top progress stepper and a sticky
 * footer showing the running total + 40% deposit. Children render the active
 * step's body; the footer's buttons are passed in per step.
 */
export default function WizardLayout({ children, footer }) {
  const { step, pricing, currency } = useOrderWizard();

  const fmt = (v) => `${Number(v || 0).toLocaleString()} ${currency}`;

  return (
    <div className="pb-28">
      {/* Stepper */}
      <ol className="flex items-center justify-between gap-1 mb-5 max-w-xl mx-auto">
        {STEPS.map((s, i) => {
          const done = step > s.n;
          const active = step === s.n;
          return (
            <li key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-sm border-2 border-brand-ink transition ${
                    done ? 'bg-brand-teal text-brand-ink'
                      : active ? 'bg-brand-purple text-white'
                      : 'bg-white text-brand-ink/40'
                  }`}
                >
                  {done ? <Check size={16} /> : s.n}
                </span>
                <span className={`text-[11px] font-bold ${active ? 'text-white' : 'text-white/50'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={`h-0.5 flex-1 mx-1 ${step > s.n ? 'bg-brand-teal' : 'bg-brand-ink/15'}`} />
              )}
            </li>
          );
        })}
      </ol>

      {/* Step body — wrapped in a light card so dark text reads against the
          dashboard's dark-purple background. */}
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl border-[2.5px] border-brand-ink bg-white text-brand-ink p-5 sm:p-7 shadow-[6px_6px_0_#5C15CC]">
          {children}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t-[2.5px] border-brand-ink">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="text-sm">
            {pricing ? (
              <>
                <div className="font-display font-black text-lg text-brand-ink">{fmt(pricing.total)}</div>
                <div className="text-brand-ink/60 text-xs">عربون 40%: <strong>{fmt(pricing.deposit_amount)}</strong></div>
              </>
            ) : (
              <span className="text-brand-ink/50 text-xs">اختار باقة لحساب السعر</span>
            )}
          </div>
          <div className="flex items-center gap-2">{footer}</div>
        </div>
      </div>
    </div>
  );
}
