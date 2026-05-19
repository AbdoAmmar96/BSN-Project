/**
 * Services + tech stacks + features
 */

export const SERVICES = [
  {
    id: 'web',
    slug: 'service-web',
    tag: '01',
    name: 'تصميم وتطوير المواقع',
    short: 'من landing page بسيطة لنظام إدارة محتوى متكامل',
    description: 'مواقع سريعة، آمنة، متجاوبة، ومُحسّنة للسيو من اليوم الأول. بنبني على Laravel + Vite + React/Next.js عشان كود نظيف وقابل للتطوير على المدى الطويل.',
    icon: '⚡',
    color: 'orange',
    features: [
      'Laravel 11 + Vite',
      'React / Next.js',
      'دعم كامل عربي/إنجليزي (RTL/LTR)',
      'لوحة تحكم احترافية',
      'SEO تقني من اليوم الأول',
      'استضافة + دومين أول سنة',
      'شهر دعم مجاني بعد التسليم',
      'تدريب على إدارة الموقع',
    ],
    techBadges: ['Laravel 11', 'Vite', 'Next.js', 'React', 'Tailwind', 'MySQL'],
    tiers: [
      { tier: 'landing', label: 'Landing Page', price: '8,500', priceNote: 'EGP', period: 'دفعة واحدة', highlight: false,
        items: ['صفحة واحدة احترافية', 'فورم تواصل مع WhatsApp', 'SEO أساسي', 'تصميم متجاوب', 'تسليم في 7 أيام'] },
      { tier: 'multipage_pro', label: 'Multi-page Pro', price: '22,000', priceNote: 'EGP', period: 'دفعة واحدة', highlight: true,
        items: ['حتى 8 صفحات', 'لوحة تحكم احترافية', 'SEO + Google Analytics', 'تصميم مخصّص لهويتك', 'صور احترافية', 'استضافة + دومين سنة', 'شهر دعم مجاني'] },
      { tier: 'enterprise', label: 'Enterprise', price: 'من 45,000', priceNote: 'EGP', period: 'حسب الـ Scope', highlight: false,
        items: ['عدد صفحات غير محدود', 'نظام إدارة محتوى متقدم', 'تكاملات API', 'لوحة تحكم متعددة الأدوار', 'تحسينات أداء متقدمة', '3 شهور دعم', 'تدريب الفريق'] },
    ],
  },

  {
    id: 'ecommerce',
    slug: 'service-ecommerce',
    tag: '02',
    name: 'المتاجر الإلكترونية',
    short: 'متاجر متكاملة مع بوابات دفع محلية',
    description: 'متجر إلكتروني كامل مع كل اللي محتاجه: بوابات دفع محلية (فوري، Paymob، Kashier)، شحن، إدارة مخزون، تقارير مبيعات. متجر يبيع من أول يوم.',
    icon: '🛒',
    color: 'teal',
    features: [
      'WooCommerce / Shopify / Custom',
      'بوابات دفع محلية وعالمية',
      'حساب شحن أوتوماتيكي',
      'إدارة مخزون متقدمة',
      'تقارير مبيعات + تحليلات',
      'تكامل مع Facebook/Instagram',
      'تحسين معدل التحويل',
      'دعم متعدد العملات',
    ],
    techBadges: ['WooCommerce', 'Shopify', 'Laravel', 'Paymob', 'Fawry', 'Kashier'],
    tiers: [
      { tier: 'starter', label: 'Starter', price: '18,000', priceNote: 'EGP', period: 'دفعة واحدة', highlight: false,
        items: ['حتى 50 منتج', 'بوابة دفع واحدة', 'حساب شحن أساسي', 'تصميم متجاوب', 'تسليم في 14 يوم'] },
      { tier: 'growth', label: 'Growth', price: '38,000', priceNote: 'EGP', period: 'دفعة واحدة', highlight: true,
        items: ['منتجات غير محدودة', 'كل بوابات الدفع المحلية', 'شحن متقدم + مناطق', 'تقارير ولوحة تحكم', 'تكامل Facebook + Instagram', 'شهر دعم'] },
      { tier: 'enterprise', label: 'Enterprise', price: 'من 70,000', priceNote: 'EGP', period: 'حسب الـ Scope', highlight: false,
        items: ['متجر مخصص بـ Laravel', 'تكاملات ERP/CRM', 'تطبيق موبايل', 'B2B + B2C', 'تقارير متقدمة', '3 شهور دعم'] },
    ],
  },

  {
    id: 'branding',
    slug: 'service-branding',
    tag: '03',
    name: 'الهوية البصرية',
    short: 'هوية تعبّر عنك — مش مجرد لوجو',
    description: 'لوجو، دليل هوية، مطبوعات، وموكاب احترافي بيعكس شخصيتك. هوية بصرية متماسكة تستخدمها في كل مكان، من الموقع لكروت العمل.',
    icon: '🎨',
    color: 'purple',
    features: [
      'لوجو احترافي بنسخ مختلفة',
      'دليل هوية بصرية كامل',
      'باليتة ألوان + Typography',
      'مطبوعات (كارت، Letterhead)',
      'موكاب احترافي للهوية',
      'ملفات Source قابلة للتعديل',
      'دعم لـ Print + Digital',
      'تعديلات غير محدودة في الـ Scope',
    ],
    techBadges: ['Illustrator', 'Photoshop', 'Figma', 'InDesign'],
    tiers: [
      { tier: 'logo', label: 'Logo فقط', price: '3,500', priceNote: 'EGP', period: 'دفعة واحدة', highlight: false,
        items: ['3 concept للاختيار', 'نسخ مختلفة (color, mono, neg)', 'ملفات Source', 'تسليم في 5 أيام'] },
      { tier: 'identity', label: 'Full Identity', price: '9,500', priceNote: 'EGP', period: 'دفعة واحدة', highlight: true,
        items: ['لوجو + 5 concepts', 'دليل هوية كامل (Brand Book)', 'باليتة ألوان + Typography', 'كارت عمل + Letterhead', 'موكاب احترافي', 'ملفات Source'] },
      { tier: 'brand_system', label: 'Brand System', price: 'من 18,000', priceNote: 'EGP', period: 'حسب الـ Scope', highlight: false,
        items: ['كل اللي في Full Identity', 'دليل استخدام شامل', 'مطبوعات إضافية', 'Social Media Templates', 'موكابات متعددة', 'إرشادات Tone of Voice'] },
    ],
  },

  {
    id: 'marketing',
    slug: 'service-marketing',
    tag: '04',
    name: 'التسويق الرقمي',
    short: 'تسويق بيجيب مبيعات — مش بس لايكات',
    description: 'إعلانات ميتا وجوجل، SEO، ومحتوى يجيب عملاء حقيقيين. بنركّز على ROI ومعدل التحويل، مش الـ vanity metrics.',
    icon: '📈',
    color: 'ink',
    features: [
      'حملات Facebook + Instagram',
      'حملات Google Ads',
      'SEO تقني وكتابة محتوى',
      'تحليل وتقارير شهرية',
      'استراتيجية محتوى',
      'تحسين معدل التحويل (CRO)',
      'Email Marketing',
      'متابعة دائمة',
    ],
    techBadges: ['Meta Ads', 'Google Ads', 'GA4', 'Search Console', 'Mailchimp', 'Hotjar'],
    tiers: [
      { tier: 'single', label: 'منصة واحدة', price: '4,500', priceNote: 'EGP / شهر', period: 'شهرياً', highlight: false,
        items: ['Facebook OR Instagram OR Google', 'حتى 5 حملات/شهر', 'تقرير شهري', 'مدير حساب مخصّص'] },
      { tier: 'multi', label: 'Multi-Platform', price: '8,500', priceNote: 'EGP / شهر', period: 'شهرياً', highlight: true,
        items: ['Facebook + Instagram + Google', 'حتى 12 حملة/شهر', 'تقارير أسبوعية', 'استراتيجية محتوى', 'تحسين CRO شهري'] },
      { tier: 'performance', label: 'Performance', price: 'من 15,000', priceNote: 'EGP / شهر', period: 'شهرياً', highlight: false,
        items: ['كل المنصات', 'حملات غير محدودة', 'SEO + Email Marketing', 'A/B Testing مستمر', 'تقارير لحظية', 'فريق متكامل'] },
    ],
  },
];

export const PROCESS_STEPS = [
  { num: '01', title: 'استماع وفهم', desc: 'بنفهم عملك، عميلك، وأهدافك. مفيش حلول بدون فهم.' },
  { num: '02', title: 'استراتيجية', desc: 'بنحط خطة واضحة بـ milestones وtimeline.' },
  { num: '03', title: 'تنفيذ مرحلي', desc: 'بنشتغل على دفعات. كل دفعة بتشوفها وتوافق.' },
  { num: '04', title: 'إطلاق ومتابعة', desc: 'مش بنسلّم وننسى. بنتابع الأداء ونحسّن مستمر.' },
];

export const WHY_US = [
  { icon: '🏆', title: 'خبرة +12 عامًا', desc: 'بنبني مواقع منذ 2014 لشركات في 5 دول.' },
  { icon: '🎯', title: 'حلول متكاملة', desc: 'موقع + هوية + تسويق — كله من فريق واحد.' },
  { icon: '📊', title: 'منهجية استراتيجية', desc: 'مش بس تنفيذ، بل فكر استراتيجي يخدم البيزنس.' },
  { icon: '⚙', title: 'تنفيذ مؤسسي', desc: 'كود نظيف، توثيق، وتسليم بمعايير الشركات الكبيرة.' },
  { icon: '📈', title: 'نتائج قابلة للقياس', desc: 'بنقيس كل حاجة — من الأداء للـ ROI.' },
  { icon: '🤝', title: 'شراكة طويلة المدى', desc: 'عملاؤنا بيرجعوا لأن العلاقة بنبنيها للأبد.' },
];

export const COUNTRIES = [
  { name: 'مصر', flag: '🇪🇬', city: 'القاهرة · المنوفية (HQ)' },
  { name: 'السعودية', flag: '🇸🇦', city: 'الرياض · جدة' },
  { name: 'الإمارات', flag: '🇦🇪', city: 'دبي · أبوظبي' },
  { name: 'قطر', flag: '🇶🇦', city: 'الدوحة' },
  { name: 'الكويت', flag: '🇰🇼', city: 'مدينة الكويت' },
];
