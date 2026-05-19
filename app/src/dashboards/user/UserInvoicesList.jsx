import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { invoicesApi, INVOICE_STATUS } from '@/api/invoices';
import PageHeader from '@/components/dashboard/PageHeader';
import Badge from '@/components/dashboard/Badge';
import EmptyState from '@/components/dashboard/EmptyState';
import PayButton from '@/components/payment/PayButton';
import { TableSkeleton } from '@/components/Skeleton';
import { FileText, ArrowLeft, Download } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function UserInvoicesList() {
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', { filter }],
    queryFn: () => invoicesApi.list(filter === 'all' ? {} : { status: filter }),
  });

  const invoices = data?.data?.data || [];

  return (
    <div>
      <PageHeader
        eyebrow="MY INVOICES"
        title="فواتيري"
        description="كل الفواتير المتعلقة بمشاريعك"
      />

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['all', 'sent', 'partial', 'paid', 'overdue'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-sm font-bold border-2 transition',
              filter === s
                ? 'bg-brand-orange text-white border-brand-ink shadow-brutal-sm'
                : 'bg-white/5 border-white/20 hover:border-white/50'
            )}
          >
            {s === 'all' ? 'الكل' : INVOICE_STATUS[s]?.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="مفيش فواتير"
          description="هتظهر هنا لما الأدمن يصدر فواتير لمشاريعك"
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoices.map((inv) => {
            const s = INVOICE_STATUS[inv.status];
            const remaining = Number(inv.total) - Number(inv.paid_amount || 0);
            const canPay = ['sent', 'partial', 'overdue'].includes(inv.status) && remaining > 0;

            return (
              <div
                key={inv.id}
                className={clsx(
                  'bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-5 transition hover:-translate-y-1',
                  canPay ? 'shadow-brutal-orange' : 'shadow-brutal-sm'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-mono text-xs opacity-60 tracking-widest">فاتورة</div>
                    <div className="font-display font-black text-lg" dir="ltr">{inv.invoice_number}</div>
                  </div>
                  <Badge color={s?.color} size="xs">{s?.label}</Badge>
                </div>

                {inv.project && (
                  <div className="text-sm opacity-70 mb-3 truncate">
                    📂 {inv.project.title}
                  </div>
                )}

                <div className="bg-brand-purple/5 rounded-xl p-3 mb-3">
                  <div className="text-xs opacity-60 mb-1">إجمالي الفاتورة</div>
                  <div className="font-display font-black text-2xl">
                    {Number(inv.total).toLocaleString()} <span className="text-sm opacity-70 font-mono">{inv.currency}</span>
                  </div>
                  {Number(inv.paid_amount) > 0 && Number(inv.paid_amount) < Number(inv.total) && (
                    <>
                      <div className="text-xs opacity-60 mt-2 mb-1">المتبقي</div>
                      <div className="font-display font-black text-lg text-brand-orange">
                        {remaining.toLocaleString()} {inv.currency}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs opacity-60 mb-4">
                  {inv.due_at && (
                    <span>الاستحقاق: {new Date(inv.due_at).toLocaleDateString('ar-EG')}</span>
                  )}
                  <span>{inv.payments_count} دفعة</span>
                </div>

                {canPay ? (
                  <PayButton
                    amount={remaining}
                    currency={inv.currency}
                    invoiceId={inv.id}
                    projectId={inv.project_id}
                    label={`ادفع ${remaining.toLocaleString()}`}
                    className="btn-primary w-full justify-center text-sm"
                  />
                ) : (
                  <button disabled className="btn-brutal bg-gray-300 text-gray-500 w-full justify-center text-sm cursor-not-allowed">
                    {inv.status === 'paid' ? '✓ تم الدفع كاملاً' : '— غير قابل للدفع —'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    try { await invoicesApi.downloadPdf(inv.id); }
                    catch { toast.error('فشل تحميل الـ PDF'); }
                  }}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-white !text-brand-ink font-display font-black text-xs px-4 py-2 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
                >
                  <Download size={14} /> تحميل PDF
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
