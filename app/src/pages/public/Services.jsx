import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function Services() {
  return (
    <>
      <SEO
        title="خدماتنا"
        description="أربع تخصصات أساسية: تطوير المواقع، المتاجر الإلكترونية، الهوية البصرية، والتسويق الرقمي — كل خدمة بفريق متخصص."
      />
      {/* ===== HERO ===== */}
      <section className="hero hero-inner">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-wrap">
            <div className="hero-content reveal is-visible">
              <div className="hero-tag">
                <span className="badge">خدماتنا</span>
                أربعة تخصصات · فريق واحد
              </div>
              <h1>
                <span className="line">خدمات <span className="word-3d">احترافية</span></span>
                <span className="line">تليق بـ <span className="word-teal">طموحك</span></span>
              </h1>
              <p className="hero-lede">
                باقة متكاملة من الخدمات الرقمية مصمّمة لتدعم حضورك الرقمي بإتقان — من الموقع لأول حملة إعلانية.
              </p>
              <div className="hero-actions">
                <Link to="/pricing" className="btn btn-primary">شوف الأسعار <span className="arrow">←</span></Link>
                <Link to="/contact" className="btn btn-ghost">احجز استشارة</Link>
              </div>
            </div>
            <div className="hero-visual reveal is-visible">
              <div className="mini-services">
                <Link to="/service-web" className="mini-srv">
                  <span className="mini-srv-num">01</span>
                  <span className="mini-srv-name">تطوير المواقع</span>
                  <span className="mini-srv-meta">Laravel · Next.js</span>
                </Link>
                <Link to="/service-ecommerce" className="mini-srv">
                  <span className="mini-srv-num">02</span>
                  <span className="mini-srv-name">المتاجر الإلكترونية</span>
                  <span className="mini-srv-meta">Paymob · Bosta</span>
                </Link>
                <Link to="/service-branding" className="mini-srv">
                  <span className="mini-srv-num">03</span>
                  <span className="mini-srv-name">الهوية البصرية</span>
                  <span className="mini-srv-meta">Logo · Brand Book</span>
                </Link>
                <Link to="/service-marketing" className="mini-srv">
                  <span className="mini-srv-num">04</span>
                  <span className="mini-srv-name">التسويق الرقمي</span>
                  <span className="mini-srv-meta">Meta · Google · TikTok</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Service 01 — Web ===== */}
      <section className="section section-light">
        <div className="container">
          <div className="service-block reveal is-visible">
            <div>
              <span className="num-mark">— 01 / خدمات الويب</span>
              <h2>مواقع <span className="bsn-3d" style={{ fontSize: '0.8em' }}>احترافية</span> بتحوّل الزوّار لعملاء</h2>
              <p>كل موقع بنطوره بيتبني على أساس استراتيجي واضح. مش بس شكل جميل — كود نظيف، سرعة عالية، تجربة مستخدم مدروسة، وتوافق كامل مع محركات البحث.</p>
              <ul className="feat-list">
                <li>مواقع شركات احترافية متعددة الصفحات بـ Laravel + Vite</li>
                <li>صفحات هبوط (Landing Pages) محسّنة للتحويل</li>
                <li>أنظمة إدارة محتوى مخصصة حسب طبيعة عملك</li>
                <li>دعم كامل للغتين العربية والإنجليزية (RTL/LTR)</li>
                <li>تحسين السرعة وSEO تقني من اليوم الأول</li>
              </ul>
              <Link to="/contact" className="btn btn-primary">اطلب عرض سعر <span className="arrow">←</span></Link>
            </div>
            <div className="service-visual tone-purple">
              <span className="label-tag">01 · WEB</span>
              <svg viewBox="0 0 400 400" width="80%" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="80" width="300" height="240" rx="14" fill="#FFFFFF" stroke="#0F0830" strokeWidth="4"/>
                <rect x="50" y="80" width="300" height="40" rx="14" fill="#F15A24" stroke="#0F0830" strokeWidth="4"/>
                <circle cx="76" cy="100" r="6" fill="#FFFFFF"/>
                <circle cx="98" cy="100" r="6" fill="#FFFFFF"/>
                <circle cx="120" cy="100" r="6" fill="#FFFFFF"/>
                <rect x="70" y="140" width="180" height="14" fill="#5C15CC"/>
                <rect x="70" y="164" width="120" height="10" fill="#65C8D0"/>
                <rect x="70" y="200" width="260" height="70" fill="#65C8D0" stroke="#0F0830" strokeWidth="3"/>
                <rect x="70" y="282" width="90" height="22" fill="#F15A24" stroke="#0F0830" strokeWidth="3"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Service 02 — E-commerce ===== */}
      <section className="section section-teal">
        <div className="container">
          <div className="service-block reverse reveal is-visible">
            <div className="service-visual tone-purple">
              <span className="label-tag">02 · SHOP</span>
              <svg viewBox="0 0 400 400" width="80%" xmlns="http://www.w3.org/2000/svg">
                <rect x="40" y="60" width="150" height="200" rx="10" fill="#FFFFFF" stroke="#0F0830" strokeWidth="4"/>
                <rect x="40" y="60" width="150" height="110" rx="10" fill="#65C8D0" stroke="#0F0830" strokeWidth="4"/>
                <rect x="60" y="190" width="110" height="10" fill="#5C15CC"/>
                <rect x="60" y="210" width="60" height="8" fill="#999"/>
                <rect x="60" y="228" width="50" height="14" fill="#F15A24"/>
                <rect x="210" y="60" width="150" height="200" rx="10" fill="#FFFFFF" stroke="#0F0830" strokeWidth="4"/>
                <rect x="210" y="60" width="150" height="110" rx="10" fill="#F15A24" stroke="#0F0830" strokeWidth="4"/>
                <rect x="230" y="190" width="110" height="10" fill="#5C15CC"/>
                <rect x="230" y="210" width="60" height="8" fill="#999"/>
                <rect x="230" y="228" width="50" height="14" fill="#F15A24"/>
                <g transform="translate(290, 280)">
                  <circle r="42" fill="#F15A24" stroke="#FFFFFF" strokeWidth="4"/>
                  <text y="14" textAnchor="middle" fill="#FFFFFF" fontFamily="Archivo Black,sans-serif" fontStyle="italic" fontSize="36">3</text>
                </g>
              </svg>
            </div>
            <div>
              <span className="num-mark" style={{ color: 'var(--p)' }}>— 02 / المتاجر الإلكترونية</span>
              <h2>متجرك جاهز <span className="bsn-3d" style={{ fontSize: '0.8em' }}>للبيع</span> من أول يوم</h2>
              <p>متاجر إلكترونية متكاملة، بتشتغل على Laravel أو WooCommerce حسب احتياجك، مع دمج كامل لبوابات الدفع المحلية والشحن وأنظمة الفواتير.</p>
              <ul className="feat-list">
                <li>دمج بوابات دفع محلية (Paymob, MyFatoorah, Tap, Stripe)</li>
                <li>تكامل مع خدمات الشحن (Aramex, Bosta, SMSA, J&amp;T)</li>
                <li>لوحة تحكم شاملة للمنتجات والطلبات والعملاء</li>
                <li>تقارير مبيعات وتحليلات مفصلة</li>
                <li>كوبونات، نقاط ولاء، عضويات، وعروض</li>
              </ul>
              <Link to="/contact" className="btn btn-primary">اطلب عرض سعر <span className="arrow">←</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Service 03 — Branding ===== */}
      <section className="section section-paper">
        <div className="container">
          <div className="service-block reveal is-visible">
            <div>
              <span className="num-mark">— 03 / الهوية البصرية</span>
              <h2>هوية بتعبّر <span className="bsn-3d" style={{ fontSize: '0.8em' }}>عنك</span> — مش مجرد لوجو</h2>
              <p>الهوية البصرية مش بس لوجو، دي شخصية شركتك بالكامل. بنشتغل معاك من البحث، للستراتيجية، للتطبيق، عشان نطلعلك هوية متكاملة بتفرق فعلًا في السوق.</p>
              <ul className="feat-list">
                <li>تصميم اللوجو بعدة اتجاهات وتنويعات</li>
                <li>دليل الهوية البصرية الكامل (Brand Guidelines)</li>
                <li>منظومة الألوان، الخطوط، والعناصر البصرية</li>
                <li>مطبوعات: كروت أعمال، أوراق رسمية، أظرف</li>
                <li>موكاب احترافي للعرض والتقديم</li>
              </ul>
              <Link to="/contact" className="btn btn-primary">اطلب عرض سعر <span className="arrow">←</span></Link>
            </div>
            <div className="service-visual tone-orange">
              <span className="label-tag">03 · BRAND</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Archivo Black',sans-serif",
                  fontStyle: 'italic',
                  fontSize: 140,
                  lineHeight: 1,
                  color: '#F15A24',
                  WebkitTextStroke: '4px #FFFFFF',
                  textShadow: '6px 8px 0 #65C8D0, 12px 16px 0 #3A0B85',
                  letterSpacing: '-4px',
                }}>BSN</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Service 04 — Marketing ===== */}
      <section className="section section-teal">
        <div className="container">
          <div className="service-block reverse reveal is-visible">
            <div className="service-visual tone-ink">
              <span className="label-tag">04 · GROW</span>
              <svg viewBox="0 0 400 400" width="80%" xmlns="http://www.w3.org/2000/svg">
                <rect x="60"  y="240" width="50" height="100" fill="#F15A24" stroke="#FFFFFF" strokeWidth="3"/>
                <rect x="125" y="180" width="50" height="160" fill="#65C8D0" stroke="#FFFFFF" strokeWidth="3"/>
                <rect x="190" y="120" width="50" height="220" fill="#F15A24" stroke="#FFFFFF" strokeWidth="3"/>
                <rect x="255" y="80"  width="50" height="260" fill="#65C8D0" stroke="#FFFFFF" strokeWidth="3"/>
                <polyline points="85,260 150,200 215,140 280,100" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round"/>
                <circle cx="85"  cy="260" r="8"  fill="#FFFFFF"/>
                <circle cx="150" cy="200" r="8"  fill="#FFFFFF"/>
                <circle cx="215" cy="140" r="8"  fill="#FFFFFF"/>
                <circle cx="280" cy="100" r="12" fill="#F15A24" stroke="#FFFFFF" strokeWidth="3"/>
              </svg>
            </div>
            <div>
              <span className="num-mark" style={{ color: 'var(--p)' }}>— 04 / التسويق الرقمي</span>
              <h2>تسويق بيجيب <span className="bsn-3d" style={{ fontSize: '0.8em' }}>مبيعات</span> مش بس لايكات</h2>
              <p>إدارة حملاتك التسويقية باستراتيجية واضحة، ميزانية مدروسة، وتقارير شفافة. هدفنا الواحد: عملاء حقيقيين بيشتروا منك.</p>
              <ul className="feat-list">
                <li>إعلانات Meta (Facebook & Instagram)</li>
                <li>إعلانات Google (Search, Display, YouTube)</li>
                <li>إدارة السوشيال ميديا — محتوى + تصاميم</li>
                <li>تحسين محركات البحث (SEO) محلي ودولي</li>
                <li>كتابة محتوى تسويقي وكوبي رايتنج بالعربي والإنجليزي</li>
              </ul>
              <Link to="/contact" className="btn btn-primary">اطلب عرض سعر <span className="arrow">←</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Additional services ===== */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow" style={{ color: 'var(--o)' }}>خدمات إضافية</span>
            <h2 className="h-section" style={{ marginTop: 20 }}>حلول <span className="text-3d teal-base">متخصصة</span> كمان</h2>
            <p>خدمات داعمة بتكمل منظومتك الرقمية بكفاءة.</p>
          </div>

          <div className="extra-services-grid">
            <article className="feature-card reveal is-visible">
              <div className="feature-icon">📱</div>
              <h3>تطبيقات الموبايل</h3>
              <p>iOS و Android بـ React Native و Flutter.</p>
            </article>
            <article className="feature-card feat-teal reveal is-visible">
              <div className="feature-icon" style={{ background: 'var(--t)', color: 'var(--p)' }}>🤖</div>
              <h3>أتمتة وذكاء اصطناعي</h3>
              <p>شات بوت، أتمتة المهام، وأنظمة CRM ذكية.</p>
            </article>
            <article className="feature-card feat-purple reveal is-visible">
              <div className="feature-icon" style={{ background: 'var(--p)' }}>✍️</div>
              <h3>كتابة المحتوى</h3>
              <p>محتوى تسويقي بالعربي والإنجليزي.</p>
            </article>
            <article className="feature-card feat-ink reveal is-visible">
              <div className="feature-icon">🎬</div>
              <h3>الموشن جرافيك</h3>
              <p>فيديوهات تعريفية وانفوجرافيك متحرك.</p>
            </article>
            <article className="feature-card reveal is-visible">
              <div className="feature-icon">🛠️</div>
              <h3>الصيانة والدعم</h3>
              <p>باقات شهرية، تحديثات، ونسخ احتياطي.</p>
            </article>
            <article className="feature-card feat-teal reveal is-visible">
              <div className="feature-icon" style={{ background: 'var(--t)', color: 'var(--p)' }}>☁️</div>
              <h3>الاستضافة والدومين</h3>
              <p>استضافة سريعة، دومينات، وSSL.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-banner">
        <div className="container cta-banner-inner">
          <div className="reveal is-visible">
            <h2>عندك مشروع في بالك؟<br /><span className="ko">خلّينا نسمعه</span></h2>
            <p>أيًا كانت فكرتك أو حجم مشروعك، تعالى نتقابل ونحطّلك خطة عمل واضحة.</p>
            <Link to="/contact" className="btn btn-dark">احجز استشارة مجانية <span className="arrow">←</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
