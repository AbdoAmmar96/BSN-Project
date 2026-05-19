/**
 * Section heading — eyebrow + title + optional desc.
 * Uses the brand .section-head pattern.
 *
 * Props:
 *  eyebrow      - small mono-font label
 *  eyebrowColor - 'orange' | 'purple' | 'teal' | inherit
 *  title        - ReactNode (use <span className="text-3d"> for emphasis)
 *  desc         - description
 *  textColor    - optional inline color override (used inside light sections)
 */
export default function SectionHead({ eyebrow, eyebrowColor, title, desc, textColor }) {
  const eyebrowStyle = eyebrowColor === 'orange' ? { color: 'var(--o)' }
                     : eyebrowColor === 'purple' ? { color: 'var(--p)' }
                     : eyebrowColor === 'teal'   ? { color: 'var(--t)' }
                     : eyebrowColor === 'ink'    ? { color: 'var(--ink)' }
                     : undefined;

  return (
    <div className="section-head reveal is-visible">
      {eyebrow && <span className="eyebrow" style={eyebrowStyle}>{eyebrow}</span>}
      <h2 className="h-section" style={{ marginTop: 20, ...(textColor ? { color: textColor } : {}) }}>
        {title}
      </h2>
      {desc && <p style={textColor ? { color: textColor } : undefined}>{desc}</p>}
    </div>
  );
}
