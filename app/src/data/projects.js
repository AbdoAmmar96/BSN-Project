/**
 * Real BSN portfolio projects (from bp-eg.com)
 * 32 websites + 9 e-commerce = 41 projects total
 */
export const PROJECTS = [
  // ============ WEB ============
  { url: 'https://nasrconsult.com/',         label: 'Nasr',         tag: 'موقع · كيماويات واستشارات',  category: 'web', tone: 'purple' },
  { url: 'http://al-amein.com/',             label: 'Al Amein',     tag: 'موقع · تصدير زراعي',         category: 'web', tone: 'orange' },
  { url: 'https://saqacapital-llc.com/',     label: 'Saqa',         tag: 'موقع · حلول مالية',          category: 'web', tone: 'teal'   },
  { url: 'https://global-translations.net/', label: 'Global',       tag: 'موقع · ترجمة',               category: 'web', tone: 'ink'    },
  { url: 'https://alebel.com/',              label: 'Alebel',       tag: 'موقع · مجموعة شركات',        category: 'web', tone: 'purple' },
  { url: 'https://gfc-it.com/',              label: 'GFC',          tag: 'موقع · كابلات',              category: 'web', tone: 'orange' },
  { url: 'https://arabengineers-eg.com/',    label: 'Arab Eng',     tag: 'موقع · عقاري',               category: 'web', tone: 'teal'   },
  { url: 'https://dglaviation.net/',         label: 'DGL',          tag: 'موقع · طيران',               category: 'web', tone: 'ink'    },
  { url: 'https://bluewave-group.net/',      label: 'Blue Wave',    tag: 'موقع · بحري',                category: 'web', tone: 'purple' },
  { url: 'https://fema-ms.com/',             label: 'Fema',         tag: 'موقع · بحري',                category: 'web', tone: 'orange' },
  { url: 'https://elgendychemical.com/',     label: 'Elgendy',      tag: 'موقع · كيماويات',            category: 'web', tone: 'teal'   },
  { url: 'https://rozetpump.com/',           label: 'Rozet',        tag: 'موقع · مضخات',               category: 'web', tone: 'ink'    },
  { url: 'https://samadelivery.ae/',         label: 'Sama',         tag: 'موقع · شحن إماراتي',         category: 'web', tone: 'purple' },
  { url: 'https://herbsgarden-eg.com/',      label: 'Herbs',        tag: 'موقع · تصدير زراعي',         category: 'web', tone: 'orange' },
  { url: 'https://westgate.sa/',             label: 'West Gate',    tag: 'موقع · مقاولات سعودية',      category: 'web', tone: 'teal'   },
  { url: 'https://milestone-ltd.com/',       label: 'Milestone',    tag: 'موقع · رخام وجرانيت',        category: 'web', tone: 'ink'    },
  { url: 'https://mm-marinebunker.com/',     label: 'MM Bunker',    tag: 'موقع · وقود بحري',           category: 'web', tone: 'purple' },
  { url: 'https://eg-energy.com/',           label: 'Egy Energy',   tag: 'موقع · طاقة',                category: 'web', tone: 'orange' },
  { url: 'https://namaa.academy/',           label: 'Namaa',        tag: 'منصة · تعليمية',             category: 'web', tone: 'teal'   },
  { url: 'https://scoutacademy-eg.com/',     label: 'Scout',        tag: 'موقع · كشافة',               category: 'web', tone: 'ink'    },
  { url: 'https://aljada20.com/',            label: 'Aljada 20',    tag: 'موقع · إدارة مرافق',         category: 'web', tone: 'purple' },
  { url: 'https://orchardtrade.com/',        label: 'Orchard',      tag: 'موقع · تصدير زراعي',         category: 'web', tone: 'orange' },
  { url: 'https://union-arab.org/',          label: 'Union Arab',   tag: 'موقع · اتحاد دولي',          category: 'web', tone: 'teal'   },
  { url: 'http://ahmedelfattehautopart.com/',label: 'El Fatteh',    tag: 'موقع · قطع غيار',            category: 'web', tone: 'ink'    },
  { url: 'https://innomation.net/',          label: 'Innomation',   tag: 'موقع · أتمتة صناعية',        category: 'web', tone: 'purple' },
  { url: 'https://royal-city-development.com/', label: 'Royal City', tag: 'موقع · استثمار عقاري',     category: 'web', tone: 'orange' },
  { url: 'https://nasseflawfirm.com/',       label: 'Nassef Law',   tag: 'موقع · محاماة',              category: 'web', tone: 'teal'   },
  { url: 'https://deraa-ksa.com/',           label: 'Deraa',        tag: 'موقع · إطفاء وسلامة',        category: 'web', tone: 'ink'    },
  { url: 'https://els-shipping.com/',        label: 'ELS',          tag: 'موقع · لوجستيات',            category: 'web', tone: 'purple' },
  { url: 'https://suzlerpump.com/',          label: 'Suzler',       tag: 'موقع · مضخات',               category: 'web', tone: 'orange' },
  { url: 'https://hotel-spark.com/',         label: 'Hotel Spark',  tag: 'موقع · خدمات نظافة',         category: 'web', tone: 'teal'   },
  { url: 'https://proconsult-eg.com/',       label: 'Pro Consult',  tag: 'موقع · استشارات',            category: 'web', tone: 'ink'    },

  // ============ E-COMMERCE ============
  { url: 'https://maskaany.com/',            label: 'Maskaany',     tag: 'متجر · أثاث',                category: 'ecommerce', tone: 'purple' },
  { url: 'http://maashehaa.com/',            label: 'Maashehaa',    tag: 'متجر · كمبيوتر',             category: 'ecommerce', tone: 'orange' },
  { url: 'http://progressx-eg.com/',         label: 'Progress X',   tag: 'متجر · توزيع',               category: 'ecommerce', tone: 'teal'   },
  { url: 'https://grasse-egy.com/',          label: 'Grasse',       tag: 'متجر · عطور',                category: 'ecommerce', tone: 'ink'    },
  { url: 'http://polatrick.com/',            label: 'Pola Trick',   tag: 'متجر · أدوات منزلية',        category: 'ecommerce', tone: 'purple' },
  { url: 'https://filterconcrete.com/',      label: 'Filter Concrete', tag: 'متجر · فلاتر مياه',       category: 'ecommerce', tone: 'orange' },
  { url: 'https://mkcaffeegypt.com/',        label: 'MK Cafe',      tag: 'متجر · قهوة',                category: 'ecommerce', tone: 'teal'   },
  { url: 'http://bakkah-eg.com/',            label: 'Bakkah',       tag: 'متجر · أدوات منزلية',        category: 'ecommerce', tone: 'ink'    },
  { url: 'https://compairaviationservices.com/', label: 'Comp Air', tag: 'موقع · طيران أمريكي',        category: 'web', tone: 'purple' },
];

export const PROJECT_CATEGORIES = [
  { id: 'all',       label: 'جميع الأعمال', count: PROJECTS.length },
  { id: 'web',       label: 'المواقع',      count: PROJECTS.filter(p => p.category === 'web').length },
  { id: 'ecommerce', label: 'المتاجر',      count: PROJECTS.filter(p => p.category === 'ecommerce').length },
];

// Tone color mappings (matches the brutalist palette)
export const TONE_CLASSES = {
  purple: { bg: 'bg-brand-purple',     text: 'text-white',     border: 'border-brand-ink' },
  orange: { bg: 'bg-brand-orange',     text: 'text-white',     border: 'border-brand-ink' },
  teal:   { bg: 'bg-brand-teal',       text: 'text-brand-ink', border: 'border-brand-ink' },
  ink:    { bg: 'bg-brand-purple-deep', text: 'text-white',    border: 'border-white' },
};
