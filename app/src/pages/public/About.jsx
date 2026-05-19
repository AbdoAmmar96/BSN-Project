import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const VALUES = [
  ['01', 'خبرة تتجاوز 12 عامًا', 'خبرة تقنية ممتدة في مجالات الحلول الرقمية والتسويق، مكّنتنا من خدمة عشرات الشركات بإتقان.'],
  ['02', 'حلول متكاملة من مصدر واحد', 'كل اللي شركتك محتاجاه: مواقع، متاجر، هويات، تسويق، SEO، بريد مؤسسي — كله في مكان واحد.'],
  ['03', 'منهجية استراتيجية', 'كل مشروع بيبدأ بتخطيط وتحليل عميق. مش بنبدأ تنفيذ من غير ما نفهم البيزنس والجمهور.'],
  ['04', 'تنفيذ احترافي مؤسسي', 'نشتغل بمعايير مؤسسية عالية. كل تفصيلة بتمرّ على مراجعات ومعايير جودة قبل التسليم.'],
  ['05', 'نتائج قابلة للقياس', 'التركيز على نتائج قابلة للقياس والعائد على الاستثمار (ROI). الأرقام بتتكلم عن جودة الشغل.'],
  ['06', 'شراكة طويلة المدى', 'دعم فني مستمر بعد التسليم. علاقتنا بالعميل بتكبر مع وقت، مش بتنتهي بانتهاء المشروع.'],
];

const REGIONS = [
  ['🇪🇬', 'مصر', 'المقر الرئيسي · المنوفية', true],
  ['🇸🇦', 'السعودية', 'حلول مؤسسية', false],
  ['🇦🇪', 'الإمارات', 'حلول مؤسسية', false],
  ['🇶🇦', 'قطر', 'حلول مؤسسية', false],
  ['🇰🇼', 'الكويت', 'حلول مؤسسية', false],
];

export default function About() {
  return (
    <>
      <SEO
        title="من نحن"
        description="شركة شريك الأعمال لتقنية المعلومات (BSN) — تأسست على يد م. وليد شلبي وم. عمرو شلبي بخبرة +12 عاماً في الحلول التقنية."
      />
      {/* HERO */}
      <section className="hero hero-inner">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-wrap">
            <div className="hero-content reveal is-visible">
              <div className="hero-tag">
                <span className="badge">قصة ريادة</span>
                خبرة تتجاوز 12 عامًا · حلول تقنية متكاملة
              </div>
              <h1>
                <span className="line">قصة <span className="word-3d">ريادة</span></span>
                <span className="line">ورؤية <span className="word-teal">للمستقبل</span></span>
              </h1>
              <p className="hero-lede">
                شركة حلول تقنية متكاملة، نجمع بين الخبرة الهندسية والفكر الاستراتيجي لتمكين الشركات من قيادة التحول الرقمي.
              </p>
              <div className="hero-actions">
                <a href="https://wa.me/201500156690" className="btn btn-primary" target="_blank" rel="noreferrer">
                  اتكلم معانا <span className="arrow">←</span>
                </a>
                <Link to="/portfolio" className="btn btn-ghost">شوف أعمالنا</Link>
              </div>
            </div>
            <div className="hero-visual reveal is-visible">
              <div className="about-card-stack">
                <div className="about-pill p1"><span className="ap-year">+12</span><span className="ap-label">سنة خبرة</span></div>
                <div className="about-pill p2"><span className="ap-year">+40</span><span className="ap-label">مشروع</span></div>
                <div className="about-pill p3"><span className="ap-year">5</span><span className="ap-label">دول</span></div>
                <div className="about-pill p4"><span className="ap-year">2</span><span className="ap-label">مؤسسين</span></div>
                <div className="about-quote">
                  <span className="aq-mark">"</span>
                  نعمل على تمكين الكيانات التجارية من بناء تواجد رقمي قوي واحترافي.
                  <span className="aq-author">— م. وليد شلبي + م. عمرو شلبي</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="section section-light">
        <div className="container">
          <div className="split reveal is-visible">
            <div>
              <span className="num-mark">— كيان تقني متكامل</span>
              <h2>أكثر من شركة — <span className="bsn-3d" style={{ fontSize: '0.7em' }}>شريك</span> رقمي</h2>
              <p>نحن شركة متخصصة في تقديم الحلول التقنية الرقمية المتكاملة للشركات والمؤسسات. لا نكتفي بتنفيذ المشاريع، بل نعمل على تمكين الكيانات التجارية من بناء تواجد رقمي قوي واحترافي.</p>
              <p>تأسست الشركة على يد المهندس <strong>وليد شلبي</strong> والمهندس <strong>عمرو شلبي</strong>، بخبرة تتجاوز 12 عامًا في مجالات الحلول التقنية والتسويق الرقمي. يجمع المؤسسون بين الخبرة الهندسية المتقدمة والفهم العميق لاحتياجات الأعمال لبناء كيان احترافي.</p>
              <p>هدفنا تحويل التواجد الرقمي لمنظومة فعّالة تدعم النمو المستدام، وتعزز كفاءة الوصول إلى العملاء، وترفع من القيمة السوقية للعلامة التجارية.</p>
            </div>
            <div className="service-visual tone-purple" style={{ aspectRatio: '4/5' }}>
              <svg viewBox="0 0 320 400" width="80%" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(60, 60)">
                  <polygon points="0,16 16,0 96,0 80,16" fill="#65C8D0" stroke="#FFFFFF" strokeWidth="3"/>
                  <polygon points="80,16 96,0 96,64 80,80" fill="#3FA4AC" stroke="#FFFFFF" strokeWidth="3"/>
                  <rect x="0" y="16" width="80" height="64" fill="#F15A24" stroke="#FFFFFF" strokeWidth="3"/>
                </g>
                <g transform="translate(180, 60)">
                  <polygon points="0,16 16,0 96,0 80,16" fill="#F15A24" stroke="#FFFFFF" strokeWidth="3"/>
                  <polygon points="80,16 96,0 96,64 80,80" fill="#C73E0F" stroke="#FFFFFF" strokeWidth="3"/>
                  <rect x="0" y="16" width="80" height="64" fill="#65C8D0" stroke="#FFFFFF" strokeWidth="3"/>
                </g>
                <g transform="translate(60, 180)">
                  <polygon points="0,16 16,0 96,0 80,16" fill="#FFFFFF" stroke="#0F0830" strokeWidth="3"/>
                  <polygon points="80,16 96,0 96,64 80,80" fill="#E6E6F0" stroke="#0F0830" strokeWidth="3"/>
                  <rect x="0" y="16" width="80" height="64" fill="#0F0830" stroke="#FFFFFF" strokeWidth="3"/>
                </g>
                <g transform="translate(180, 180)">
                  <polygon points="0,16 16,0 96,0 80,16" fill="#F15A24" stroke="#FFFFFF" strokeWidth="3"/>
                  <polygon points="80,16 96,0 96,64 80,80" fill="#C73E0F" stroke="#FFFFFF" strokeWidth="3"/>
                  <rect x="0" y="16" width="80" height="64" fill="#FFFFFF" stroke="#0F0830" strokeWidth="3"/>
                </g>
                <g transform="translate(120, 290)">
                  <polygon points="0,16 16,0 96,0 80,16" fill="#65C8D0" stroke="#FFFFFF" strokeWidth="3"/>
                  <polygon points="80,16 96,0 96,64 80,80" fill="#3FA4AC" stroke="#FFFFFF" strokeWidth="3"/>
                  <rect x="0" y="16" width="80" height="64" fill="#F15A24" stroke="#FFFFFF" strokeWidth="3"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION / VISION */}
      <section className="section section-teal">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow" style={{ color: 'var(--p)' }}>رؤيتنا ورسالتنا</span>
            <h2 className="h-section" style={{ marginTop: 20, color: 'var(--p-deep)' }}>اللي <span className="text-3d white-base">بيحرّكنا</span></h2>
          </div>
          <div className="mission-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28 }}>
            <div className="value-card reveal is-visible" style={{ background: 'var(--p)', color: 'var(--w)', borderColor: 'var(--ink)', boxShadow: '10px 10px 0 var(--o)' }}>
              <span className="value-num" style={{ color: 'var(--o)', WebkitTextStroke: '1.5px var(--w)' }}>🎯</span>
              <h3 style={{ fontSize: 24 }}>رسالتنا</h3>
              <p style={{ opacity: 0.92, fontSize: 16 }}>تقديم حلول تقنية تمكّن الشركات من تعزيز تواجدها وتحقيق أهدافها بكفاءة.</p>
            </div>
            <div className="value-card reveal is-visible" style={{ background: 'var(--o)', color: 'var(--w)', borderColor: 'var(--ink)', boxShadow: '10px 10px 0 var(--p)' }}>
              <span className="value-num" style={{ color: 'var(--p)', WebkitTextStroke: '1.5px var(--w)' }}>🚀</span>
              <h3 style={{ fontSize: 24 }}>رؤيتنا</h3>
              <p style={{ opacity: 0.92, fontSize: 16 }}>أن نكون الشريك التقني الأول للشركات في المنطقة، ونقود التحول الرقمي المؤسسي.</p>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section section-paper">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow" style={{ color: 'var(--o)' }}>لماذا شريك الأعمال</span>
            <h2 className="h-section" style={{ marginTop: 20 }}>المبادئ اللي <span className="text-3d">بنشتغل بيها</span></h2>
            <p>ست أسباب تخلّي الشركات تختار شريك الأعمال شريكها التقني الأول.</p>
          </div>
          <div className="values-grid">
            {VALUES.map(([num, title, desc]) => (
              <div key={num} className="value-card reveal is-visible">
                <span className="value-num">{num}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGIONS */}
      <section className="section section-tight">
        <div className="container">
          <div className="section-head reveal is-visible" style={{ textAlign: 'center', marginBottom: 30 }}>
            <span className="eyebrow">— نطاق خدماتنا الإقليمي</span>
            <h2>بنخدم الشركات في <span className="word-teal">5 دول</span></h2>
          </div>
          <div className="region-strip reveal is-visible">
            {REGIONS.map(([flag, name, meta, isHq]) => (
              <div key={name} className={'region-pill' + (isHq ? ' is-hq' : '')}>
                <span className="rp-flag">{flag}</span>
                <strong>{name}</strong>
                <span className="rp-meta">{meta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow" style={{ color: 'var(--o)' }}>القيادة</span>
            <h2 className="h-section" style={{ marginTop: 20 }}>المؤسسون <span className="text-3d teal-base">والفريق</span></h2>
            <p>كيان احترافي يقوده مهندسون بخبرة +12 عاماً، مدعوم بفريق من المطوّرين والمصمّمين والمسوّقين.</p>
          </div>
          <div className="team-grid">
            <div className="team-card reveal is-visible">
              <img
                className="team-avatar-img"
                src="/team/walid.jpg"
                alt="م. وليد شلبي"
                loading="lazy"
              />
              <h3>م. وليد شلبي</h3>
              <div className="team-role">المؤسس · المدير التقني</div>
              <p>مهندس بخبرة هندسية متقدمة، بيقود الفريق التقني ويشرف على معايير الجودة في كل مشروع.</p>
            </div>
            <div className="team-card reveal is-visible">
              <img
                className="team-avatar-img"
                src="/team/amr.jpg"
                alt="م. عمرو شلبي"
                loading="lazy"
              />
              <h3>م. عمرو شلبي</h3>
              <div className="team-role">المؤسس · مدير العمليات</div>
              <p>بيدير العمليات والعلاقات مع العملاء، وبيحرص إن كل مشروع يتسلّم في الميعاد وبالجودة المتفق عليها.</p>
            </div>
            <div className="team-card reveal is-visible">
              <img
                className="team-avatar-img"
                src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=240&h=240&fit=crop&auto=format&q=80"
                alt="فريق التطوير"
                loading="lazy"
              />
              <h3>فريق التطوير</h3>
              <div className="team-role">BACKEND · FRONTEND</div>
              <p>متخصصين في Laravel، React، Next.js، WordPress، وأنظمة إدارة المحتوى المخصصة.</p>
            </div>
            <div className="team-card reveal is-visible">
              <img
                className="team-avatar-img"
                src="https://images.unsplash.com/photo-1561070791-2526d30994b8?w=240&h=240&fit=crop&auto=format&q=80"
                alt="فريق التصميم والتسويق"
                loading="lazy"
              />
              <h3>فريق التصميم والتسويق</h3>
              <div className="team-role">UI / UX · MARKETING</div>
              <p>مصمّمين ومسوّقين بحسّ عالي للجمال والأداء، بيشتغلوا بمنهجية مبنية على البيانات.</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section section-orange">
        <div className="container">
          <div className="section-head reveal is-visible">
            <h2 className="h-section">أرقام <span className="text-3d teal-base">بتتكلم عنا</span></h2>
          </div>
          <div className="stats-block">
            <div className="stat-cell" style={{ background: 'var(--w)', color: 'var(--p)', borderColor: 'var(--ink)', boxShadow: '8px 8px 0 var(--p)' }}>
              <span className="stat-num" style={{ color: 'var(--o)', WebkitTextStroke: '1px var(--ink)', textShadow: '3px 4px 0 var(--p)' }}>+12</span>
              <span className="stat-label" style={{ color: 'var(--ink)' }}>سنة من الخبرة</span>
            </div>
            <div className="stat-cell" style={{ background: 'var(--w)', color: 'var(--p)', borderColor: 'var(--ink)', boxShadow: '8px 8px 0 var(--t)' }}>
              <span className="stat-num" style={{ color: 'var(--p)', WebkitTextStroke: '1px var(--ink)', textShadow: '3px 4px 0 var(--t)' }}>+40</span>
              <span className="stat-label" style={{ color: 'var(--ink)' }}>مشروع منجز</span>
            </div>
            <div className="stat-cell" style={{ background: 'var(--ink)', color: 'var(--w)', borderColor: 'var(--ink)', boxShadow: '8px 8px 0 var(--w)' }}>
              <span className="stat-num" style={{ color: 'var(--t)', textShadow: '3px 4px 0 var(--p)' }}>5</span>
              <span className="stat-label">دول · مصر والخليج</span>
            </div>
            <div className="stat-cell" style={{ background: 'var(--ink)', color: 'var(--w)', borderColor: 'var(--ink)', boxShadow: '8px 8px 0 var(--w)' }}>
              <span className="stat-num" style={{ color: 'var(--o)', textShadow: '3px 4px 0 var(--p)' }}>97%</span>
              <span className="stat-label">رضا العملاء</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner" style={{ background: 'var(--p-deep)' }}>
        <div className="container cta-banner-inner">
          <div className="reveal is-visible">
            <h2>عاوز تتعرّف <span className="ko">علينا</span> أكتر؟</h2>
            <p>تعالى نتقابل، نشرب قهوة، ونحكيلك إزاي ممكن نساعدك في رحلتك.</p>
            <Link to="/contact" className="btn btn-primary">احجز جلسة تعريفية <span className="arrow">←</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
