import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Consistent page header for dashboard pages.
 *
 * Props:
 *   eyebrow:     "USERS / PROJECTS / ..."
 *   title:       "إدارة المستخدمين"
 *   description: optional sub-text
 *   action:      ReactNode  (usually a button: "+ مستخدم جديد")
 *   backTo:      optional path to go back
 */
export default function PageHeader({ eyebrow, title, description, action, backTo }) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          {backTo && (
            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 mb-2 bg-white text-brand-ink font-display font-black text-xs px-3.5 py-1.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
            >
              <ArrowRight size={14} /> رجوع
            </Link>
          )}
          {eyebrow && (
            <span className="block font-mono text-xs tracking-widest text-brand-orange opacity-80 mt-1">
              — {eyebrow}
            </span>
          )}
          <h1 className="font-display font-black text-2xl md:text-3xl mt-1">{title}</h1>
          {description && <p className="text-sm opacity-70 mt-1">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
