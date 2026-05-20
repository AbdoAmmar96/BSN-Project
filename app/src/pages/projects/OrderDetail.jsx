import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/api/orders';
import PageHeader from '@/components/dashboard/PageHeader';
import PayButton from '@/components/payment/PayButton';
import Skeleton from 'react-loading-skeleton';

const STATUS_LABELS = {
  draft: 'مسودة',
  pending_payment: 'في انتظار الدفع',
  paid: 'مدفوع — في انتظار المراجعة',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  refunded: 'مسترد',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const justCheckedOut = params.get('checkout') === '1';

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.show(id),
  });

  if (isLoading) return <Skeleton count={6} height={28} />;

  const order = data?.order;
  if (!order) return <p className="text-brand-ink/60">الطلب غير موجود.</p>;

  const fmt = (v) => `${Number(v || 0).toLocaleString()} ${order.currency}`;
  const awaitingPayment = order.status === 'pending_payment' || order.status === 'draft';

  return (
    <div>
      <PageHeader title={`الطلب ${order.order_number}`} subtitle={STATUS_LABELS[order.status] ?? order.status} />

      {justCheckedOut && awaitingPayment && (
        <div className="rounded-2xl border-2 border-brand-orange bg-brand-orange/10 p-4 mb-5">
          <p className="text-sm font-bold text-brand-ink mb-3">
            خطوة أخيرة: ادفع العربون (40%) عشان نبدأ مراجعة طلبك.
          </p>
          <PayButton
            amount={Number(order.deposit_amount)}
            currency={order.currency}
            orderId={order.id}
            label={`ادفع العربون ${fmt(order.deposit_amount)}`}
          />
        </div>
      )}

      <div className="rounded-2xl border-[2.5px] border-brand-ink bg-white p-5 shadow-[5px_5px_0_#5C15CC]">
        <h3 className="font-display font-black text-brand-ink mb-1">{order.project_name}</h3>
        {order.description && <p className="text-brand-ink/70 text-sm mb-4">{order.description}</p>}

        <div className="space-y-1.5 text-sm">
          <Row label="الباقة" value={order.package?.name} />
          {order.addons?.map((a) => (
            <Row key={a.id} label={`+ ${a.addon?.name_ar}`} value={fmt(a.price)} />
          ))}
          <hr className="my-2 border-brand-ink/10" />
          <Row label="المجموع الفرعي" value={fmt(order.subtotal)} />
          {Number(order.discount) > 0 && <Row label="خصم" value={`- ${fmt(order.discount)}`} />}
          <Row label="الإجمالي" value={fmt(order.total)} strong />
          <Row label="العربون (40%)" value={fmt(order.deposit_amount)} />
          <Row label="الباقي" value={fmt(order.remaining_amount)} />
        </div>
      </div>

      {order.project_id && (
        <Link to={`/dashboard/projects/${order.project_id}`} className="inline-block mt-4 text-brand-purple font-bold text-sm">
          افتح المشروع ←
        </Link>
      )}
    </div>
  );
}

function Row({ label, value, strong }) {
  return (
    <div className={`flex items-center justify-between ${strong ? 'font-display font-black text-brand-ink' : 'text-brand-ink/75'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
