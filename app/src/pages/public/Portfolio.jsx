import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { portfolioApi } from '@/api/portfolio';
import SEO from '@/components/SEO';

// Color rotation
const TONES = ['tone-purple', 'tone-orange', 'tone-teal', 'tone-ink'];

// Short label shown on the thumbnail = first word of the title.
const labelOf = (p) => (p.title || '').split(' ')[0];

function screenshotUrl(siteUrl) {
  // Free service that captures a site screenshot — used when no image was uploaded.
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(siteUrl)}?w=640&h=400`;
}

function WorkCard({ project, index }) {
  const tone = TONES[index % TONES.length];
  // Uploaded screenshot wins; otherwise auto-capture the live site.
  const img = project.image_url || screenshotUrl(project.url);
  return (
    <a href={project.url} target="_blank" rel="noreferrer" className="work-card reveal is-visible" data-category={project.category}>
      <div className={'work-thumb ' + tone}>
        <img
          src={img}
          alt={project.title}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <span>{labelOf(project)}</span>
      </div>
      <div className="work-body">
        {project.tag && <span className="work-tag">{project.tag}</span>}
        <h3>{project.title}</h3>
        {project.company_ar && <p>{project.company_ar}</p>}
        {Array.isArray(project.tech) && project.tech.length > 0 && (
          <div className="work-tech">
            {project.tech.map((t) => <span key={t} className="work-tech-pill">{t}</span>)}
          </div>
        )}
      </div>
    </a>
  );
}

export default function Portfolio() {
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['portfolio', 'public'],
    queryFn: () => portfolioApi.list(),
    staleTime: 60_000,
  });
  const works = data?.data || [];
  const webCount = works.filter((p) => p.category === 'web').length;
  const ecomCount = works.filter((p) => p.category === 'ecommerce').length;

  const visible = (filter === 'all' ? works : works.filter((p) => p.category === filter))
    .map((p, i) => ({ ...p, _idx: i }));

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
            >المواقع · {webCount}</button>
            <button
              className={'work-filter' + (filter === 'ecommerce' ? ' active' : '')}
              onClick={() => setFilter('ecommerce')}
            >المتاجر · {ecomCount}</button>
          </div>

          <div className="work-grid">
            {isLoading && works.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="work-card" style={{ minHeight: 280, opacity: 0.4 }} />
                ))
              : visible.map((p) => (
                  <WorkCard key={p.id} project={p} index={p._idx} />
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
