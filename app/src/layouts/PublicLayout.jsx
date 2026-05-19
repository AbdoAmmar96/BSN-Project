import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { to: '/',          label: 'الرئيسية' },
  { to: '/services',  label: 'خدماتنا' },
  { to: '/pricing',   label: 'الأسعار' },
  { to: '/portfolio', label: 'أعمالنا' },
  { to: '/about',     label: 'من نحن' },
  { to: '/contact',   label: 'تواصل' },
];

export default function PublicLayout() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const dashboardPath = user?.role === 'admin' ? '/admin'
                      : user?.role === 'developer' ? '/dev'
                      : '/dashboard';

  return (
    <>
      {/* ===== TICKER ===== */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          <span><span className="dot"></span>شريك الأعمال · BUSINESS PARTNER · للتحول الرقمي</span>
          <span className="teal">⬢ DESIGN · DEVELOP · DELIVER</span>
          <span className="orange">★ +12 سنة خبرة · CAIRO × RIYADH × DUBAI</span>
          <span><span className="dot"></span>WEB · E-COMMERCE · BRANDING · MARKETING · SEO</span>
          <span className="teal">⬢ شريكك الاستراتيجي للتحول الرقمي</span>
          <span className="orange">★ +40 PROJECTS · 5 COUNTRIES</span>
          <span><span className="dot"></span>شريك الأعمال · BUSINESS PARTNER · للتحول الرقمي</span>
          <span className="teal">⬢ DESIGN · DEVELOP · DELIVER</span>
          <span className="orange">★ +12 YEARS EXPERIENCE · EG · SA · AE · QA · KW</span>
          <span><span className="dot"></span>WEB · E-COMMERCE · BRANDING · MARKETING · SEO</span>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header className="site-header">
        <div className="container">
          <nav className="nav-row">
            <Link to="/" className="brand">
              <span className="brand-mark">BSN</span>
              <span className="brand-name">
                شريك الأعمال
                <small>BUSINESS PARTNER</small>
              </span>
            </Link>

            <ul className={'nav-links' + (menuOpen ? ' open' : '')}>
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="nav-actions">
              {user ? (
                <Link to={dashboardPath} className="nav-cta">
                  لوحة التحكم <span className="arrow">←</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="nav-login">
                    تسجيل الدخول
                  </Link>
                  <Link to="/contact" className="nav-cta">
                    ابدأ مشروعك <span className="arrow">←</span>
                  </Link>
                </>
              )}
            </div>

            <button
              className={'menu-toggle' + (menuOpen ? ' active' : '')}
              aria-label="القائمة"
              onClick={() => setMenuOpen((s) => !s)}
            >
              <span></span><span></span><span></span>
            </button>
          </nav>
        </div>
      </header>

      {/* ===== MAIN PAGE CONTENT ===== */}
      <main>
        <div className="page active">
          <Outlet />
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="brand-mark" style={{ fontSize: '64px' }}>BSN</div>
              <p>شركة شريك الأعمال لتقنية المعلومات — حلول رقمية متكاملة لأصحاب المشاريع ورواد الأعمال في مصر والسعودية والخليج.</p>
              <div className="footer-socials">
                <a href="https://instagram.com/" aria-label="Instagram">IG</a>
                <a href="https://facebook.com/" aria-label="Facebook">FB</a>
                <a href="https://linkedin.com/" aria-label="LinkedIn">IN</a>
                <a href="https://x.com/" aria-label="X">X</a>
                <a href="https://behance.net/businespartner" aria-label="Behance">BE</a>
              </div>
            </div>

            <div className="footer-col">
              <h5>الشركة</h5>
              <ul>
                <li><Link to="/about">من نحن</Link></li>
                <li><Link to="/portfolio">أعمالنا</Link></li>
                <li><Link to="/services">خدماتنا</Link></li>
                <li><Link to="/contact">تواصل معنا</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>خدماتنا</h5>
              <ul>
                <li><Link to="/service-web">تطوير المواقع</Link></li>
                <li><Link to="/service-ecommerce">المتاجر الإلكترونية</Link></li>
                <li><Link to="/service-branding">الهوية البصرية</Link></li>
                <li><Link to="/service-marketing">التسويق الرقمي</Link></li>
                <li><Link to="/pricing"><strong>الأسعار ←</strong></Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>تواصل</h5>
              <ul style={{ fontFamily: 'var(--f-mono)', fontSize: '13px' }}>
                <li>
                  <strong style={{ fontSize: '11px', opacity: 0.7, letterSpacing: '0.05em' }}>المبيعات</strong><br />
                  <a href="tel:+201500156690" style={{ direction: 'ltr', display: 'inline-block' }}>+20 150 015 6690</a>
                </li>
                <li>
                  <strong style={{ fontSize: '11px', opacity: 0.7, letterSpacing: '0.05em' }}>الدعم الفني</strong><br />
                  <a href="tel:+201068758847" style={{ direction: 'ltr', display: 'inline-block' }}>+20 106 875 8847</a>
                </li>
                <li><a href="mailto:hello@bp-eg.com">hello@bp-eg.com</a></li>
                <li><a href="https://bp-eg.com">bp-eg.com</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© <span>{new Date().getFullYear()}</span> <a href="#">شركة شريك الأعمال لتقنية المعلومات</a>. جميع الحقوق محفوظة.</p>
            <p>© <span>{new Date().getFullYear()}</span> <a href="#">Business Partner for Information Technology</a>. All rights reserved.</p>
          </div>
        </div>
        <div className="footer-mega">BSN</div>
      </footer>
    </>
  );
}
