import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { leadsApi } from '@/api/leads';
import { WIZARD_QUESTIONS, SERVICE_OPTIONS } from '@/lib/wizardQuestions';
import PageHeader from '@/components/dashboard/PageHeader';

/**
 * Custom-quote wizard (Path B). Collects service + smart answers + project
 * details, then creates a lead. The admin replies with a quote within 24h.
 */
export default function QuoteWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [answers, setAnswers] = useState({});
  const [details, setDetails] = useState({ title: '', description: '', budget_min_egp: '', budget_max_egp: '', deadline: '' });
  const [busy, setBusy] = useState(false);

  const questions = service ? WIZARD_QUESTIONS[service] ?? [] : [];
  const field = 'w-full rounded-xl border-2 border-brand-ink/25 focus:border-brand-purple px-4 py-2.5 text-brand-ink outline-none transition';

  const submit = async () => {
    if (!details.title.trim() || !details.description.trim()) {
      toast.error('اكتب عنوان ووصف المشروع');
      setStep(3);
      return;
    }
    setBusy(true);
    try {
      const { lead } = await leadsApi.create({
        service_type: service,
        title: details.title,
        description: details.description,
        smart_answers: answers,
        budget_min_egp: details.budget_min_egp || undefined,
        budget_max_egp: details.budget_max_egp || undefined,
        deadline: details.deadline || undefined,
      });
      toast.success('وصلنا طلبك! هنبعتلك عرض سعر خلال 24 ساعة.');
      navigate(`/dashboard/quotes?lead=${lead.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حصل خطأ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pb-8">
      <PageHeader title="طلب عرض سعر مخصّص" subtitle={`خطوة ${step} من 4`} />

      <div className="max-w-2xl mx-auto">
        {/* Step 1 — service */}
        {step === 1 && (
          <div>
            <h2 className="font-display font-black text-xl text-brand-ink mb-4">نوع الخدمة</h2>
            <div className="grid grid-cols-2 gap-3">
              {SERVICE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => { setService(s.value); setAnswers({}); }}
                  className={`text-right rounded-2xl border-[2.5px] p-4 transition ${
                    service === s.value ? 'border-brand-purple bg-brand-purple/5 shadow-[4px_4px_0_#5C15CC]' : 'border-brand-ink/20 bg-white hover:border-brand-ink'
                  }`}
                >
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="font-display font-black text-sm text-brand-ink">{s.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — smart questions */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-display font-black text-xl text-brand-ink">أسئلة سريعة</h2>
            {questions.map((q) => (
              <div key={q.id}>
                <label className="block text-sm font-bold text-brand-ink mb-2">{q.label}</label>
                {q.options.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                        className={`px-3 py-1.5 rounded-full border-2 text-sm font-bold transition ${
                          answers[q.id] === opt ? 'border-brand-teal bg-brand-teal/15 text-brand-ink' : 'border-brand-ink/20 text-brand-ink/70 hover:border-brand-ink'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea className={field} rows={3} value={answers[q.id] || ''} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 3 — details */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display font-black text-xl text-brand-ink">تفاصيل المشروع</h2>
            <div>
              <label className="block text-sm font-bold text-brand-ink mb-1.5">عنوان المشروع *</label>
              <input className={field} value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-ink mb-1.5">الوصف *</label>
              <textarea className={field} rows={4} value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-brand-ink mb-1.5">الميزانية من (EGP)</label>
                <input type="number" className={field} value={details.budget_min_egp} onChange={(e) => setDetails({ ...details, budget_min_egp: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-brand-ink mb-1.5">إلى (EGP)</label>
                <input type="number" className={field} value={details.budget_max_egp} onChange={(e) => setDetails({ ...details, budget_max_egp: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-ink mb-1.5">موعد متوقع</label>
              <input type="date" className={field} value={details.deadline} onChange={(e) => setDetails({ ...details, deadline: e.target.value })} />
            </div>
          </div>
        )}

        {/* Step 4 — review */}
        {step === 4 && (
          <div className="rounded-2xl border-[2.5px] border-brand-ink bg-white p-5 shadow-[5px_5px_0_#F15A24]">
            <h2 className="font-display font-black text-xl text-brand-ink mb-3">مراجعة وتقديم</h2>
            <p className="text-sm text-brand-ink/75 mb-2"><strong>الخدمة:</strong> {SERVICE_OPTIONS.find((s) => s.value === service)?.label}</p>
            <p className="text-sm text-brand-ink/75 mb-2"><strong>العنوان:</strong> {details.title || '—'}</p>
            <p className="text-sm text-brand-ink/75 mb-2"><strong>الوصف:</strong> {details.description || '—'}</p>
            {Object.entries(answers).length > 0 && (
              <div className="mt-3 text-xs text-brand-ink/60 space-y-1">
                {Object.entries(answers).map(([k, v]) => <div key={k}>• {v}</div>)}
              </div>
            )}
            <p className="text-xs text-brand-ink/55 mt-4">هنراجع طلبك ونبعتلك عرض سعر مفصّل خلال 24 ساعة.</p>
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center justify-between mt-7">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-xl border-2 border-brand-ink font-bold text-brand-ink bg-white">
              <ArrowRight size={16} className="inline" /> رجوع
            </button>
          ) : <span />}

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 && !service}
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 rounded-xl bg-brand-purple text-white font-bold disabled:opacity-40"
            >
              التالي <ArrowLeft size={16} className="inline" />
            </button>
          ) : (
            <button type="button" disabled={busy} onClick={submit} className="px-5 py-2 rounded-xl bg-brand-orange text-white font-black disabled:opacity-50">
              {busy ? 'بنبعت...' : 'قدّم الطلب'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
