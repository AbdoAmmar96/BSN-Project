import { useOrderWizard } from '@/store/orderWizard';

export default function Step5Review({ packages, addons, labels }) {
  const w = useOrderWizard();
  const pkg = packages.find((p) => p.id === w.packageId);
  const p = w.pricing;
  const fmt = (v) => `${Number(v || 0).toLocaleString()} ${w.currency}`;

  const row = (label, value, strong = false) => (
    <div className={`flex items-center justify-between py-1.5 ${strong ? 'font-display font-black text-brand-ink' : 'text-brand-ink/75 text-sm'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );

  return (
    <div>
      <h2 className="font-display font-black text-xl text-brand-ink mb-1">المراجعة والدفع</h2>
      <p className="text-brand-ink/60 text-sm mb-6">راجع طلبك قبل الدفع.</p>

      <div className="rounded-2xl border-2 border-brand-ink/15 bg-brand-cream/40 p-5">
        <div className="text-xs font-bold text-brand-ink/50 mb-2">
          {labels[w.serviceType]} {w.projectName ? `· ${w.projectName}` : ''}
        </div>

        {pkg && row(`الباقة: ${pkg.name}`, fmt(p?.package_price))}

        {w.addonIds.map((id) => {
          const a = addons.find((x) => x.id === id);
          const line = p?.addon_lines?.find((l) => l.id === id);
          return a ? row(`+ ${a.name_ar}`, fmt(line?.price)) : null;
        })}

        <hr className="my-2 border-brand-ink/10" />
        {row('المجموع الفرعي', fmt(p?.subtotal))}
        {p?.discount > 0 && row(`خصم${w.couponCode ? ` (${w.couponCode})` : ''}`, `- ${fmt(p.discount)}`)}
        <hr className="my-2 border-brand-ink/10" />
        {row('الإجمالي', fmt(p?.total), true)}

        <div className="mt-3 rounded-xl bg-brand-teal/15 p-3">
          {row('الدفعة الأولى (40%)', fmt(p?.deposit_amount), true)}
          {row('الباقي عند التسليم', fmt(p?.remaining_amount))}
        </div>
      </div>

      <p className="text-xs text-brand-ink/55 mt-4 leading-relaxed">
        بعد الدفع، طلبك هيوصل لفريقنا للمراجعة وتعيين developer خلال 24 ساعة، وهيتفتح لك room للمحادثة مع الفريق.
      </p>
    </div>
  );
}
