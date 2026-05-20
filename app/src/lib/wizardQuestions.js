/**
 * Smart Q&A definitions for the custom-quote wizard (Path B). Questions are
 * keyed by service type; each has an id, an Arabic label, and answer options.
 * The collected answers are sent as `smart_answers` on the lead.
 */
export const WIZARD_QUESTIONS = {
  web: [
    { id: 'pages', label: 'الموقع كام صفحة؟', options: ['صفحة واحدة', 'متعدّد الصفحات', 'مش متأكد'] },
    { id: 'language', label: 'بأي لغة؟', options: ['عربي', 'إنجليزي', 'الاثنين'] },
    { id: 'cms', label: 'محتاج لوحة تحكم تعدّل بيها المحتوى؟', options: ['أيوة', 'لأ', 'مش متأكد'] },
    { id: 'design', label: 'عندك تصميم جاهز؟', options: ['أيوة', 'لأ، محتاج تصميم'] },
    { id: 'features', label: 'محتاج مميزات خاصة؟', options: ['SEO', 'حجوزات', 'مدوّنة', 'لا شيء محدد'] },
  ],
  ecommerce: [
    { id: 'products', label: 'عدد المنتجات تقريباً؟', options: ['أقل من 50', '50–500', 'أكثر من 500'] },
    { id: 'payments', label: 'محتاج بوابات دفع؟', options: ['كروت', 'محافظ', 'فوري', 'الكل'] },
    { id: 'shipping', label: 'تكامل مع شركات شحن؟', options: ['أيوة', 'لأ'] },
    { id: 'multivendor', label: 'متعدد البائعين؟', options: ['أيوة', 'لأ'] },
    { id: 'loyalty', label: 'برنامج ولاء/نقاط؟', options: ['أيوة', 'لأ'] },
  ],
  branding: [
    { id: 'scope', label: 'محتاج إيه بالظبط؟', options: ['لوجو فقط', 'هوية كاملة', 'تحديث هوية موجودة'] },
    { id: 'existing', label: 'عندك هوية حالية؟', options: ['أيوة', 'لأ'] },
    { id: 'print', label: 'محتاج مطبوعات؟', options: ['أيوة', 'لأ'] },
    { id: 'social', label: 'محتاج قوالب سوشيال؟', options: ['أيوة', 'لأ'] },
  ],
  marketing: [
    { id: 'platforms', label: 'أنهي منصّات؟', options: ['Facebook/Instagram', 'Google', 'TikTok', 'الكل'] },
    { id: 'budget', label: 'الميزانية الشهرية المتوقعة؟', options: ['أقل من 5K', '5K–20K', 'أكثر من 20K'] },
    { id: 'goal', label: 'الهدف الأساسي؟', options: ['مبيعات', 'وعي بالعلامة', 'متابعين'] },
    { id: 'content', label: 'محتاج إنتاج محتوى؟', options: ['أيوة', 'لأ، عندي محتوى'] },
  ],
  other: [
    { id: 'summary', label: 'اوصف مشروعك باختصار', options: [] },
  ],
};

export const SERVICE_OPTIONS = [
  { value: 'web', label: 'تطوير المواقع', icon: '🌐' },
  { value: 'ecommerce', label: 'المتاجر الإلكترونية', icon: '🛒' },
  { value: 'branding', label: 'الهوية البصرية', icon: '🎨' },
  { value: 'marketing', label: 'التسويق الرقمي', icon: '📈' },
  { value: 'other', label: 'حاجة تانية', icon: '✨' },
];
