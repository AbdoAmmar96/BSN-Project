import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import { Copy, CheckCircle2, RefreshCw, Receipt, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function FawryReferenceCard({ payment, onStatusChange }) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const reference = payment.fawry_reference;
  const expiresAt = payment.fawry_expires_at;

  // Countdown
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('انتهت الصلاحية'); return; }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours} ساعة و ${mins} دقيقة`);
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const copyRef = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    toast.success('تم نسخ الرقم المرجعي');
    setTimeout(() => setCopied(false), 2000);
  };

  const recheckMut = useMutation({
    mutationFn: () => paymentsApi.recheck(payment.id),
    onSuccess: ({ payment: updated }) => {
      onStatusChange?.(updated);
      if (updated.status === 'completed') {
        toast.success('تم تأكيد الدفع! 🎉');
      } else {
        toast('لسه ما تم استلام الدفع — جرّب بعد دقايق', { icon: '⏳' });
      }
    },
    onError: () => toast.error('فشل التحقق'),
  });

  return (
    <div className="bg-white text-brand-ink rounded-3xl border-[2.5px] border-brand-ink shadow-brutal-orange p-8 max-w-lg mx-auto">
      {/* Icon header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-orange text-white border-2 border-brand-ink shadow-brutal-sm mb-3">
          <Receipt size={32} />
        </div>
        <h2 className="font-display font-black text-2xl">ادفع في أي منفذ فوري</h2>
        <p className="text-sm opacity-70 mt-1">استخدم الرقم المرجعي ده عند الكاشير</p>
      </div>

      {/* Reference number — the hero element */}
      <div className="bg-brand-purple-deep text-white rounded-2xl border-[2.5px] border-brand-orange p-6 text-center mb-5 shadow-brutal-orange">
        <div className="text-xs font-mono opacity-70 uppercase tracking-widest mb-2">رقم الفاتورة</div>
        <div className="font-display font-black text-4xl md:text-5xl tracking-wider" dir="ltr">
          {reference}
        </div>
        <button
          onClick={copyRef}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-brand-purple-deep font-bold text-sm border-2 border-white hover:bg-brand-orange hover:text-white transition"
        >
          {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
          {copied ? 'تم النسخ!' : 'انسخ الرقم'}
        </button>
      </div>

      {/* Amount + expiry */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-brand-teal/15 border-2 border-brand-teal/40 rounded-xl p-4 text-center">
          <div className="text-xs font-mono opacity-70 uppercase tracking-widest mb-1">المبلغ</div>
          <div className="font-display font-black text-xl">
            {Number(payment.amount).toLocaleString()} {payment.currency}
          </div>
        </div>
        <div className={clsx(
          'border-2 rounded-xl p-4 text-center',
          timeLeft === 'انتهت الصلاحية' ? 'bg-red-50 border-red-300' : 'bg-brand-purple/10 border-brand-purple/40'
        )}>
          <div className="text-xs font-mono opacity-70 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
            <Clock size={11} /> ينتهي خلال
          </div>
          <div className="font-display font-black text-sm">{timeLeft || '—'}</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-brand-orange/10 border-2 border-brand-orange/30 rounded-xl p-4 mb-5">
        <h4 className="font-display font-black text-sm mb-2">📋 خطوات الدفع:</h4>
        <ol className="space-y-1.5 text-sm">
          <li className="flex gap-2">
            <span className="font-bold text-brand-orange">1.</span>
            <span>روح لأقرب منفذ فوري (سوبر ماركت، صيدلية، إلخ)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-brand-orange">2.</span>
            <span>قول للموظف: "أنا عاوز أدفع فاتورة"</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-brand-orange">3.</span>
            <span>اعطيه الرقم المرجعي اللي فوق</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-brand-orange">4.</span>
            <span>ادفع المبلغ المطلوب</span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-brand-orange">5.</span>
            <span>هيوصلك تأكيد على البريد لما الدفع يتم</span>
          </li>
        </ol>
      </div>

      {/* I paid button */}
      <button
        onClick={() => recheckMut.mutate()}
        disabled={recheckMut.isPending}
        className="btn-primary w-full justify-center disabled:opacity-60"
      >
        <RefreshCw size={16} className={recheckMut.isPending ? 'animate-spin' : ''} />
        {recheckMut.isPending ? 'جاري التحقق...' : 'تحقق من حالة الدفع'}
      </button>

      <p className="text-xs opacity-60 text-center mt-3 font-mono">
        يمكن الدفع أيضاً من تطبيق MyFawry أو من خلال البنك الأهلي والأهلي القومي
      </p>
    </div>
  );
}
