import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { packagesApi } from '@/api/packages';
import SEO from '@/components/SEO';

// ============================================
// Service configurations
// ============================================
const SERVICES = {
  web: {
    badge: '01',
    tagLabel: 'تطوير المواقع الاحترافية',
    title: <>
      <span className="line">مواقع</span>
      <span className="line"><span className="word-3d">احترافية</span></span>
      <span className="line">بتحوّل الزوّار <span className="word-teal">لعملاء</span></span>
    </>,
    lede: 'من Landing Page لموقع شركة متكامل بـ Laravel + Vite. كود نظيف، سرعة عالية، تجربة مستخدم مدروسة، وتوافق كامل مع محركات البحث.',
    pills: ['Laravel 11', 'Vite', 'Next.js', 'AR / EN', 'SEO Ready'],
    pricingHeadline: <>اختار الباقة <span className="bsn-3d">المناسبة</span> لمشروعك</>,
    pricingDesc: 'أسعار شفافة بالجنيه المصري. كل باقة بتشمل التصميم + التطوير + النشر + شهر دعم مجاني.',
    plans: [
      { name: 'Landing Page', currency: 'EGP', num: '8,500', note: 'صفحة هبوط واحدة محسّنة للتحويل',
        feats: ['تصميم مخصص يعكس هويتك', 'صفحة واحدة طويلة (Single Page)', 'نموذج تواصل + WhatsApp', 'سرعة فائقة + SEO أساسي', 'دعم RTL/LTR'] },
      { name: 'Multi-page Pro', currency: 'EGP', num: '22,000', note: 'موقع شركة متكامل · Laravel + Vite', featured: true, ribbon: 'الأكتر طلباً',
        feats: ['5-8 صفحات حسب الحاجة', 'لوحة تحكم احترافية كاملة', 'إدارة محتوى ديناميكية', 'SEO تقني متقدم', 'تكامل WhatsApp + Email', 'دعم شهر مجاني'] },
      { name: 'Enterprise', currency: 'من EGP', num: '45,000', note: 'مشروع مخصص بالكامل',
        feats: ['+10 صفحات / موديولات', 'نظام مستخدمين + صلاحيات', 'تكامل مع APIs خارجية', 'تصميم متقدم وأنيميشن', 'دعم 3 شهور مجاني', 'SLA مخصص'] },
    ],
    addons: ['+ صفحة إضافية: 1,500 EGP', '+ مدونة كاملة: 3,500 EGP', '+ نسخة إنجليزية: 30% من السعر', '+ Hosting شهري: من 350 EGP'],
    deepFeats: [
      ['01', 'تصميم استراتيجي', 'كل صفحة بتخدم هدف واضح. مش بس شكل حلو — قرارات تصميم مبنية على فهم جمهورك.'],
      ['02', 'كود نظيف Laravel', 'هيكلة احترافية بتساعدنا نطوّر بسرعة، وتساعدك بعد كده تعدّل في الموقع بسهولة.'],
      ['03', 'RTL/LTR كامل', 'الموقع بيتنقل بين العربي والإنجليزي بدون كسر في التصميم.'],
      ['04', 'SEO تقني من اليوم الأول', 'Sitemap, schema markup, meta tags, OG images، وكل اللي محرّكات البحث محتاجاه.'],
      ['05', 'سرعة عالية', 'Lighthouse score +90، Lazy loading، WebP images، CDN. الموقع بيفتح في ثواني.'],
      ['06', 'لوحة تحكم احترافية', 'تتحكم في كل اللي على الموقع بنفسك — إضافة، تعديل، حذف، بدون ما تحتاج مبرمج.'],
    ],
  },
  ecommerce: {
    badge: '02',
    tagLabel: 'متاجر إلكترونية متكاملة',
    title: <>
      <span className="line">متجرك جاهز</span>
      <span className="line"><span className="word-3d">للبيع</span></span>
      <span className="line">من <span className="word-teal">اليوم الأول</span></span>
    </>,
    lede: 'متاجر إلكترونية متكاملة، بتشتغل على Laravel أو WooCommerce، مع دمج كامل لبوابات الدفع المحلية والشحن وأنظمة الفواتير.',
    pills: ['Paymob', 'WooCommerce', 'Bosta · Aramex', 'Multi-currency', 'AR / EN'],
    pricingHeadline: <>متجر <span className="word-teal">بيبيع</span> فعلاً</>,
    pricingDesc: 'باقات متكاملة تشمل التصميم، دمج الدفع والشحن، ولوحة تحكم احترافية.',
    plans: [
      { name: 'Starter', currency: 'EGP', num: '18,000', note: 'متجر بسيط · حتى 100 منتج',
        feats: ['تصميم متجر احترافي', 'بوابة دفع واحدة (Paymob)', 'شركة شحن واحدة', 'كوبونات أساسية', 'صفحات منتجات تفاعلية'] },
      { name: 'Growth', currency: 'EGP', num: '38,000', note: 'متجر متكامل · غير محدود', featured: true, ribbon: 'الأكتر طلباً',
        feats: ['منتجات غير محدودة', '2-3 بوابات دفع', 'برنامج ولاء + نقاط', 'تقارير تفصيلية', 'تكامل مع شركات شحن متعددة', 'دعم شهرين'] },
      { name: 'Enterprise', currency: 'من EGP', num: '70,000', note: 'منصة B2B / Marketplace',
        feats: ['متعدد البائعين', 'ERP integration', 'API كاملة للموبايل', 'أسعار B2B', 'تكاملات مخصصة', 'SLA مخصص'] },
    ],
    addons: ['+ تطبيق موبايل: من 35,000 EGP', '+ تكامل ERP: من 15,000 EGP', '+ منتج إضافي: 50 EGP', '+ تصميم بانر: 350 EGP'],
    deepFeats: [
      ['01', 'بوابات دفع محلية', 'Paymob، Tap، MyFatoorah، Stripe — كل البوابات المعتمدة في المنطقة.'],
      ['02', 'تكامل شركات الشحن', 'Aramex، Bosta، SMSA، J&T — حسابات وأسعار وتتبع تلقائي.'],
      ['03', 'لوحة منتجات قوية', 'إضافة منتجات بالجملة، categories، variations، attributes، inventory.'],
      ['04', 'تقارير وتحليلات', 'مبيعات يومية، أفضل المنتجات، سلوك العملاء، abandoned carts.'],
      ['05', 'كوبونات وعروض', 'كوبونات نسبة/مبلغ، حدود استخدام، عروض حسب فئة أو منتج.'],
      ['06', 'برنامج ولاء', 'نقاط، فئات عملاء، رد المبلغ، عروض حصرية للأعضاء.'],
    ],
  },
  branding: {
    badge: '03',
    tagLabel: 'الهوية البصرية المتكاملة',
    title: <>
      <span className="line">هوية</span>
      <span className="line"><span className="word-3d">بتعبّر</span></span>
      <span className="line">عن <span className="word-teal">شخصيتك</span></span>
    </>,
    lede: 'الهوية البصرية مش بس لوجو — دي شخصية شركتك بالكامل. بنشتغل معاك من البحث للستراتيجية للتطبيق لنطلعلك هوية متكاملة.',
    pills: ['Logo', 'Brand Book', 'Stationery', 'Social Templates', 'Mockups'],
    pricingHeadline: <>اختار <span className="bsn-3d">المستوى</span> اللي يناسبك</>,
    pricingDesc: 'من اللوجو لدليل الهوية الكامل + تطبيقات احترافية.',
    plans: [
      { name: 'Logo Only', currency: 'EGP', num: '3,500', note: 'لوجو احترافي · 3 اتجاهات',
        feats: ['3 مفاهيم أولية مختلفة', 'مراجعتين على الاتجاه المختار', 'كل الصيغ (PNG/SVG/PDF/AI)', 'دليل استخدام بسيط', 'نسخ ملونة وأبيض/أسود'] },
      { name: 'Full Identity', currency: 'EGP', num: '9,500', note: 'هوية متكاملة + Brand Book', featured: true, ribbon: 'الأكتر طلباً',
        feats: ['دليل هوية كامل PDF', 'نظام ألوان وخطوط', 'قرطاسية احترافية', '5 قوالب سوشيال', 'موكاب احترافي', 'تطبيقات حقيقية'] },
      { name: 'Brand System', currency: 'من EGP', num: '18,000', note: 'نظام هوية شامل · للشركات الكبيرة',
        feats: ['دليل +40 صفحة', 'نظام رموز كامل', '+15 قالب سوشيال', 'تطبيقات حقيقية', 'استشارة استراتيجية', 'تدريب فريقك الداخلي'] },
    ],
    addons: ['+ شعار فرعي: 1,200 EGP', '+ موكاب إضافي: 500 EGP', '+ قوالب سوشيال إضافية: 200 EGP', '+ دليل الصوت والنبرة: 2,500 EGP'],
    deepFeats: [
      ['01', 'بحث وتحليل', 'نفهم السوق، المنافسين، الجمهور، ونحدّد التوجّه قبل التصميم.'],
      ['02', 'استراتيجية الهوية', 'نوضّح القيم، الرسالة، الصوت، ونحدّد إزاي الهوية هتعكس كل ده.'],
      ['03', 'تصميم اللوجو', '3 اتجاهات مختلفة، تختار اللي يعجبك، ونطوّره معاك في جولات مراجعة.'],
      ['04', 'دليل الهوية', 'دوكيومنت احترافي يوضّح كل قواعد استخدام الهوية لفريقك.'],
      ['05', 'مطبوعات', 'كروت أعمال، أوراق رسمية، أظرف، فولدر — جاهزة للطباعة.'],
      ['06', 'موكاب احترافي', 'صور احترافية لتطبيقات الهوية لاستخدامها في العرض والتسويق.'],
    ],
  },
  marketing: {
    badge: '04',
    tagLabel: 'التسويق الرقمي المتقدم',
    title: <>
      <span className="line">تسويق</span>
      <span className="line"><span className="word-3d">بيجيب</span></span>
      <span className="line"><span className="word-teal">مبيعات</span> مش لايكات</span>
    </>,
    lede: 'إدارة حملاتك التسويقية باستراتيجية واضحة، ميزانية مدروسة، وتقارير شفافة. هدفنا الواحد: عملاء حقيقيين بيشتروا منك.',
    pills: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'SEO', 'Copy Writing'],
    pricingHeadline: <>إدارة <span className="word-teal">حملات</span> احترافية</>,
    pricingDesc: 'الأسعار للإدارة شهرياً · ميزانية الإعلانات منفصلة.',
    plans: [
      { name: 'Single Platform', currency: 'EGP', num: '4,500', period: '/شهر', note: 'منصة واحدة · مثالي للبداية',
        feats: ['حتى 4 حملات نشطة', 'Pixel + Conversions API', 'تقرير أسبوعي', 'اجتماع شهري', 'كتابة 4 نصوص إعلانية'] },
      { name: 'Multi Platform', currency: 'EGP', num: '8,500', period: '/شهر', note: '2-3 منصات + محتوى', featured: true, ribbon: 'الأكتر طلباً',
        feats: ['2-3 منصات إعلانية', '8 تصاميم/شهر', 'كتابة نصوص الإعلانات', 'A/B testing', 'إدارة كاملة للحسابات', 'تقارير أسبوعية مفصّلة'] },
      { name: 'Performance', currency: 'من EGP', num: '15,000', period: '/شهر', note: 'إدارة شاملة · Account Manager',
        feats: ['كل المنصات الإعلانية', 'SEO + Content Strategy', '+20 تصميم/شهر', 'Account Manager مخصص', 'تقارير يومية', 'استشارة استراتيجية أسبوعية'] },
    ],
    addons: ['+ منصة إضافية: 1,500 EGP/شهر', '+ تصميم إضافي: 200 EGP', '+ كتابة مقال SEO: 350 EGP', '+ فيديو موشن: من 1,500 EGP'],
    deepFeats: [
      ['01', 'استراتيجية واضحة', 'مش بنبدأ حملات عشوائي. كل ريال له هدف، وكل حملة لها KPI.'],
      ['02', 'إعلانات Meta', 'Facebook, Instagram, Messenger. Pixel متركّب، Conversions API، Retargeting.'],
      ['03', 'إعلانات Google', 'Search, Display, YouTube, Shopping. Keywords مدروسة، نتائج قابلة للقياس.'],
      ['04', 'SEO Local + International', 'تحسين موقعك ليظهر في نتائج Google لكلمات مهمة لبيزنسك.'],
      ['05', 'كتابة المحتوى', 'نصوص إعلانية، captions، مقالات SEO، email sequences بالعربي والإنجليزي.'],
      ['06', 'تقارير شفافة', 'كل ريال صرفته، كل عميل جالك، كل ROI — موضّح في تقاريرنا.'],
    ],
  },
};

// ============================================
// Component
// ============================================
export default function ServiceDetail({ serviceId }) {
  const svc = SERVICES[serviceId];

  // Fetch the real DB packages for this service so each card can link to its
  // detail page. Match the static plan to its DB row by name.
  const { data } = useQuery({
    queryKey: ['packages', 'public', serviceId],
    queryFn: () => packagesApi.publicList(serviceId),
    enabled: !!svc,
    staleTime: 60_000,
  });
  const idByName = (data?.data || []).reduce((acc, p) => {
    acc[p.name] = p.id;
    return acc;
  }, {});

  if (!svc) {
    return (
      <section className="hero hero-inner">
        <div className="container">
          <h1>الخدمة غير موجودة</h1>
          <Link to="/services" className="btn btn-primary">العودة للخدمات</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <SEO
        title={svc.heroTitle || svc.label || 'خدمة'}
        description={svc.heroLede || svc.description || `تفاصيل خدمة ${svc.label} من شريك الأعمال — BSN.`}
      />
      {/* HERO */}
      <section className="hero hero-inner">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-wrap">
            <div className="hero-content reveal is-visible">
              <div className="hero-tag">
                <span className="badge">{svc.badge}</span>
                {svc.tagLabel}
              </div>
              <h1>{svc.title}</h1>
              <p className="hero-lede">{svc.lede}</p>
              <div className="hero-pills">
                {svc.pills.map((p) => <span key={p} className="hero-pill">{p}</span>)}
              </div>
            </div>
            <div className="hero-visual reveal is-visible">
              <div className="mockup-browser">
                <div className="bar">
                  <span className="dot d1"></span>
                  <span className="dot d2"></span>
                  <span className="dot d3"></span>
                  <span className="url">bp-eg.com</span>
                </div>
                <div className="content">
                  <div className="hdr"></div>
                  <div className="row">
                    <div className="pill"></div>
                    <div className="pill p2"></div>
                  </div>
                  <div className="cards">
                    <div className="mini"></div>
                    <div className="mini"></div>
                    <div className="mini"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section section-light">
        <div className="container">
          <div className="section-head reveal is-visible" style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="eyebrow">— الباقات والأسعار</span>
            <h2>{svc.pricingHeadline}</h2>
            <p>{svc.pricingDesc}</p>
          </div>
          <div className="price-grid reveal is-visible">
            {svc.plans.map((p) => {
              const pkgId = idByName[p.name];
              return (
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
                    to={pkgId ? `/package/${pkgId}` : '/contact'}
                    className={'btn ' + (p.featured ? 'btn-primary' : 'btn-ghost') + ' price-cta'}
                  >
                    {pkgId ? 'التفاصيل' : 'اطلب الباقة'} <span className="arrow">←</span>
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="addons-strip reveal is-visible" style={{ marginTop: 40 }}>
            {svc.addons.map((a) => <span key={a} className="addon-pill">{a}</span>)}
          </div>
        </div>
      </section>

      {/* DEEP FEATURES */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow">— إيه اللي بتاخده فعلاً</span>
            <h2>تفاصيل اللي بنوصّله <span className="word-teal">في كل مشروع</span></h2>
          </div>
          <div className="deep-feats reveal is-visible">
            {svc.deepFeats.map(([n, title, desc]) => (
              <div key={n} className="deep-feat">
                <span className="ico">{n}</span>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container cta-banner-inner">
          <div className="reveal is-visible">
            <h2>جاهز <span className="ko">تبدأ؟</span></h2>
            <p>احكيلنا عن مشروعك وهنبعتلك عرض سعر مفصّل ومناسب في 24 ساعة.</p>
            <Link to="/contact" className="btn btn-dark">احكيلنا عن مشروعك <span className="arrow">←</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
