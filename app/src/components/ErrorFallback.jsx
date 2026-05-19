import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white text-brand-ink rounded-2xl border-2 border-brand-ink p-8 text-center" style={{ boxShadow: '8px 8px 0 #F15A24' }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-orange/15 border-2 border-brand-orange flex items-center justify-center">
          <AlertTriangle size={28} className="text-brand-orange" />
        </div>
        <h2 className="font-display font-black text-2xl mb-2">في حاجة بايظة</h2>
        <p className="text-sm opacity-70 mb-4">
          {error?.message?.startsWith('Request failed')
            ? 'مشكلة في الاتصال بالسيرفر. حاول تاني خلال دقيقة.'
            : 'حصل خطأ غير متوقع. جرّب تحدّث الصفحة.'}
        </p>
        {error?.message && (
          <details className="text-right text-xs font-mono opacity-60 bg-brand-ink/5 rounded-lg p-3 mb-4">
            <summary className="cursor-pointer mb-2">تفاصيل تقنية</summary>
            <pre className="whitespace-pre-wrap break-all">{error.message}</pre>
          </details>
        )}
        <div className="flex gap-2 justify-center flex-wrap">
          <button
            onClick={resetErrorBoundary}
            className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
          >
            <RefreshCw size={14} /> حاول تاني
          </button>
          <Link
            to="/"
            onClick={resetErrorBoundary}
            className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
          >
            <Home size={14} /> الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
