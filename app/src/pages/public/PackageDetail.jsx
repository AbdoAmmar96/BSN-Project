import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Check, ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { packagesApi, SERVICE_TYPE_LABELS } from '@/api/packages';
import { useAuth } from '@/contexts/AuthContext';
import SEO from '@/components/SEO';

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['package', id],
    queryFn: () => packagesApi.show(id),
  });

  const pkg = data?.package;

  // The wizard route, with the package preselected.
  const wizardTarget = `/dashboard/projects/new/package?package=${id}`;

  const startOrder = () => {
    if (user) {
      navigate(wizardTarget);
    } else {
      // Send the full intended path (incl. query) so login returns here.
      navigate('/login', { state: { from: { pathname: '/dashboard/projects/new/package', search: `?package=${id}` } } });
    }
  };

  if (isLoading) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <p className="text-brand-ink/50">جاري التحميل…</p>
        </div>
      </section>
    );
  }

  if (isError || !pkg) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 760, textAlign: 'center' }}>
          <h2 className="font-display font-black text-2xl mb-3">الباقة غير موجودة</h2>
          <Link to="/pricing" className="btn btn-primary">رجوع للأسعار <span className="arrow">←</span></Link>
        </div>
      </section>
    );
  }

  const serviceLabel = SERVICE_TYPE_LABELS[pkg.service_type] || pkg.service_type;
  const priceText = `${pkg.price_prefix ? pkg.price_prefix + ' ' : ''}${Number(pkg.price).toLocaleString('en-US')}`;

  return (
    <>
      <SEO title={`${pkg.name} — ${serviceLabel}`} description={pkg.note || `باقة ${pkg.name} ضمن خدمات ${serviceLabel}.`} />

      {/* HERO */}
      <section className="hero hero-inner" style={{ paddingBottom: 28 }}>
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-content reveal is-visible" style={{ maxWidth: 820 }}>
            <div className="hero-tag">
              <span className="badge">{serviceLabel}</span>
              {pkg.ribbon && <span>{pkg.ribbon}</span>}
            </div>
            <h1><span className="line">{pkg.name}</span></h1>
            {pkg.note && <p className="hero-lede">{pkg.note}</p>}
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="section" style={{ paddingTop: 32 }}>
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="rounded-3xl border-[2.5px] border-brand-ink bg-white p-7 shadow-[6px_6px_0_#5C15CC]">
            {/* Price + delivery */}
            <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b-2 border-brand-ink/10">
              <div>
                <div className="text-xs font-bold text-brand-ink/50 mb-1">السعر يبدأ من</div>
                <div className="font-display font-black text-4xl text-brand-purple">
                  {priceText} <span className="text-lg text-brand-ink/60">{pkg.currency}</span>
                  {pkg.period && <span className="text-base text-brand-ink/50">{pkg.period}</span>}
                </div>
              </div>
              {pkg.delivery_days && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-teal/15 text-brand-ink text-sm font-bold">
                  <Clock size={15} /> تسليم خلال {pkg.delivery_days} يوم
                </span>
              )}
            </div>

            {/* Features */}
            {Array.isArray(pkg.features) && pkg.features.length > 0 && (
              <div className="py-5">
                <h3 className="font-display font-black text-lg text-brand-ink mb-3">اللي بتشمله الباقة</h3>
                <ul className="grid sm:grid-cols-2 gap-2.5">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brand-ink/80">
                      <Check size={17} className="text-brand-teal mt-0.5 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deposit note */}
            <div className="rounded-2xl bg-brand-cream border-2 border-brand-ink/10 p-4 text-sm text-brand-ink/75">
              💡 بتبدأ المشروع بدفع <strong>عربون 40%</strong> فقط، والباقي حسب جدول المشروع. تقدر كمان تضيف إضافات في الخطوة الجاية.
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={startOrder}
                className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black px-6 py-3 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition"
              >
                <Sparkles size={18} /> ابدأ مشروعك بالباقة دي
              </button>
              <Link to="/pricing" className="inline-flex items-center gap-1.5 font-bold text-brand-ink/60 hover:text-brand-ink">
                <ArrowLeft size={16} /> شوف باقي الباقات
              </Link>
            </div>
            {!user && (
              <p className="text-xs text-brand-ink/50 mt-3">هتحتاج تسجّل الدخول الأول — وهنرجّعك هنا على طول.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
