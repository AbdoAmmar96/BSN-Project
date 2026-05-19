import { CreditCard, Lock, ShieldCheck } from 'lucide-react';

/**
 * Wraps the Paymob payment iframe with a branded header + footer.
 * The actual card form is rendered by Paymob inside the iframe.
 */
export default function PaymobIframe({ iframeUrl, payment }) {
  return (
    <div className="bg-white text-brand-ink rounded-3xl border-[2.5px] border-brand-ink shadow-brutal-orange overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-brand-purple-deep text-white p-5 border-b-2 border-brand-orange">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-orange border-2 border-white flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <div>
              <div className="font-display font-black">دفع آمن ببطاقة ائتمان</div>
              <div className="text-xs opacity-70 font-mono">Powered by Paymob · Secured by PCI DSS</div>
            </div>
          </div>
          <div className="text-left">
            <div className="text-xs opacity-70">المبلغ</div>
            <div className="font-display font-black text-xl">
              {Number(payment.amount).toLocaleString()} {payment.currency}
            </div>
          </div>
        </div>
      </div>

      {/* Iframe */}
      <div className="relative bg-gray-50">
        <iframe
          src={iframeUrl}
          className="w-full block"
          style={{ height: '650px', border: 'none' }}
          title="Paymob Payment"
          allow="payment"
        />
      </div>

      {/* Security badges */}
      <div className="p-4 border-t-2 border-brand-ink/10 bg-brand-purple/5">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 opacity-80">
            <Lock size={14} /> اتصال مشفّر SSL
          </div>
          <div className="flex items-center gap-1.5 opacity-80">
            <ShieldCheck size={14} /> PCI-DSS Compliant
          </div>
          <div className="flex items-center gap-1.5 opacity-80">
            🔒 3D Secure
          </div>
        </div>
      </div>
    </div>
  );
}
