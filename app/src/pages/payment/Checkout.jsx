import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import FawryReferenceCard from '@/components/payment/FawryReferenceCard';
import PaymobIframe from '@/components/payment/PaymobIframe';
import { CheckCircle2, XCircle, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentCheckout() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentsApi.show(paymentId),
    // Auto-refetch every 10s for pending payments
    refetchInterval: (query) => {
      const p = query.state.data?.payment;
      return p && ['pending', 'processing'].includes(p.status) ? 10_000 : false;
    },
  });

  const payment = data?.payment;

  const handleStatusUpdate = (updated) => {
    qc.setQueryData(['payment', paymentId], { payment: updated });
    if (updated.status === 'completed') {
      navigate(`/payment/success/${paymentId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-white">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent" />
          <p className="mt-4 font-mono">جاري تحميل تفاصيل الدفع...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center text-white">
          <XCircle size={64} className="mx-auto text-red-500 mb-3" />
          <h2 className="font-display font-black text-2xl">معاملة الدفع غير موجودة</h2>
          <Link to="/dashboard" className="btn-primary mt-5 inline-flex">ارجع</Link>
        </div>
      </div>
    );
  }

  // ============================================
  // Auto-redirect success/failure
  // ============================================
  if (payment.status === 'completed') {
    navigate(`/payment/success/${paymentId}`, { replace: true });
    return null;
  }
  if (['failed', 'cancelled', 'expired'].includes(payment.status)) {
    navigate(`/payment/failure/${paymentId}`, { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen py-10 px-4 bg-brand-purple-deep">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <button onClick={() => navigate(-1)} className="text-white opacity-70 hover:opacity-100 text-sm font-mono flex items-center gap-1">
            <ArrowLeft size={14} /> رجوع
          </button>
          <div className="text-white text-xs font-mono opacity-60">
            مرجع: <span dir="ltr">{payment.reference}</span>
          </div>
        </div>

        {/* Status banner */}
        <StatusBanner status={payment.status} />

        {/* Gateway-specific UI */}
        {payment.gateway === 'fawry' && payment.fawry_reference && (
          <FawryReferenceCard payment={payment} onStatusChange={handleStatusUpdate} />
        )}

        {payment.gateway === 'paymob_card' && payment.gateway_response?.iframe_url && (
          <PaymobIframe iframeUrl={payment.gateway_response.iframe_url} payment={payment} />
        )}

        {/* Redirect gateways — should never land here normally, but show fallback */}
        {['paymob_wallet', 'paymob_installments', 'kashier'].includes(payment.gateway) && (
          <div className="bg-white text-brand-ink rounded-3xl border-[2.5px] border-brand-ink shadow-brutal-orange p-8 text-center max-w-lg mx-auto">
            <Clock className="mx-auto text-brand-orange mb-3" size={48} />
            <h2 className="font-display font-black text-2xl">في انتظار اكتمال الدفع</h2>
            <p className="opacity-70 mt-2">يرجى إكمال الدفع في الصفحة التي تم توجيهك إليها.</p>
            {payment.gateway_response?.redirect_url && (
              <a
                href={payment.gateway_response.redirect_url}
                className="btn-primary mt-5 inline-flex"
              >
                أعد توجيهي للدفع
              </a>
            )}
            <button onClick={() => refetch()} className="mt-3 text-sm text-brand-orange hover:underline">
              <RefreshCw size={12} className="inline ms-1" /> تحقق من الحالة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
function StatusBanner({ status }) {
  if (status === 'pending') {
    return (
      <div className="bg-yellow-200 text-yellow-900 border-2 border-yellow-600 rounded-xl p-3 mb-5 text-center text-sm font-bold flex items-center justify-center gap-2">
        <Clock size={14} /> في انتظار الدفع
      </div>
    );
  }
  if (status === 'processing') {
    return (
      <div className="bg-blue-200 text-blue-900 border-2 border-blue-600 rounded-xl p-3 mb-5 text-center text-sm font-bold flex items-center justify-center gap-2">
        <Clock size={14} className="animate-pulse" /> جاري المعالجة...
      </div>
    );
  }
  return null;
}
