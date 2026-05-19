/**
 * Team + company info
 */

export const FOUNDERS = [
  {
    name: 'م. وليد شلبي',
    role: 'المؤسس · المدير التقني',
    bio: 'مهندس بخبرة هندسية متقدمة، بيقود الفريق التقني ويشرف على معايير الجودة في كل مشروع.',
    initial: 'و',
    // Note: founder photos will be added as static assets later
  },
  {
    name: 'م. عمرو شلبي',
    role: 'المؤسس · مدير العمليات',
    bio: 'بيدير العمليات والعلاقات مع العملاء، وبيحرص إن كل مشروع يتسلّم في الميعاد وبالجودة المتفق عليها.',
    initial: 'ع',
  },
];

export const VALUES = [
  { num: '01', title: 'الجودة قبل كل شيء',     desc: 'مش بنطلق مشروع غير لما يكون جاهز فعلاً — حتى لو دا معناه التأخير شوية.' },
  { num: '02', title: 'الشفافية الكاملة',       desc: 'مفيش حاجة مخفية — في الأسعار، الـ timeline، أو الـ scope. كله واضح من البداية.' },
  { num: '03', title: 'الاستثمار في العلاقة',   desc: 'العميل مش عملية بيع، ده شريك طويل المدى. علاقتنا بتكبر مع وقت.' },
  { num: '04', title: 'الإتقان التقني',          desc: 'كود نظيف، وثائق، اختبارات — مش بس "بيشتغل"، لازم يكون مبني صح.' },
  { num: '05', title: 'الفهم العميق للأعمال',   desc: 'مش بنبيع تكنولوجيا، بنحل مشكلة بيزنس. ده الفرق بين الـ vendor والشريك.' },
  { num: '06', title: 'التطور المستمر',         desc: 'بنتعلم كل يوم، نجرّب أدوات جديدة، نطوّر نفسنا عشان نقدّم أحسن.' },
];

export const TIMELINE = [
  { year: '2014', title: 'البداية', desc: 'انطلقنا في القاهرة كفريق صغير من مهندسين شغوفين.' },
  { year: '2017', title: 'التوسّع', desc: 'أول مشروع كبير لشركة عقارية — وبدأنا نكوّن فريق متكامل.' },
  { year: '2020', title: 'تأسيس الشركة', desc: 'تأسيس شركة شريك الأعمال لتقنية المعلومات بشكل رسمي.' },
  { year: '2022', title: 'الانطلاق الخليجي', desc: 'أول عميل سعودي — West Gate Construction. بدأنا نخدم 5 دول.' },
  { year: '2025', title: 'النضج المؤسسي', desc: 'فريق متخصص، +40 مشروع، وتقنيات متقدمة (Laravel, React, Cloud).' },
];

export const STATS = [
  { value: '+12', label: 'سنة من الخبرة التقنية', suffix: '' },
  { value: '+40', label: 'مشروع منجز', suffix: '+' },
  { value: '5',   label: 'دول · مصر · الخليج', suffix: '' },
  { value: '97',  label: 'معدل رضا العملاء', suffix: '%' },
];

// Contact details (from bp-eg.com)
export const CONTACT = {
  salesPhone: '+20 150 015 6690',
  salesPhoneRaw: '+201500156690',
  techPhone: '+20 106 875 8847',
  techPhoneRaw: '+201068758847',
  email: 'hello@bp-eg.com',
  whatsapp: 'https://wa.me/201500156690',
  behance: 'https://behance.net/businespartner',
  address: 'مصر — المنوفية — بركة السبع — مول الجابري — الدور الثاني — مكتب 12',
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3450.0!2d30.93!3d30.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDM5JzAwLjAiTiAzMMKwNTUnNDguMCJF!5e0!3m2!1sar!2seg!4v1700000000000!5m2!1sar!2seg',
  workingHours: {
    weekdays: 'السبت — الخميس: 10:00 ص — 7:00 م',
    friday: 'الجمعة: مغلق',
  },
};
