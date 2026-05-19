/**
 * Hero (inner page variant).
 * Mirrors the .hero.hero-inner pattern from the BSN brand CSS.
 *
 * Props:
 *  badge       - small text in the rounded tag (e.g. "خدماتنا")
 *  tagLabel    - longer text next to badge
 *  title       - ReactNode  (use <span className="word-3d"> for emphasis words)
 *  lede        - subtitle/description paragraph
 *  actions     - row of buttons (use <a className="btn btn-primary">)
 *  meta        - array of {value, label} for the hero-meta row
 *  visual      - ReactNode for the right-side visual (cubes, illustration)
 */
export default function Hero({ badge, tagLabel, title, lede, actions, meta, visual }) {
  return (
    <section className={'hero' + (visual ? ' hero-inner' : ' hero-inner')}>
      <div className="hero-bg"></div>
      <div className="container">
        <div className="hero-wrap">
          <div className="hero-content reveal is-visible">
            {(badge || tagLabel) && (
              <div className="hero-tag">
                {badge && <span className="badge">{badge}</span>}
                {tagLabel}
              </div>
            )}

            <h1>{title}</h1>

            {lede && <p className="hero-lede">{lede}</p>}

            {actions && <div className="hero-actions">{actions}</div>}

            {meta && meta.length > 0 && (
              <div className="hero-meta">
                {meta.map((m, i) => (
                  <div key={i} className="hero-meta-item">
                    <strong>{m.value}</strong>
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {visual && (
            <div className="hero-visual reveal is-visible">
              {visual}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
