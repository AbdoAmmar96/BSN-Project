import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, ArrowLeft, Check } from 'lucide-react';
import { onboardingApi } from '@/api/onboarding';

const LOOKING_FOR = [
  ['web', '🌐 موقع إلكتروني'],
  ['ecommerce', '🛒 متجر إلكتروني'],
  ['branding', '🎨 هوية بصرية'],
  ['marketing', '📈 تسويق رقمي'],
  ['browsing', '👀 بتفرّج بس دلوقتي'],
];

const TEAM_SIZE = [
  ['just_me', 'أنا بس'],
  ['2-5', '2–5 أفراد'],
  ['6-20', '6–20 فرد'],
  ['20+', 'أكتر من 20'],
];

/**
 * Optional 3-step intro shown once to users who haven't completed onboarding.
 * `onDone` is called after save or skip so the parent can stop rendering it.
 */
export default function OnboardingModal({ onDone }) {
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ looking_for: '', company_name: '', team_size: '' });

  const refresh = () => qc.invalidateQueries({ queryKey: ['onboarding'] });

  const save = useMutation({ mutationFn: () => onboardingApi.save(form), onSuccess: refresh });
  const skip = useMutation({ mutationFn: () => onboardingApi.skip(), onSuccess: refresh });

  // Dismiss the modal immediately (optimistic) and persist in the background, so
  // it disappears on click and never flickers back while the request is in flight.
  const handleSave = () => { onDone?.(); save.mutate(); };
  const handleSkip = () => { onDone?.(); skip.mutate(); };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink shadow-brutal">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-ink bg-brand-cream">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`w-2.5 h-2.5 rounded-full ${n <= step ? 'bg-brand-orange' : 'bg-brand-ink/20'}`} />
            ))}
            <span className="text-xs font-bold text-brand-ink/60 mr-2">خطوة {step} من 3</span>
          </div>
          <button onClick={handleSkip} className="p-1.5 rounded-lg hover:bg-brand-ink/10" aria-label="تخطّي" disabled={skip.isPending}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <>
              <h3 className="font-display font-black text-xl mb-1">أهلاً بيك! 👋 إنت بتدوّر على إيه؟</h3>
              <p className="text-sm text-brand-ink/60 mb-4">عشان نوصّلك أسرع للي محتاجه.</p>
              <div className="grid grid-cols-1 gap-2">
                {LOOKING_FOR.map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => set('looking_for', val)}
                    className={`text-right px-4 py-3 rounded-xl border-2 font-bold transition ${form.looking_for === val ? 'border-brand-purple bg-brand-purple/10 text-brand-purple' : 'border-brand-ink/15 hover:border-brand-ink/40'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 className="font-display font-black text-xl mb-1">اسم شركتك أو مشروعك؟</h3>
              <p className="text-sm text-brand-ink/60 mb-4">اختياري — بيساعدنا نخاطبك صح.</p>
              <input
                type="text"
                className="field"
                placeholder="مثال: شركة النور للتجارة"
                value={form.company_name}
                onChange={(e) => set('company_name', e.target.value)}
                autoFocus
              />
            </>
          )}

          {step === 3 && (
            <>
              <h3 className="font-display font-black text-xl mb-1">حجم فريقك؟</h3>
              <p className="text-sm text-brand-ink/60 mb-4">عشان نرشّحلك الباقة المناسبة.</p>
              <div className="grid grid-cols-2 gap-2">
                {TEAM_SIZE.map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => set('team_size', val)}
                    className={`px-4 py-3 rounded-xl border-2 font-bold transition ${form.team_size === val ? 'border-brand-purple bg-brand-purple/10 text-brand-purple' : 'border-brand-ink/15 hover:border-brand-ink/40'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t-2 border-brand-ink/10">
          <button onClick={handleSkip} disabled={skip.isPending} className="text-sm font-bold text-brand-ink/50 hover:text-brand-ink">
            تخطّي
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button onClick={() => setStep((s) => s - 1)} className="px-4 py-2.5 rounded-full border-2 border-brand-ink bg-white font-display font-black text-sm">
                رجوع
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 1 && !form.looking_for}
                className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform disabled:opacity-40"
              >
                التالي <ArrowLeft size={15} />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={save.isPending}
                className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform disabled:opacity-60"
              >
                <Check size={15} /> {save.isPending ? 'جاري الحفظ...' : 'يلا نبدأ'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
