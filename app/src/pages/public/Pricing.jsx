import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { packagesApi } from '@/api/packages';
import SEO from '@/components/SEO';

const TIERS = {
  web: {
    eyebrow: '— 01 / تطوير المواقع',
    title: <>مواقع <span className="bsn-3d" style={{ fontSize: '0.85em' }}>احترافية</span></>,
    desc: 'من Landing Page بسيطة لموقع شركة متكامل بـ Laravel + Vite.',
    sectionClass: 'section section-light',
    cta: '/service-web',
    plans: [
      { name: 'Landing Page', currency: 'EGP', num: '8,500', note: 'صفحة هبوط واحدة محسّنة للتحويل',
        feats: ['تصميم مخصص', 'Single page طويلة', 'نموذج تواصل + WhatsApp', 'SEO أساسي'] },
      { name: 'Multi-page Pro', currency: 'EGP', num: '22,000', note: 'موقع شركة متكامل · Laravel + Vite', featured: true, ribbon: 'الأكتر طلباً',
        feats: ['5-8 صفحات', 'لوحة تحكم احترافية', 'SEO تقني متقدم', 'دعم شهر مجاني'] },
      { name: 'Enterprise', currency: 'من EGP', num: '45,000', note: 'مشروع مخصص بالكامل',
        feats: ['+10 صفحات / موديولات', 'نظام مستخدمين', 'تكاملات APIs', 'دعم 3 شهور مجاني'] },
    ],
  },
  ecommerce: {
    eyebrow: '— 02 / المتاجر الإلكترونية',
    title: <>متاجر <span className="word-teal">بتبيع</span></>,
    desc: 'من متجر بسيط لمنصة B2B بكل تكاملات الدفع والشحن في المنطقة.',
    sectionClass: 'section',
    cta: '/service-ecommerce',
    plans: [
      { name: 'Starter', currency: 'EGP', num: '18,000', note: 'متجر بسيط · حتى 100 منتج',
        feats: ['تصميم متجر احترافي', 'بوابة دفع واحدة', 'شركة شحن واحدة', 'كوبونات أساسية'] },
      { name: 'Growth', currency: 'EGP', num: '38,000', note: 'متجر متكامل · غير محدود المنتجات', featured: true, ribbon: 'الأكتر طلباً',
        feats: ['منتجات غير محدودة', '2-3 بوابات دفع', 'برنامج ولاء + نقاط', 'تقارير تفصيلية'] },
      { name: 'Enterprise', currency: 'من EGP', num: '70,000', note: 'منصة B2B / Marketplace',
        feats: ['متعدد البائعين', 'ERP integration', 'API كاملة للموبايل', 'أسعار B2B'] },
    ],
  },
  branding: {
    eyebrow: '— 03 / الهوية البصرية',
    title: <>هويات <span className="bsn-3d" style={{ fontSize: '0.85em' }}>مميّزة</span></>,
    desc: 'من اللوجو لدليل الهوية الكامل + تطبيقات احترافية.',
    sectionClass: 'section section-light',
    cta: '/service-branding',
    plans: [
      { name: 'Logo Only', currency: 'EGP', num: '3,500', note: 'لوجو احترافي',
        feats: ['3 مفاهيم أولية', 'مراجعتين', 'كل الصيغ (PNG/SVG/PDF)', 'دليل استخدام بسيط'] },
      { name: 'Full Identity', currency: 'EGP', num: '9,500', note: 'هوية متكاملة + Brand Book', featured: true, ribbon: 'الأكتر طلباً',
        feats: ['دليل هوية كامل PDF', 'نظام ألوان وخطوط', 'قرطاسية احترافية', '5 قوالب سوشيال'] },
      { name: 'Brand System', currency: 'من EGP', num: '18,000', note: 'نظام هوية شامل',
        feats: ['دليل +40 صفحة', 'نظام رموز كامل', '+15 قالب سوشيال', 'تطبيقات حقيقية'] },
    ],
  },
  marketing: {
    eyebrow: '— 04 / التسويق الرقمي · شهرياً',
    title: <>إدارة <span className="word-teal">حملات</span> احترافية</>,
    desc: 'الأسعار للإدارة فقط · ميزانية الإعلانات منفصلة.',
    sectionClass: 'section',
    cta: '/service-marketing',
    plans: [
      { name: 'Single Platform', currency: 'EGP', num: '4,500', period: '/شهر', note: 'منصة واحدة',
        feats: ['حتى 4 حملات نشطة', 'Pixel + Conversions', 'تقرير أسبوعي', 'اجتماع شهري'] },
      { name: 'Multi Platform', currency: 'EGP', num: '8,500', period: '/شهر', note: '2-3 منصات + محتوى', featured: true, ribbon: 'الأكتر طلباً',
        feats: ['2-3 منصات إعلانية', '8 تصاميم/شهر', 'كتابة نصوص الإعلانات', 'A/B testing'] },
      { name: 'Performance', currency: 'من EGP', num: '15,000', period: '/شهر', note: 'إدارة شاملة',
        feats: ['كل المنصات', 'SEO + Content', '+20 تصميم/شهر', 'Account Manager مخصص'] },
    ],
  },
};

const FAQS = [
  ['ليه الأسعار بالجنيه المصري؟', 'عشان مقرّنا في القاهرة وأغلب عملائنا في مصر. للعملاء الخليجيين بنحوّل السعر بسعر اليوم وقت التعاقد.'],
  ['بتقبلوا الدفع بالريال السعودي أو الدولار؟', 'أيوة، بنقبل الدفع بأي عملة. بنحوّل قيمة العقد بسعر صرف اليوم ونوضّح ده في العقد.'],
  ['الدفع بيتم إزاي؟', 'عادة 50% مقدم لبدء العمل، و50% عند التسليم. للمشاريع الكبيرة بنقسّمها لـ 3-4 دفعات حسب المراحل.'],
  ['فيه خصومات للعملاء الجدد؟', 'أحياناً بنعمل عروض موسمية. بس بشكل عام، الأسعار اللي شايفها هي أفضل سعر — مفيش "خصومات وهمية".'],
  ['الأسعار قابلة للتفاوض؟', 'الباقات المكتوبة سعرها ثابت. بس لو عندك متطلبات مخصصة بنعمل عرض سعر مخصص حسب احتياجك.'],
  ['إيه اللي مش متضمن في الأسعار؟', 'الاستضافة (Hosting)، النطاق (Domain)، وميزانية الإعلانات للحملات. بنقولّك متوسط تكلفتها قبل ما نبدأ.'],
];

function PriceBlock({ tier, plans, id }) {
  return (
    <section id={id} className={tier.sectionClass} style={{ scrollMarginTop: 100 }}>
      <div className="container">
        <div className="section-head reveal is-visible">
          <span className="eyebrow">{tier.eyebrow}</span>
          <h2>{tier.title}</h2>
          <p>{tier.desc}</p>
        </div>
        <div className="price-grid reveal is-visible">
          {plans.map((p) => (
            <div key={p.name} className={'price-card' + (p.featured ? ' is-featured' : '')}>
              {p.ribbon && <span className="ribbon">{p.ribbon}</span>}
              <span className="price-tier-name">{p.name}</span>
              <div className="price-amount">
                <span className="currency">{p.currency}</span>
                <span className="num">{p.num}</span>
                {p.period && <span className="period">{p.period}</span>}
              </div>
              <p className="price-note">{p.note}</p>
              <ul className="price-feats">
                {p.feats.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <Link
                to={p.id ? `/package/${p.id}` : tier.cta}
                className={'btn ' + (p.featured ? 'btn-primary' : 'btn-ghost') + ' price-cta'}
              >
                التفاصيل <span className="arrow">←</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Convert DB package → plan shape used by PriceBlock */
function toPlan(pkg) {
  return {
    id: pkg.id, // real DB id → links to the package detail page
    name: pkg.name,
    currency: pkg.price_prefix ? `${pkg.price_prefix} ${pkg.currency}` : pkg.currency,
    num: Number(pkg.price).toLocaleString('en-US'),
    period: pkg.period || undefined,
    note: pkg.note || '',
    feats: pkg.features || [],
    featured: !!pkg.featured,
    ribbon: pkg.ribbon || undefined,
  };
}

export default function Pricing() {
  const { data } = useQuery({
    queryKey: ['packages', 'public'],
    queryFn: () => packagesApi.publicList(),
    staleTime: 60_000,
  });

  // Group fetched packages by service_type, sorted by sort_order
  const grouped = (data?.data || []).reduce((acc, pkg) => {
    (acc[pkg.service_type] ||= []).push(pkg);
    return acc;
  }, {});

  return (
    <>
      <SEO
        title="الأسعار"
        description="باقات شفافة بأسعار واضحة لكل خدماتنا — مواقع، متاجر، هوية بصرية، تسويق. الأسعار شاملة وبدون مفاجآت."
      />
      {/* HERO */}
      <section className="hero hero-inner">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-content reveal is-visible" style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center' }}>
            <div className="hero-tag" style={{ justifyContent: 'center' }}>
              <span className="badge">شفاف · واضح · بدون مفاجآت</span>
            </div>
            <h1>
              <span className="line">كل أسعارنا</span>
              <span className="line">في <span className="word-3d">مكان</span> واحد</span>
            </h1>
            <p className="hero-lede" style={{ marginInline: 'auto' }}>
              الأسعار بالجنيه المصري، شاملة كل المراحل من الفكرة للإطلاق. مفيش رسوم خفية، مفيش مفاجآت. لو في حاجة إضافية، بنقولها قبل ما نبدأ.
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link to="/contact" className="btn btn-primary">احجز استشارة مجانية <span className="arrow">←</span></Link>
              <a href="https://wa.me/201500156690" className="btn btn-ghost" target="_blank" rel="noreferrer">واتساب · رد فوري</a>
            </div>
          </div>
        </div>
      </section>

      {/* 4 PRICING BLOCKS — sourced from API, falls back to static TIERS while loading */}
      {['web', 'ecommerce', 'branding', 'marketing'].map((k) => {
        const fromApi = grouped[k]?.map(toPlan);
        const plans = (fromApi && fromApi.length > 0) ? fromApi : TIERS[k].plans;
        return <PriceBlock key={k} id={`pricing-${k}`} tier={TIERS[k]} plans={plans} />;
      })}

      {/* COMPARE STRIP */}
      <section className="section section-tight">
        <div className="container">
          <div className="compare-strip reveal is-visible">
            <div className="col-grid">
              <div className="compare-cell">
                <span className="ico">💰</span>
                <strong>شفافية الأسعار</strong>
                <span>كل سعر مكتوب وواضح. اللي بتدفعه هو اللي اتفقنا عليه — مفيش تكاليف خفية.</span>
              </div>
              <div className="compare-cell">
                <span className="ico">📅</span>
                <strong>جدول زمني واضح</strong>
                <span>كل مشروع بياخد جدول زمني محدد. بتتابع التقدم مع فريقك خطوة بخطوة.</span>
              </div>
              <div className="compare-cell">
                <span className="ico">🛟</span>
                <strong>دعم بعد التسليم</strong>
                <span>شهر دعم مجاني في كل المشاريع. ومتاحين بعد كده بأسعار منطقية.</span>
              </div>
              <div className="compare-cell">
                <span className="ico">📦</span>
                <strong>الكود ملكك</strong>
                <span>كل اللي بنطوّره بنسلّمه كاملاً مع وثائق. مفيش حبس على فينداور معيّن.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow">— أسئلة الأسعار</span>
            <h2>أسئلة <span className="word-teal">شائعة</span> عن الباقات</h2>
          </div>
          <div className="pricing-faq-grid reveal is-visible">
            {FAQS.map(([q, a], i) => (
              <details key={i} className="faq-item">
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner cta-compact">
        <div className="container cta-banner-inner">
          <div className="reveal is-visible">
            <h2>مش لاقي <span className="ko">باقتك</span>؟</h2>
            <p>كل مشروع فريد. لو محتاج باقة مخصصة، احكيلنا التفاصيل وهنعمللك عرض سعر في 24 ساعة.</p>
            <Link to="/contact" className="btn btn-dark">اطلب عرض مخصص <span className="arrow">←</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
