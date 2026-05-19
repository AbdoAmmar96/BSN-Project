import { useState } from 'react';
import toast from 'react-hot-toast';
import SEO from '@/components/SEO';
import { contactApi } from '@/api/contact';
import { contactSchema } from '@/lib/schemas';

const FAQS = [
  ['قد إيه ميزانية المشاريع اللي بتشتغلوا عليها؟', 'بنشتغل على مشاريع بميزانيات متنوعة، من مواقع صغيرة لشركات ناشئة لحد أنظمة متكاملة. أفضل طريقة تعرف هي إنك تتواصل معانا وتحكيلنا عن مشروعك، وهنقدّملك عرض سعر مفصّل ومناسب.'],
  ['المشروع بياخد قد إيه وقت؟', 'بيختلف حسب حجم المشروع وتعقيده. متوسط الوقت: موقع تعريفي 2-3 أسابيع، متجر إلكتروني 4-6 أسابيع، هوية بصرية 2-4 أسابيع. هنحطّ معاك جدول زمني واضح من اليوم الأول.'],
  ['إيه طريقة الدفع؟ وفيه دفعات؟', 'عادةً بنقسّم المشروع لدفعتين أو تلاتة حسب حجمه. عربون (40%) لما توافق، دفعة منتصف (30%) عند تسليم التصاميم، ونهائية (30%) عند التسليم. بنقبل تحويل بنكي، فيزا، باي بال، وفودافون كاش.'],
  ['هل بتقدّموا دعم فني بعد التسليم؟', 'طبعًا، كل مشروع بيشمل فترة دعم مجانية لمدة شهر بعد التسليم لإصلاح أي مشاكل. كمان عندنا باقات صيانة شهرية وسنوية للعملاء اللي عاوزين دعم مستمر، تحديثات، وحماية.'],
  ['بتشتغلوا مع عملاء برّه مصر؟', 'أكيد. عملاؤنا في مصر، السعودية، الإمارات، الكويت، وقطر. بنشتغل عن بُعد بكفاءة عالية، ومع اجتماعات أونلاين دورية مع الفريق.'],
  ['هل الكود ملكي بعد التسليم؟', 'طبعًا. أنت بتمتلك ملكية كاملة للكود، التصاميم، والمحتوى بعد سداد المستحقات. بنسلّمك كل الملفات المصدرية، حسابات الاستضافة، الدومين، وأي اشتراكات تابعة للمشروع.'],
];

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const fname = (fd.get('fname') || '').toString().trim();
    const lname = (fd.get('lname') || '').toString().trim();
    const service = (fd.get('service') || '').toString();
    const budget = (fd.get('budget') || '').toString();
    const subjectParts = [service, budget].filter(Boolean).join(' · ');

    const payload = {
      name: [fname, lname].filter(Boolean).join(' '),
      email: (fd.get('email') || '').toString().trim(),
      phone: (fd.get('phone') || '').toString().trim() || '',
      subject: subjectParts || '',
      message: (fd.get('message') || '').toString().trim(),
    };

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || 'تأكد من بيانات النموذج');
      return;
    }

    setSubmitting(true);
    try {
      await contactApi.send({
        ...parsed.data,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject || null,
        source: 'contact_page',
        website: (fd.get('website') || '').toString(), // honeypot
      });
      toast.success('تم إرسال الرسالة! هنرجعلك خلال 24 ساعة.');
      form.reset();
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.message
        || Object.values(data?.errors || {}).flat()[0]
        || 'حصل خطأ، حاول تاني';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="تواصل معنا"
        description="عاوز تبدأ مشروع أو عندك سؤال؟ تواصل مع فريق BSN — متوسط الرد خلال 24 ساعة، على الواتساب أو البريد."
      />
      {/* HERO */}
      <section className="hero hero-inner">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="hero-wrap">
            <div className="hero-content reveal is-visible">
              <div className="hero-tag">
                <span className="badge">24h</span>
                نرد على كل الرسائل خلال 24 ساعة
              </div>
              <h1><span className="line">خلّينا <span className="word-3d">نسمعك</span></span></h1>
              <p className="hero-lede">احكيلنا عن مشروعك، استفسارك، أو حتى مجرد فكرة. هنرد عليك بسرعة، وبصراحة.</p>
              <div className="contact-quick">
                <a href="https://wa.me/201500156690" className="cq-pill cq-wa" target="_blank" rel="noreferrer">
                  <span className="cq-ico">💬</span>
                  <span>واتساب · أسرع رد</span>
                </a>
                <a href="mailto:hello@bp-eg.com" className="cq-pill">
                  <span className="cq-ico">✉️</span>
                  <span>hello@bp-eg.com</span>
                </a>
              </div>
            </div>
            <div className="hero-visual reveal is-visible">
              <div className="contact-float">
                <div className="cf-card cf-msg">
                  <div className="cf-msg-head">
                    <div className="cf-avatar">ش</div>
                    <div>
                      <div className="cf-name">شريك الأعمال</div>
                      <div className="cf-status">● Online · يرد الآن</div>
                    </div>
                  </div>
                  <div className="cf-bubble cf-bubble-them">أهلاً! إزاي نقدر نساعدك في مشروعك؟</div>
                  <div className="cf-bubble cf-bubble-me">عايز موقع لشركتي</div>
                  <div className="cf-bubble cf-bubble-them cf-typing"><span></span><span></span><span></span></div>
                </div>
                <div className="cf-stat-pill cf-pin">
                  <span className="cf-pin-ico">📍</span>
                  <div><strong>المنوفية</strong><span>بركة السبع · مول الجابري</span></div>
                </div>
                <div className="cf-stat-pill cf-time">
                  <span className="cf-pin-ico">⏱</span>
                  <div><strong>&lt; 24h</strong><span>متوسط الرد</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORM + CONTACT SIDE */}
      <section className="section section-tight">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form reveal is-visible">
              <h3>ابعتلنا رسالة</h3>
              <p className="form-sub">املأ النموذج وهنتواصل معاك في أقرب وقت ممكن.</p>
              <form onSubmit={onSubmit}>
                {/* Honeypot: invisible to humans, bots fill it */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                  style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                  aria-hidden="true"
                />
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fname">الاسم الأول *</label>
                    <input type="text" id="fname" name="fname" required placeholder="محمد" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lname">اسم العائلة</label>
                    <input type="text" id="lname" name="lname" placeholder="أحمد" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">البريد الإلكتروني *</label>
                    <input type="email" id="email" name="email" required placeholder="you@example.com" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">رقم الجوال *</label>
                    <input type="tel" id="phone" name="phone" required placeholder="0100 000 0000" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="service">نوع الخدمة</label>
                  <select id="service" name="service">
                    <option value="">اختر الخدمة...</option>
                    <option value="web">تصميم موقع</option>
                    <option value="ecommerce">متجر إلكتروني</option>
                    <option value="branding">هوية بصرية</option>
                    <option value="marketing">تسويق رقمي</option>
                    <option value="app">تطبيق موبايل</option>
                    <option value="other">شيء آخر</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="budget">الميزانية التقديرية</label>
                  <select id="budget" name="budget">
                    <option value="">اختر الفئة...</option>
                    <option>أقل من 5,000 جنيه</option>
                    <option>5,000 – 15,000 جنيه</option>
                    <option>15,000 – 50,000 جنيه</option>
                    <option>أكتر من 50,000 جنيه</option>
                    <option>نتفاهم سوا</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="message">احكيلنا عن مشروعك *</label>
                  <textarea id="message" name="message" required placeholder="اكتب فكرتك، أهدافك، أو أي تفاصيل تساعدنا نفهم احتياجك..." />
                </div>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'جاري الإرسال...' : 'إرسال الرسالة'} <span className="arrow">←</span>
                </button>
              </form>
            </div>

            <div className="contact-side reveal is-visible">
              <div className="contact-card">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>قسم المبيعات</h4>
                  <a href="tel:+201500156690">+20 150 015 6690</a>
                  <p style={{ fontSize: 12, opacity: 0.7, fontFamily: 'var(--f-mono)', marginTop: 4 }}>للاستفسارات وعروض الأسعار</p>
                </div>
              </div>
              <div className="contact-card">
                <div className="contact-icon">🛠</div>
                <div>
                  <h4>الدعم الفني</h4>
                  <a href="tel:+201068758847">+20 106 875 8847</a>
                  <p style={{ fontSize: 12, opacity: 0.7, fontFamily: 'var(--f-mono)', marginTop: 4 }}>للعملاء الحاليين والصيانة</p>
                </div>
              </div>
              <div className="contact-card">
                <div className="contact-icon">✉️</div>
                <div>
                  <h4>البريد الإلكتروني</h4>
                  <a href="mailto:hello@bp-eg.com">hello@bp-eg.com</a>
                  <a href="https://bp-eg.com" target="_blank" rel="noreferrer">bp-eg.com</a>
                </div>
              </div>
              <div className="contact-card">
                <div className="contact-icon">📍</div>
                <div>
                  <h4>المقر الرئيسي</h4>
                  <p>مصر — المنوفية</p>
                  <p>بركة السبع · مول الجابري</p>
                  <p>الدور الثاني · مكتب 12</p>
                </div>
              </div>
              <a href="https://wa.me/201500156690" target="_blank" rel="noreferrer" className="whatsapp-card">
                <div className="wa-icon">W</div>
                <div>
                  <h4>واتساب — متواجدون الآن</h4>
                  <p>كلّمنا على الواتساب لرد فوري</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* OFFICE STRIP */}
      <section className="section section-teal section-tight">
        <div className="container">
          <div className="office-strip" style={{ color: 'var(--p-deep)' }}>
            <div className="office-cell reveal is-visible">
              <span className="ico">⏰</span>
              <strong>ساعات العمل</strong>
              <p>السبت – الخميس · 10 ص – 7 م</p>
            </div>
            <div className="office-cell reveal is-visible">
              <span className="ico">⚡</span>
              <strong>سرعة الرد</strong>
              <p>خلال 24 ساعة على كل الرسائل</p>
            </div>
            <div className="office-cell reveal is-visible">
              <span className="ico">🎁</span>
              <strong>استشارة مجانية</strong>
              <p>30 دقيقة · بدون أي التزام</p>
            </div>
            <div className="office-cell reveal is-visible">
              <span className="ico">🌍</span>
              <strong>نخدم 5 دول</strong>
              <p>مصر · السعودية · الإمارات · قطر · الكويت</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAP */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal is-visible" style={{ textAlign: 'center' }}>
            <span className="eyebrow">— تفضل بزيارة مقرنا الرئيسي</span>
            <h2 className="h-section" style={{ marginTop: 20 }}>يسعدنا <span className="text-3d teal-base">استقبالكم</span></h2>
            <p>يسعدنا استقبالكم في مقر الشركة لمناقشة مشاريعكم وتطلعاتكم.</p>
          </div>
          <div className="map-wrap reveal is-visible">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d429.1167876516732!2d31.085681905503595!3d30.635809082337506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f7dbe97cbdde61%3A0x3cb786da5de557fa!2z2YXZgtmE2Ycg2KfZhNis2KfYqNix2Yk!5e0!3m2!1sar!2seg!4v1768522280243!5m2!1sar!2seg"
              width="100%"
              height="420"
              style={{ border: '2.5px solid var(--ink)', borderRadius: 16, boxShadow: '8px 8px 0 var(--p)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="BSN office location"
            />
            <div className="map-address-card">
              <span className="map-pin-ico">📍</span>
              <strong>موقعنا</strong>
              <p>مصر — المنوفية<br />بركة السبع — مول الجابري<br />الدور الثاني — مكتب 12</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-head reveal is-visible">
            <span className="eyebrow" style={{ color: 'var(--o)' }}>أسئلة شائعة</span>
            <h2 className="h-section" style={{ marginTop: 20 }}>يمكن إجابتك <span className="text-3d teal-base">هنا</span></h2>
            <p>أكتر الأسئلة اللي بنسمعها من العملاء قبل ما يبدأوا.</p>
          </div>
          <div className="faq-list">
            {FAQS.map(([q, a], i) => (
              <details key={i} className="faq-item reveal is-visible">
                <summary>{q} <span className="plus">+</span></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
