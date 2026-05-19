import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import { Loader2 } from 'lucide-react';

/**
 * Generic return handler — gateway redirects to /payment/return?ref=BSN-PAY-XXX
 * We look up the payment, force a status recheck, then route to success/failure.
 */
export default function PaymentReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // Different gateways pass different param names — handle them all
  const reference =
    params.get('merchantOrderId') ||  // Kashier
    params.get('merchant_order_id') ||  // Paymob
    params.get('ref') ||
    params.get('reference');

  const recheck = useMutation({
    mutationFn: paymentsApi.show,
    onSuccess: ({ payment }) => {
      // Then trigger a recheck to pull latest gateway status
      paymentsApi.recheck(payment.id).finally(() => {
        if (['completed'].includes(payment.status)) {
          navigate(`/payment/success/${payment.id}`, { replace: true });
        } else if (['failed', 'cancelled', 'expired'].includes(payment.status)) {
          navigate(`/payment/failure/${payment.id}`, { replace: true });
        } else {
          // Still pending — go to checkout to wait
          navigate(`/payment/checkout/${payment.id}`, { replace: true });
        }
      });
    },
    onError: () => setError('فشل في التحقق من المعاملة'),
  });

  useEffect(() => {
    if (!reference) {
      setError('رقم المرجع مفقود');
      return;
    }
    // We don't have a "find by reference" endpoint, but we can show generic message
    // and let user navigate manually. In a real app, add /api/payments/by-reference/{ref}
    // For now: show loading and inspect URL params
    const id = params.get('payment_id') || params.get('id');
    if (id) recheck.mutate(id);
    else setError('معرّف الدفع مفقود في الرابط');
  }, [reference]);

  return (
    <div className="min-h-screen bg-brand-purple-deep flex items-center justify-center px-4">
      <div className="text-center text-white">
        {error ? (
          <>
            <div className="text-6xl mb-3">⚠️</div>
            <h2 className="font-display font-black text-2xl">{error}</h2>
            <button onClick={() => navigate('/dashboard')} className="btn-primary mt-5">للوحة التحكم</button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto animate-spin mb-4" size={48} />
            <h2 className="font-display font-black text-xl">جاري التحقق من حالة الدفع...</h2>
            <p className="opacity-70 mt-2 text-sm">لحظات من فضلك</p>
          </>
        )}
      </div>
    </div>
  );
}
