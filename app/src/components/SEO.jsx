import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'شريك الأعمال — BSN';
const DEFAULT_DESC = 'شريك الأعمال (BSN) — تصميم وتطوير المواقع، المتاجر الإلكترونية، الهوية البصرية، والتسويق الرقمي. شريكك الاستراتيجي للتحول الرقمي في مصر والسعودية والخليج.';
const DEFAULT_IMAGE = '/og-default.png';

export default function SEO({ title, description, image, type = 'website', url }) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESC;
  const ogImage = image || DEFAULT_IMAGE;
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={ogImage} />
      {pageUrl && <meta property="og:url" content={pageUrl} />}
      <meta property="og:locale" content="ar_EG" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={ogImage} />

      <link rel="canonical" href={pageUrl} />
    </Helmet>
  );
}
