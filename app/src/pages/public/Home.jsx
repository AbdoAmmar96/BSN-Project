import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function Home() {
  return (
    <>
      <SEO
        title="الرئيسية"
        description="شريك الأعمال (BSN) — تصميم وتطوير المواقع، المتاجر الإلكترونية، الهوية البصرية، والتسويق الرقمي. +40 مشروع · 5 دول · 12 سنة خبرة."
      />
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-wrap">
            <div className="hero-content reveal is-visible">
              <div className="hero-tag">
                <span className="badge">+12 عاماً</span>
                شريكك الاستراتيجي · للتحول الرقمي المؤسسي
              </div>
              <h1>
                <span className="line">شريكك <span className="word-3d">الاستراتيجي</span></span>
                <span className="line">للتحول <span className="word-teal">الرقمي</span></span>
              </h1>
              <p className="hero-lede">
                حلول تقنية متكاملة تدعم نمو الشركات وتُعزز التحول الرقمي. بنساعد الشركات والمؤسسات على بناء حضور رقمي احترافي، وتحويل التكنولوجيا لأداة استراتيجية لزيادة الكفاءة وجذب العملاء.
              </p>
              <div className="hero-actions">
                <a href="https://wa.me/201500156690" className="btn btn-primary" target="_blank" rel="noreferrer">
                  اطلب استشارة تقنية <span className="arrow">←</span>
                </a>
                <Link to="/portfolio" className="btn btn-ghost">شوف أعمالنا</Link>
              </div>
              <div className="hero-meta">
                <div className="hero-meta-item">
                  <strong>+12</strong>
                  <span>سنة من الخبرة</span>
                </div>
                <div className="hero-meta-item">
                  <strong>+40</strong>
                  <span>مشروع منجز</span>
                </div>
                <div className="hero-meta-item">
                  <strong>5</strong>
                  <span>دول · مصر · السعودية · الإمارات · قطر · الكويت</span>
                </div>
              </div>
            </div>

            <div className="hero-visual reveal is-visible">
              <div className="hero-cluster">
                <div className="hero-orbit"></div>
                <svg viewBox="0 0 460 460" xmlns="http://www.w3.org/2000/svg">
                  {/* Big center cube */}
                  <g className="float-a" transform="translate(140, 130)">
                    <polygon points="0,40 40,0 200,0 160,40" fill="#65C8D0" stroke="#FFFFFF" strokeWidth="4"/>
                    <polygon points="160,40 200,0 200,180 160,220" fill="#3FA4AC" stroke="#FFFFFF" strokeWidth="4"/>
                    <rect x="0" y="40" width="160" height="180" fill="#F15A24" stroke="#FFFFFF" strokeWidth="4"/>
                    <text x="80" y="155" textAnchor="middle" fontFamily="Archivo Black,sans-serif" fontStyle="italic" fontSize="64" fill="#FFFFFF" letterSpacing="-2">BSN</text>
                  </g>
                  {/* Top-right small cube */}
                  <g className="float-b" transform="translate(310, 50)">
                    <polygon points="0,20 20,0 100,0 80,20" fill="#FFFFFF" stroke="#0F0830" strokeWidth="3"/>
                    <polygon points="80,20 100,0 100,80 80,100" fill="#E6E6F0" stroke="#0F0830" strokeWidth="3"/>
                    <rect x="0" y="20" width="80" height="80" fill="#5C15CC" stroke="#0F0830" strokeWidth="3"/>
                  </g>
                  {/* Bottom-left small cube */}
                  <g className="float-c" transform="translate(40, 280)">
                    <polygon points="0,20 20,0 90,0 70,20" fill="#F15A24" stroke="#FFFFFF" strokeWidth="3"/>
                    <polygon points="70,20 90,0 90,80 70,100" fill="#C73E0F" stroke="#FFFFFF" strokeWidth="3"/>
                    <rect x="0" y="20" width="70" height="80" fill="#FFFFFF" stroke="#0F0830" strokeWidth="3"/>
                    <text x="35" y="74" textAnchor="middle" fontFamily="Cairo,sans-serif" fontWeight="900" fontSize="36" fill="#0F0830">★</text>
                  </g>
                  {/* Bottom-right tiny cube */}
                  <g className="float-d" transform="translate(330, 320)">
                    <polygon points="0,14 14,0 70,0 56,14" fill="#65C8D0" stroke="#FFFFFF" strokeWidth="3"/>
                    <polygon points="56,14 70,0 70,60 56,74" fill="#3FA4AC" stroke="#FFFFFF" strokeWidth="3"/>
                    <rect x="0" y="14" width="56" height="60" fill="#0F0830" stroke="#FFFFFF" strokeWidth="3"/>
                  </g>
                  {/* Decorative dots */}
                  <circle cx="50"  cy="100" r="6" fill="#F15A24"/>
                  <circle cx="410" cy="200" r="6" fill="#65C8D0"/>
                  <circle cx="80"  cy="220" r="4" fill="#FFFFFF"/>
                  <circle cx="400" cy="380" r="4" fill="#FFFFFF"/>
                  {/* Star/sparkle */}
                  <g transform="translate(380, 100)">
                    <path d="M0,-12 L3,-3 L12,0 L3,3 L0,12 L-3,3 L-12,0 L-3,-3 Z" fill="#F15A24" stroke="#FFFFFF" strokeWidth="1.5"/>
                  </g>
                </svg>
                <div className="hero-sticker">
                  <div className="hero-sticker-inner">★ +12 سنة</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-cue">
          <span>SCROLL</span>
          <span className="line"></span>
        </div>
      </section>

      {/* ===== MARQUEE 1 ===== */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span className="marquee-item">شريك الأعمال<span className="star"></span></span>
          <span className="marquee-item outline">BUSINESS PARTNER<span className="star"></span></span>
          <span className="marquee-item teal">هوية رقمية<span className="star"></span></span>
          <span className="marquee-item">BSN<span className="star"></span></span>
          <span className="marquee-item orange">DESIGN · DEVELOP · DELIVER<span className="star"></span></span>
          <span className="marquee-item outline">CAIRO × RIYADH<span className="star"></span></span>
          <span className="marquee-item">شريك الأعمال<span className="star"></span></span>
          <span className="marquee-item outline">BUSINESS PARTNER<span className="star"></span></span>
        </div>
      </div>

      {/* ===== FEATURED SERVICES — asymmetric 1 big + 3 small ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow" style={{ color: 'var(--o)' }}>خدماتنا</span>
            <h2 className="h-section" style={{ marginTop: 20 }}>
              كل اللي محتاجه — <span className="text-3d teal-base">في مكان واحد</span>
            </h2>
            <p>أربع تخصّصات أساسية، فريق واحد، رؤية واحدة. كل خدمة بنشتغلها بنفس الإتقان.</p>
          </div>

          <div className="features-grid">
            {/* Big featured */}
            <article className="feature-card big reveal is-visible">
              <div>
                <span className="feature-corner">01</span>
                <span className="feature-num">01 / خدمتنا الأكتر طلبًا</span>
                <div className="feature-icon">⚡</div>
                <h3>تصميم وتطوير المواقع</h3>
                <p>من landing page بسيطة لنظام إدارة محتوى متكامل بـ Laravel + Vite. مواقع سريعة، آمنة، متجاوبة، ومُحسّنة للسيو من اليوم الأول.</p>
                <ul className="big-feats">
                  <li><span className="bf-check">✓</span> Laravel 11 + Vite</li>
                  <li><span className="bf-check">✓</span> دعم كامل عربي/إنجليزي (RTL/LTR)</li>
                  <li><span className="bf-check">✓</span> SEO تقني من اليوم الأول</li>
                  <li><span className="bf-check">✓</span> لوحة تحكم احترافية</li>
                  <li><span className="bf-check">✓</span> شهر دعم مجاني بعد التسليم</li>
                </ul>
                <div className="big-mini-stats">
                  <div className="bms-cell">
                    <strong>+32</strong>
                    <span>موقع منجز</span>
                  </div>
                  <div className="bms-cell">
                    <strong>14 يوم</strong>
                    <span>متوسط التسليم</span>
                  </div>
                  <div className="bms-cell">
                    <strong>100%</strong>
                    <span>كود ملكك</span>
                  </div>
                </div>
                <div className="big-tech-row">
                  <span className="btr-label">التقنيات</span>
                  <span className="btr-badge">Laravel 11</span>
                  <span className="btr-badge">Vite</span>
                  <span className="btr-badge">Next.js</span>
                  <span className="btr-badge">Tailwind</span>
                </div>
                <ul className="big-extras">
                  <li>
                    <span className="be-icon">🚀</span>
                    <div>
                      <strong>أداء عالي</strong>
                      <span>Lighthouse score 95+ من أول إطلاق</span>
                    </div>
                  </li>
                  <li>
                    <span className="be-icon">🔒</span>
                    <div>
                      <strong>أمان مدمج</strong>
                      <span>حماية CSRF/XSS + SSL مجاني</span>
                    </div>
                  </li>
                  <li>
                    <span className="be-icon">📱</span>
                    <div>
                      <strong>متجاوب 100%</strong>
                      <span>تجربة موحدة على الموبايل والتابلت والديسكتوب</span>
                    </div>
                  </li>
                  <li>
                    <span className="be-icon">🧩</span>
                    <div>
                      <strong>قابل للتوسع</strong>
                      <span>إضافة موديولات وميزات مستقبلية بسهولة</span>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="big-bottom">
                <div className="big-price-tag">
                  <span className="bpt-label">يبدأ من</span>
                  <strong>8,500 EGP</strong>
                  <span className="bpt-meta">لـ Landing Page · Multi-page من 22,000</span>
                </div>
                <Link to="/service-web" className="feature-link">
                  استكشف خدمات الويب <span>←</span>
                </Link>
              </div>
            </article>

            <div className="features-right">
              <article className="feature-card feat-teal reveal is-visible">
                <span className="feature-corner">02</span>
                <span className="feature-num">02</span>
                <div className="feature-icon" style={{ background: 'var(--t)', color: 'var(--p)' }}>🛒</div>
                <h3>المتاجر الإلكترونية</h3>
                <p>متاجر متكاملة مع بوابات دفع محلية، شحن، وتقارير مبيعات.</p>
                <Link to="/services" className="feature-link">المزيد <span>←</span></Link>
              </article>

              <article className="feature-card feat-purple reveal is-visible">
                <span className="feature-corner">03</span>
                <span className="feature-num">03</span>
                <div className="feature-icon" style={{ background: 'var(--p)' }}>🎨</div>
                <h3>الهوية البصرية</h3>
                <p>لوجو، دليل هوية، مطبوعات، وموكاب احترافي بيعكس شخصيتك.</p>
                <Link to="/services" className="feature-link">المزيد <span>←</span></Link>
              </article>

              <article className="feature-card feat-ink reveal is-visible">
                <span className="feature-corner">04</span>
                <span className="feature-num">04</span>
                <div className="feature-icon">📈</div>
                <h3>التسويق الرقمي</h3>
                <p>إعلانات ميتا وجوجل، SEO، ومحتوى يجيب عملاء حقيقيين.</p>
                <Link to="/services" className="feature-link">المزيد <span>←</span></Link>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="section section-tight">
        <div className="container">
          <div className="stats-block reveal is-visible">
            <div className="stat-cell">
              <span className="stat-num">+12</span>
              <span className="stat-label">سنة من الخبرة التقنية</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">+40</span>
              <span className="stat-label">مشروع منجز</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">5</span>
              <span className="stat-label">دول · مصر · الخليج</span>
            </div>
            <div className="stat-cell">
              <span className="stat-num">97%</span>
              <span className="stat-label">معدل <span className="hl-label">رضا</span> العملاء</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="section section-teal">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow" style={{ color: 'var(--p)' }}>آلية العمل</span>
            <h2 className="h-section" style={{ marginTop: 20, color: 'var(--p-deep)' }}>
              من <span className="text-3d white-base">الفكرة</span> للإطلاق
            </h2>
            <p style={{ color: 'var(--p-deep)' }}>أربع خطوات واضحة، شفافة، ومش هتلاقي أي مفاجآت في طريقنا.</p>
          </div>

          <div className="process-line" style={{ color: 'var(--p-deep)' }}>
            <div className="process-step reveal is-visible">
              <span className="step-num">01</span>
              <h3>الاستماع والتخطيط</h3>
              <p>جلسة عميقة معاك نفهم فيها مشروعك، أهدافك، جمهورك، والمنافسين. بنخرج بـ brief واضح.</p>
            </div>
            <div className="process-step reveal is-visible">
              <span className="step-num">02</span>
              <h3>التصميم والمراجعة</h3>
              <p>3 اتجاهات بصرية مختلفة، تختار اللي يعبّر عنك، وبنطوّره معاك في جولات مراجعة.</p>
            </div>
            <div className="process-step reveal is-visible">
              <span className="step-num">03</span>
              <h3>التطوير والتنفيذ</h3>
              <p>تحويل التصاميم لمنتج فعلي شغّال — كود نظيف، performance عالي، آمن، ومُختبر.</p>
            </div>
            <div className="process-step reveal is-visible">
              <span className="step-num">04</span>
              <h3>الإطلاق والدعم</h3>
              <p>تسليم كامل، تدريب فريقك على لوحة التحكم، ودعم فني مجاني لمدة شهر بعد الإطلاق.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MARQUEE 2 ===== */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span className="marquee-item teal">+40 مشروع<span className="star"></span></span>
          <span className="marquee-item outline">+12 سنة <span className="hl-mq">خبرة</span><span className="star"></span></span>
          <span className="marquee-item orange">5 دول · مصر · الخليج<span className="star"></span></span>
          <span className="marquee-item">97% <span className="hl-mq">رضا</span> العملاء<span className="star"></span></span>
          <span className="marquee-item teal">+40 مشروع<span className="star"></span></span>
          <span className="marquee-item outline">+12 سنة <span className="hl-mq">خبرة</span><span className="star"></span></span>
          <span className="marquee-item orange">5 دول · مصر · الخليج<span className="star"></span></span>
          <span className="marquee-item">97% <span className="hl-mq">رضا</span> العملاء<span className="star"></span></span>
        </div>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow" style={{ color: 'var(--o)' }}>آراء عملائنا</span>
            <h2 className="h-section" style={{ marginTop: 20 }}>قالوا <span className="text-3d">عنا</span></h2>
            <p>الشغل بيتكلم عن نفسه، وعملائنا بيتكلموا عنه كمان.</p>
          </div>

          <div className="testi-grid">
            <div className="testimonial reveal is-visible">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">احترافية شريك الأعمال لا تقتصر على التصميم فقط، بل تمتد لفهم عميق لاحتياجات البيزنس. الموقع الجديد ساعدنا في زيادة مبيعاتنا.</p>
              <div className="testi-author">
                <div className="testi-avatar">أ</div>
                <div className="testi-meta">
                  <strong>أحمد المنصوري</strong>
                  <span>Rozet Pump · مضخات إيطالية</span>
                </div>
              </div>
            </div>

            <div className="testimonial reveal is-visible">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">الدقة في المواعيد والجودة في التنفيذ هي أكثر ما يميزهم. فريق العمل متعاون جداً وقدموا لنا حلولاً تقنية وفرت علينا الكثير.</p>
              <div className="testi-author">
                <div className="testi-avatar">س</div>
                <div className="testi-meta">
                  <strong>سارة العلي</strong>
                  <span>West Gate · مقاولات سعودية</span>
                </div>
              </div>
            </div>

            <div className="testimonial reveal is-visible">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">تجربة مميزة من الألف للياء. التصميم يعكس هويتنا بامتياز، والدعم الفني سريع ومتجاوب دائماً. شكراً لكم.</p>
              <div className="testi-author">
                <div className="testi-avatar">خ</div>
                <div className="testi-meta">
                  <strong>خالد يوسف</strong>
                  <span>Milestone LTD · رخام وجرانيت</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="cta-banner">
        <svg className="cubes-bg" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <symbol id="iso-cube" viewBox="0 0 80 80">
              <polygon points="0,16 16,0 80,0 64,16" fill="#65C8D0" stroke="#FFFFFF" strokeWidth="2"/>
              <polygon points="64,16 80,0 80,64 64,80" fill="#3FA4AC" stroke="#FFFFFF" strokeWidth="2"/>
              <rect x="0" y="16" width="64" height="64" fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2"/>
            </symbol>
          </defs>
          <use href="#iso-cube" x="60"   y="40"  width="100" height="100"/>
          <use href="#iso-cube" x="220"  y="180" width="80"  height="80"/>
          <use href="#iso-cube" x="980"  y="60"  width="120" height="120"/>
          <use href="#iso-cube" x="1080" y="240" width="80"  height="80"/>
          <use href="#iso-cube" x="380"  y="280" width="60"  height="60"/>
        </svg>
        <div className="container cta-banner-inner">
          <div className="reveal is-visible">
            <h2>جاهز <span className="ko">تبدأ</span> رحلتك الرقمية؟</h2>
            <p>احجز استشارتك المجانية (30 دقيقة، بدون أي التزام). نسمع فكرتك، نقولك رأينا بصراحة، ونحطلك خطة لو مناسبة.</p>
            <Link to="/contact" className="btn btn-dark">
              احجز استشارة مجانية <span className="arrow">←</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
