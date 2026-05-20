import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import GatewaySelector from './GatewaySelector';
import { CreditCard, ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Reusable Pay button — opens a modal with gateway selector,
 * initiates payment, then routes to the right next step.
 *
 * Props:
 *   amount:       number
 *   currency:     string  (default 'EGP')
 *   invoiceId:    optional — links payment to an invoice
 *   projectId:    optional — links payment to a project
 *   label:        string  (default "ادفع دلوقتي")
 *   className:    optional css for the button
 */
export default function PayButton({ amount, currency = 'EGP', invoiceId, projectId, orderId, label = 'ادفع دلوقتي', className }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [gateway, setGateway] = useState('');
  const [phone, setPhone] = useState('');
  const [months, setMonths] = useState(6);

  const initiate = useMutation({
    mutationFn: () => paymentsApi.initiate({
      gateway,
      amount,
      currency,
      invoice_id: invoiceId,
      project_id: projectId,
      order_id: orderId,
      phone: gateway === 'paymob_wallet' ? phone : undefined,
      months: gateway === 'paymob_installments' ? months : undefined,
    }),
    onSuccess: ({ payment, checkout }) => {
      setOpen(false);

      if (checkout.type === 'redirect') {
        // Paymob wallet / installments / Kashier — open gateway URL
        toast.success('بنحوّلك للدفع...');
        window.location.href = checkout.data.redirect_url;
      } else if (checkout.type === 'iframe' || checkout.type === 'reference') {
        // Paymob card → iframe page · Fawry → reference page
        navigate(`/payment/checkout/${payment.id}`);
      }
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.response?.data?.error || 'فشل بدء الدفع';
      toast.error(msg);
    },
  });

  const canSubmit = gateway && (gateway !== 'paymob_wallet' || phone.length >= 10);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const modal = open && (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      <div className="min-h-full flex items-start justify-center p-4 py-10">
        <div
          className="w-full bg-white text-brand-ink rounded-3xl border-[2.5px] border-brand-ink overflow-hidden flex flex-col"
          style={{
            maxWidth: '720px',
            boxShadow: '8px 8px 0 #F15A24',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b-2 border-brand-ink/10 bg-brand-cream">
            <h3 className="font-display font-black text-xl">طرق الدفع المتاحة</h3>
            <button
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full bg-brand-ink/5 hover:bg-brand-ink/15 flex items-center justify-center"
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            <GatewaySelector
              amount={amount}
              selected={gateway}
              onSelect={setGateway}
              phone={phone}
              onPhoneChange={setPhone}
              months={months}
              onMonthsChange={setMonths}
            />
          </div>

          <div className="border-t-2 border-brand-ink/10 p-4 bg-brand-purple/5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="text-sm">
                <span className="opacity-60">المبلغ المطلوب: </span>
                <span className="font-display font-black text-xl text-brand-orange">
                  {Number(amount).toLocaleString()} {currency}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => initiate.mutate()}
                  disabled={!canSubmit || initiate.isPending}
                  className="btn-primary text-sm disabled:opacity-60"
                >
                  {initiate.isPending ? 'جاري...' : 'ابدأ الدفع'} <ArrowLeft size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} className={className || 'btn-primary'}>
        <CreditCard size={16} /> {label}
      </button>
      {modal && createPortal(modal, document.body)}
    </>
  );
}
