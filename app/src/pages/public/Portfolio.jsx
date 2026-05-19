import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

// Color rotation
const TONES = ['tone-purple', 'tone-orange', 'tone-teal', 'tone-ink'];

const WEB_PROJECTS = [
  { url: 'https://nasrconsult.com/', label: 'Nasr', tag: 'موقع · كيماويات واستشارات', title: 'Nasr Chemicals', desc: 'شركة النصر للكيماويات والاستشارات الصناعية.' },
  { url: 'http://al-amein.com/', label: 'Al Amein', tag: 'موقع · تصدير زراعي', title: 'Al Amein', desc: 'شركة الأمين لتصدير المحاصيل الزراعية.' },
  { url: 'https://saqacapital-llc.com/', label: 'Saqa', tag: 'موقع · حلول مالية', title: 'Saqa Capital', desc: 'شركة ثقة (Saqa) للحلول المالية.' },
  { url: 'https://global-translations.net/', label: 'Global', tag: 'موقع · ترجمة', title: 'Global Translations', desc: 'جلوبال ترنسليشن — خدمات الترجمة الاحترافية.' },
  { url: 'https://alebel.com/', label: 'Alebel', tag: 'موقع · مجموعة شركات', title: 'Alebel Holding', desc: 'شركة الإبل القابضة — مجموعة شركات.' },
  { url: 'https://gfc-it.com/', label: 'GFC', tag: 'موقع · كابلات', title: 'Golden Future Care', desc: 'شركة جولدن لتوريد كابلات الكهرباء.' },
  { url: 'https://arabengineers-eg.com/', label: 'Arab Eng', tag: 'موقع · عقاري', title: 'Arab Engineers', desc: 'المهندسون العرب للاستثمار العقاري.' },
  { url: 'https://dglaviation.net/', label: 'DGL', tag: 'موقع · طيران', title: 'DGL Aviation', desc: 'شركة DGL لخدمات الطيران الخاصة.' },
  { url: 'https://bluewave-group.net/', label: 'Blue Wave', tag: 'موقع · بحري', title: 'Blue Wave', desc: 'شركة بلو ويف لصيانة السفن البحرية.' },
  { url: 'https://fema-ms.com/', label: 'Fema', tag: 'موقع · بحري', title: 'Fema MS', desc: 'شركة فيما لصيانة أجهزة السفن.' },
  { url: 'https://elgendychemical.com/', label: 'Elgendy', tag: 'موقع · كيماويات', title: 'Elgendy Chemical', desc: 'شركة الجندي للكيماويات.' },
  { url: 'https://rozetpump.com/', label: 'Rozet', tag: 'موقع · مضخات', title: 'Rozet Pump', desc: 'شركة روزيت — مصنع إيطالي للمضخات.' },
  { url: 'https://samadelivery.ae/', label: 'Sama', tag: 'موقع · شحن إماراتي', title: 'Sama Delivery', desc: 'شركة سما دليفري — شركة شحن إماراتية.' },
  { url: 'https://herbsgarden-eg.com/', label: 'Herbs', tag: 'موقع · تصدير زراعي', title: 'Herbs Garden', desc: 'هيربس جاردن — تصدير الحاصلات الزراعية.' },
  { url: 'https://westgate.sa/', label: 'West Gate', tag: 'موقع · مقاولات سعودية', title: 'West Gate', desc: 'شركة البوابة الغربية — مقاولات سعودية.' },
  { url: 'https://milestone-ltd.com/', label: 'Milestone', tag: 'موقع · رخام وجرانيت', title: 'Milestone LTD', desc: 'شركة ميل ستون — تصدير الرخام والجرانيت.' },
  { url: 'https://mm-marinebunker.com/', label: 'MM Bunker', tag: 'موقع · وقود بحري', title: 'MM Marine Bunker', desc: 'شركة MM لتزويد السفن بالوقود البحري.' },
  { url: 'https://eg-energy.com/', label: 'Egy Energy', tag: 'موقع · طاقة', title: 'Egy Energy', desc: 'المجموعة المصرية للطاقة — حلول توليد.' },
  { url: 'https://namaa-academy.com/', label: 'Namaa', tag: 'منصة · تعليمية', title: 'Namaa Academy', desc: 'منصة نماء التعليمية للمحتوى التدريبي.' },
  { url: 'https://scoutacademy-eg.com/', label: 'Scout', tag: 'موقع · كشافة', title: 'Scout Academy', desc: 'أكاديمية الكشافة المصرية.' },
  { url: 'https://aljada20.com/', label: 'Aljada 20', tag: 'موقع · إدارة مرافق', title: 'Aljada 20', desc: 'الجادة عشرون لإدارة المرافق.' },
  { url: 'https://orchardtrade.com/', label: 'Orchard', tag: 'موقع · تصدير زراعي', title: 'Orchard Trade', desc: 'شركة أورشارد تريد — تصدير الحاصلات.' },
  { url: 'https://union-arab.org/', label: 'Union Arab', tag: 'موقع · اتحاد دولي', title: 'Union Arab', desc: 'الاتحاد العربي — اتحاد دولي للخبراء.' },
  { url: 'http://ahmedelfattehautopart.com/', label: 'El Fatteh', tag: 'موقع · قطع غيار', title: 'Ahmed El Fatteh', desc: 'مؤسسة أحمد الفتح لقطع غيار السيارات.' },
  { url: 'https://innomation.net/', label: 'Innomation', tag: 'موقع · أتمتة صناعية', title: 'Innomation', desc: 'إنوميشن للحلول الصناعية ومجال الأتمتة.' },
  { url: 'https://royal-city-development.com/', label: 'Royal City', tag: 'موقع · استثمار عقاري', title: 'Royal City', desc: 'شركة رويال سيتي للاستثمار العقاري.' },
  { url: 'https://nasseflawfirm.com/', label: 'Nassef Law', tag: 'موقع · محاماة', title: 'Nassef Law', desc: 'مؤسسة الناصف للمحاماة والاستشارات القانونية.' },
  { url: 'https://deraa-ksa.com/', label: 'Deraa', tag: 'موقع · إطفاء وسلامة', title: 'Deraa', desc: 'مؤسسة درع للأمن — أنظمة الإطفاء والسلامة.' },
  { url: 'https://els-shipping.com/', label: 'ELS', tag: 'موقع · لوجستيات', title: 'ELS Shipping', desc: 'ELS — حلول لوجستية متكاملة.' },
  { url: 'https://suzlerpump.com/', label: 'Suzler', tag: 'موقع · مضخات', title: 'Suzler Pump', desc: 'شركة سوزلر بامب — مضخات المياه.' },
  { url: 'https://hotel-spark.com/', label: 'Hotel Spark', tag: 'موقع · خدمات نظافة', title: 'Hotel Spark', desc: 'هوتيل سبارك — خدمات النظافة الفندقية.' },
  { url: 'https://proconsult-eg.com/', label: 'Pro Consult', tag: 'موقع · استشارات', title: 'Pro Consult', desc: 'شركة برو كونسلت للاستشارات.' },
];

const ECOM_PROJECTS = [
  { url: 'https://maskaany.com/', label: 'Maskaany', tag: 'متجر · أثاث', title: 'Maskaany', desc: 'متجر مسكني — متجر أثاث متكامل.' },
  { url: 'http://maashehaa.com/', label: 'Maashehaa', tag: 'متجر · كمبيوتر', title: 'Maashehaa', desc: 'متجر مشيها — أجهزة الكمبيوتر والإكسسوارات.' },
  { url: 'http://progressx-eg.com/', label: 'Progress X', tag: 'متجر · توزيع', title: 'Progress X', desc: 'متجر بروجرس اكس — شركة توزيع.' },
  { url: 'https://grasse-egy.com/', label: 'Grasse', tag: 'متجر · عطور', title: 'Grasse', desc: 'متجر جراس — متجر عطور فاخرة.' },
  { url: 'http://polatrick.com/', label: 'Pola Trick', tag: 'متجر · أدوات منزلية', title: 'Pola Trick', desc: 'متجر بولا تريك للأدوات المنزلية.' },
  { url: 'https://filterconcrete.com/', label: 'Filter Concrete', tag: 'متجر · فلاتر مياه', title: 'Filter Concrete', desc: 'متجر شركة فلاتر تنقية المياه.' },
  { url: 'https://mkcaffeegypt.com/', label: 'MK Cafe', tag: 'متجر · قهوة', title: 'MK Cafe', desc: 'متجر ام كي كافيه — متجر قهوة وحبوب.' },
  { url: 'http://bakkah-eg.com/', label: 'Bakkah', tag: 'متجر · أدوات منزلية', title: 'Bakkah Store', desc: 'متجر بكة — +3,400 منتج، WooCommerce متكامل.' },
  { url: 'http://mansour-market.com/', label: 'Mansour', tag: 'متجر · عام', title: 'Mansour Market', desc: 'متجر خلفاء منصور — متجر عام شامل.' },
];

function screenshotUrl(siteUrl) {
  // Free service that captures a site screenshot. Falls back to the tone block on error.
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(siteUrl)}?w=640&h=400`;
}

function WorkCard({ project, index, category }) {
  const tone = TONES[index % TONES.length];
  return (
    <a href={project.url} target="_blank" rel="noreferrer" className="work-card reveal is-visible" data-category={category}>
      <div className={'work-thumb ' + tone}>
        <img
          src={screenshotUrl(project.url)}
          alt={project.title}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <span>{project.label}</span>
      </div>
      <div className="work-body">
        <span className="work-tag">{project.tag}</span>
        <h3>{project.title}</h3>
        <p>{project.desc}</p>
      </div>
    </a>
  );
}

export default function Portfolio() {
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all'
    ? [...WEB_PROJECTS.map((p, i) => ({ ...p, _cat: 'web', _idx: i })),
       ...ECOM_PROJECTS.map((p, i) => ({ ...p, _cat: 'ecommerce', _idx: i + WEB_PROJECTS.length }))]
    : filter === 'web'
      ? WEB_PROJECTS.map((p, i) => ({ ...p, _cat: 'web', _idx: i }))
      : ECOM_PROJECTS.map((p, i) => ({ ...p, _cat: 'ecommerce', _idx: i }));

  return (
    <>
      <SEO
        title="أعمالنا"
        description="+40 مشروع أنجزناه في 5 دول — مواقع شركات، متاجر إلكترونية، وأنظمة مخصصة بأحدث التقنيات."
      />
      {/* HERO */}
      <section className="hero hero-inner">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-wrap">
            <div className="hero-content reveal is-visible">
              <div className="hero-tag">
                <span className="badge">+120 مشروع</span>
                مصر · السعودية · الإمارات
              </div>
              <h1>
                <span className="line">قصص <span className="word-3d">نجاح</span> حقيقية</span>
                <span className="line">ساهمنا في <span className="word-teal">كتابتها</span></span>
              </h1>
              <p className="hero-lede">
                مجموعة مختارة من المشاريع اللي اشتغلنا عليها — من مواقع شركات، لمتاجر إلكترونية، لهويات بصرية متكاملة في قطاعات مختلفة.
              </p>
              <div className="hero-stats-mini">
                <div><strong>+40</strong><span>مشروع منجز</span></div>
                <div><strong>+12</strong><span>سنة خبرة</span></div>
                <div><strong>5</strong><span>دول</span></div>
              </div>
            </div>
            <div className="hero-visual reveal is-visible">
              <div className="work-stack">
                <div className="work-stack-card s1">
                  <div className="ws-tag">WEB · صيدلاني</div>
                  <div className="ws-title">Drug Pharma</div>
                  <div className="ws-meta">Laravel · 31 منتج · AR/EN</div>
                </div>
                <div className="work-stack-card s2">
                  <div className="ws-tag">BRANDING · حكومي</div>
                  <div className="ws-title">منافع — الطائف</div>
                  <div className="ws-meta">2.4M م² · رؤية 2030</div>
                </div>
                <div className="work-stack-card s3">
                  <div className="ws-tag">ECOM · هاردوير</div>
                  <div className="ws-title">Bakkah Store</div>
                  <div className="ws-meta">+3,400 منتج · WooCommerce</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORK GRID */}
      <section className="section">
        <div className="container">
          <div className="work-filters reveal is-visible">
            <button
              className={'work-filter' + (filter === 'all' ? ' active' : '')}
              onClick={() => setFilter('all')}
            >جميع الأعمال</button>
            <button
              className={'work-filter' + (filter === 'web' ? ' active' : '')}
              onClick={() => setFilter('web')}
            >المواقع · {WEB_PROJECTS.length}</button>
            <button
              className={'work-filter' + (filter === 'ecommerce' ? ' active' : '')}
              onClick={() => setFilter('ecommerce')}
            >المتاجر · {ECOM_PROJECTS.length}</button>
          </div>

          <div className="work-grid">
            {visible.map((p) => (
              <WorkCard key={p.url} project={p} category={p._cat} index={p._idx} />
            ))}
          </div>

          {/* Behance CTA */}
          <div className="behance-cta reveal is-visible">
            <div className="behance-cta-inner">
              <div>
                <span className="eyebrow">— الهويات البصرية</span>
                <h3>+30 هوية بصرية متكاملة على Behance</h3>
                <p>تشكيلة كاملة من أعمال الهوية البصرية والشعارات والدلائل الإرشادية.</p>
              </div>
              <a href="https://www.behance.net/businespartner" target="_blank" rel="noreferrer" className="btn btn-primary">
                شاهد على Behance <span className="arrow">←</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="section section-light">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow" style={{ color: 'var(--o)' }}>قطاعات نخدمها</span>
            <h2 className="h-section" style={{ marginTop: 20 }}>خبرة في <span className="text-3d">مجالات متنوعة</span></h2>
            <p>كل قطاع له طبيعته الخاصة — اشتغلنا في كتير منهم وفاهمين تفاصيلهم.</p>
          </div>
          <div className="chip-grid">
            {[
              ['💊', 'صيدلاني وطبي'],
              ['🏗️', 'مقاولات وهندسة'],
              ['🛍️', 'تجارة إلكترونية'],
              ['🏘️', 'عقارات'],
              ['⚡', 'تكنولوجيا'],
              ['✈️', 'سياحة وطيران'],
              ['🏛️', 'حكومي وبلديات'],
              ['🎓', 'تعليم وتدريب'],
            ].map(([icon, label]) => (
              <div key={label} className="chip">
                <span className="chip-icon">{icon}</span>
                <strong>{label}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container cta-banner-inner">
          <div className="reveal is-visible">
            <h2>عاوز مشروعك يكون <span className="ko">التالي</span> في القائمة؟</h2>
            <p>تواصل معانا، وهنحوّل فكرتك لمنتج رقمي ناجح.</p>
            <Link to="/contact" className="btn btn-dark">احكيلنا عن مشروعك <span className="arrow">←</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}
