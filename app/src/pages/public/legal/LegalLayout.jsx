import SEO from '@/components/SEO';

/**
 * Shared shell for the static legal pages (Terms / Privacy / Refund).
 * `sections` is an array of { h, body } where `body` is a string or JSX.
 */
export default function LegalLayout({ title, description, updated, intro, sections }) {
  return (
    <>
      <SEO title={title} description={description} />
      <section className="hero hero-inner">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-content reveal is-visible" style={{ maxWidth: 760 }}>
            <div className="hero-tag">
              <span className="badge">قانوني</span>
              {updated && <span>آخر تحديث: {updated}</span>}
            </div>
            <h1><span className="line">{title}</span></h1>
            {intro && <p className="hero-sub">{intro}</p>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="prose-legal" style={{ lineHeight: 1.9 }}>
            {sections.map((s, i) => (
              <div key={i} style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 900, fontSize: '1.35rem', marginBottom: '.75rem' }}>{s.h}</h2>
                <div style={{ opacity: 0.85 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
