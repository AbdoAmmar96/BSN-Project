import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import { XCircle, Home, RotateCcw, HelpCircle } from 'lucide-react';
import { CONTACT } from '@/data/team';

export default function PaymentFailure() {
  const { paymentId } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentsApi.show(paymentId),
  });

  const payment = data?.payment;
  const reason = payment?.gateway_response?.failure_reason || payment?.gateway_response?.data?.message;

  const statusLabels = {
    failed: 'فشلت العملية',
    cancelled: 'تم إلغاء العملية',
    expired: 'انتهت صلاحية الرقم المرجعي',
  };
  const title = statusLabels[payment?.status] || 'لم تكتمل العملية';

  return (
    <div className="min-h-screen bg-brand-purple-deep flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        <div className="bg-white text-brand-ink rounded-3xl border-[2.5px] border-brand-ink shadow-brutal-orange p-8 text-center">
          {/* Fail icon */}
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 rounded-full bg-red-500/30 blur-xl" />
            <div className="relative w-20 h-20 rounded-full bg-red-500 text-white border-[3px] border-brand-ink shadow-brutal-sm flex items-center justify-center mx-auto">
              <XCircle size={48} strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="font-display font-black text-3xl mb-2">{title}</h1>
          <p className="opacity-70">حصلت مشكلة وما تم استلام الدفع</p>

          {/* Details */}
          {!isLoading && payment && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mt-6 text-right space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-70">المبلغ</span>
                <span className="font-display font-black">
                  {Number(payment.amount).toLocaleString()} {payment.currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-70">طريقة الدفع</span>
                <span className="font-bold">{payment.gateway}</span>
              </div>
              {reason && (
                <div className="pt-2 mt-2 border-t border-red-200">
                  <div className="text-xs opacity-70 mb-1">سبب الفشل:</div>
                  <div className="font-mono text-xs text-red-700">{reason}</div>
                </div>
              )}
            </div>
          )}

          <div className="bg-brand-orange/10 border-2 border-brand-orange/30 rounded-xl p-3 mt-5 text-sm">
            <strong>ملحوظة:</strong> ما تم خصم أي مبلغ من حسابك.
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-2 flex-wrap justify-center">
            {payment?.invoice_id ? (
              <Link to="/dashboard/invoices" className="btn-primary">
                <RotateCcw size={16} /> جرّب الدفع تاني
              </Link>
            ) : (
              <Link to="/dashboard" className="btn-primary">
                <Home size={16} /> للوحة التحكم
              </Link>
            )}
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              <HelpCircle size={16} /> تواصل مع الدعم
            </a>
          </div>

          <p className="text-xs opacity-60 mt-5 font-mono">
            لو الموضوع متكرر، اتواصل معانا على {CONTACT.salesPhone}
          </p>
        </div>
      </div>
    </div>
  );
}
