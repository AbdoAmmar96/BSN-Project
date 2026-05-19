/**
 * Animated marquee strip.
 *
 * Props:
 *  items: Array of strings or { text, variant?: 'default'|'teal'|'orange'|'outline' }
 */
export default function Marquee({ items = [] }) {
  // Double for seamless loop
  const all = [...items, ...items];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {all.map((item, i) => {
          const text = typeof item === 'string' ? item : item.text;
          const variant = typeof item === 'object' ? item.variant : 'default';
          const cls = 'marquee-item' + (variant && variant !== 'default' ? ` ${variant}` : '');
          return (
            <span key={i} className={cls}>
              {text}
              <span className="star"></span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
