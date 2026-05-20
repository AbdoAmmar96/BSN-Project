import { useNavigate } from 'react-router-dom';
import { Package, PenLine, Zap, Clock } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';

/**
 * Fork between Path A (buy a ready package — instant) and Path B (request a
 * custom quote — admin replies within 24h). Mirrors Flow 0 in the spec.
 */
export default function NewProjectChoice() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="مشروع جديد" subtitle="اختار الطريقة اللي تناسبك" />

      <div className="grid gap-5 md:grid-cols-2 mt-2">
        {/* Path A */}
        <button
          type="button"
          onClick={() => navigate('/dashboard/projects/new/package')}
          className="text-right rounded-3xl border-[2.5px] border-brand-ink bg-white p-7 shadow-[6px_6px_0_#5C15CC] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_#5C15CC] transition focus:outline-none focus:ring-2 focus:ring-brand-purple"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-purple text-white flex items-center justify-center mb-4">
            <Package size={26} aria-hidden="true" />
          </div>
          <h3 className="font-display font-black text-xl text-brand-ink mb-2">📦 باقة جاهزة</h3>
          <p className="text-brand-ink/70 text-sm leading-relaxed mb-4">
            اختار باقة بسعر معروف، ضيف الإضافات اللي محتاجها، وادفع وابدأ على طول.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-teal/20 text-brand-ink"><Zap size={13} /> فوري</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-teal/20 text-brand-ink">سعر معروف</span>
          </div>
        </button>

        {/* Path B */}
        <button
          type="button"
          onClick={() => navigate('/dashboard/projects/new/custom')}
          className="text-right rounded-3xl border-[2.5px] border-brand-ink bg-white p-7 shadow-[6px_6px_0_#F15A24] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_#F15A24] transition focus:outline-none focus:ring-2 focus:ring-brand-orange"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-orange text-white flex items-center justify-center mb-4">
            <PenLine size={26} aria-hidden="true" />
          </div>
          <h3 className="font-display font-black text-xl text-brand-ink mb-2">✏️ مشروع مخصّص</h3>
          <p className="text-brand-ink/70 text-sm leading-relaxed mb-4">
            مشروعك مختلف؟ جاوب على كام سؤال وهنبعتلك عرض سعر مفصّل خلال 24 ساعة.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-orange/15 text-brand-ink"><Clock size={13} /> رد خلال 24 ساعة</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-orange/15 text-brand-ink">عرض سعر مخصّص</span>
          </div>
        </button>
      </div>
    </div>
  );
}
