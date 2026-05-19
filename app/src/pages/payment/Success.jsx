import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/api/payments';
import { CheckCircle2, Receipt, Home, FileText } from 'lucide-react';

export default function PaymentSuccess() {
  const { paymentId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => paymentsApi.show(paymentId),
  });

  const payment = data?.payment;

  return (
    <div className="min-h-screen bg-brand-purple-deep flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Confetti background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-24 h-24 rounded-full bg-brand-teal/20 blur-2xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-brand-orange/20 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative bg-white text-brand-ink rounded-3xl border-[2.5px] border-brand-ink shadow-brutal-orange p-8 text-center">
          {/* Success icon */}
          <div className="relative inline-block mb-5">
            <div className="absolute inset-0 rounded-full bg-green-500/30 blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-green-500 text-white border-[3px] border-brand-ink shadow-brutal-sm flex items-center justify-center mx-auto">
              <CheckCircle2 size={48} strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="font-display font-black text-3xl mb-2">
            تم الدفع <span className="text-brand-orange">بنجاح!</span>
          </h1>
          <p className="opacity-70">شكراً ليك، استلمنا الدفع وهنبدأ شغل على مشروعك</p>

          {/* Details */}
          {!isLoading && payment && (
            <div className="bg-brand-purple/5 rounded-2xl border-2 border-brand-ink/10 p-5 mt-6 text-right space-y-3">
              <div className="flex items-center justify-between border-b border-brand-ink/10 pb-2">
                <span className="text-sm opacity-70">المبلغ المدفوع</span>
                <span className="font-display font-black text-xl text-green-600">
                  {Number(payment.amount).toLocaleString()} {payment.currency}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-70">رقم المعاملة</span>
                <span className="font-mono font-bold" dir="ltr">{payment.reference}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="opacity-70">طريقة الدفع</span>
                <span className="font-bold">{getGatewayLabel(payment.gateway)}</span>
              </div>
              {payment.paid_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-70">التاريخ</span>
                  <span className="font-mono">{new Date(payment.paid_at).toLocaleString('ar-EG')}</span>
                </div>
              )}
              {payment.card_last4 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-70">البطاقة</span>
                  <span className="font-mono">**** **** **** {payment.card_last4}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-2 flex-wrap justify-center">
            <Link to="/dashboard" className="btn-primary">
              <Home size={16} /> للوحة التحكم
            </Link>
            {payment?.invoice_id && (
              <Link to={`/dashboard/invoices`} className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform">
                <FileText size={16} /> الفواتير
              </Link>
            )}
          </div>

          <p className="text-xs opacity-60 mt-5 font-mono">
            استلمت ايصال الدفع على البريد الإلكتروني
          </p>
        </div>
      </div>
    </div>
  );
}

function getGatewayLabel(gateway) {
  return {
    paymob_card: 'بطاقة ائتمان',
    paymob_wallet: 'محفظة موبايل',
    paymob_installments: 'تقسيط',
    fawry: 'فوري',
    kashier: 'Kashier',
    manual: 'تحويل بنكي',
  }[gateway] || gateway;
}
