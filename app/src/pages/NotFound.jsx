import { Link } from 'react-router-dom';
import { Home, ArrowRight, Search } from 'lucide-react';
import SEO from '@/components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO
        title="الصفحة غير موجودة — 404"
        description="الصفحة اللي بتدوّر عليها مش موجودة. ارجع للرئيسية أو شوف باقي خدماتنا."
      />
      <section className="hero hero-inner" style={{ minHeight: '70vh' }}>
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-content reveal is-visible" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div
              className="font-display font-black"
              style={{
                fontSize: 'clamp(96px, 22vw, 220px)',
                lineHeight: 0.9,
                background: 'linear-gradient(135deg, #F15A24 0%, #65C8D0 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 8,
              }}
            >
              404
            </div>

            <h1 style={{ marginBottom: 12 }}>
              <span className="line">ضعت <span className="word-3d">في الطريق</span></span>
            </h1>

            <p className="hero-lede" style={{ marginInline: 'auto', maxWidth: 520 }}>
              الصفحة اللي بتدوّر عليها مش موجودة أو اتنقلت. تقدر ترجع للرئيسية أو تتواصل معانا.
            </p>

            <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 28 }}>
              <Link to="/" className="btn btn-primary">
                <Home size={16} /> الرئيسية <span className="arrow">←</span>
              </Link>
              <Link to="/services" className="btn btn-ghost">
                <Search size={16} /> شوف خدماتنا
              </Link>
            </div>

            <div style={{ marginTop: 36, opacity: 0.6, fontFamily: 'var(--f-mono)', fontSize: 12 }}>
              <ArrowRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> رمز الخطأ: 404 NOT_FOUND
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
