import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '@/api/auth';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { message } = await authApi.forgotPassword(email.trim());
      toast.success(message || 'تم إرسال الرابط');
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {}).flat()[0]
        || 'حصل خطأ، حاول تاني';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-brand-purple-deep">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-brand-purple opacity-30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-brand-orange opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <div className="font-display font-black text-4xl text-white">
            <span className="text-brand-orange italic">BSN</span>
          </div>
          <div className="text-white opacity-70 text-sm font-mono tracking-widest mt-1">
            شريك الأعمال
          </div>
        </Link>

        <div className="card text-right">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center">
                <CheckCircle size={26} className="text-green-600" />
              </div>
              <h1 className="text-xl font-display font-black mb-2">شيك بريدك الإلكتروني</h1>
              <p className="text-sm opacity-70 mb-5">
                لو الإيميل مسجّل عندنا، هتلاقي رابط إعادة الضبط — صالح لمدة 60 دقيقة.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-brand-purple hover:text-brand-orange font-bold text-sm">
                <ArrowLeft size={14} /> ارجع لتسجيل الدخول
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <span className="eyebrow text-brand-orange">— نسيت كلمة المرور</span>
                <h1 className="text-2xl font-display font-black text-brand-ink mt-2">
                  لا تقلق، <span className="text-brand-orange">هنرجّعهالك</span>
                </h1>
                <p className="text-sm opacity-70 mt-1">
                  اكتب بريدك وهنبعتلك رابط لإنشاء كلمة مرور جديدة.
                </p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="label">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple pointer-events-none z-10" size={18} />
                    <input
                      type="email"
                      dir="ltr"
                      required
                      placeholder="you@example.com"
                      className="field text-left"
                      style={{ paddingRight: '2.75rem', paddingLeft: '1rem' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center disabled:opacity-60"
                >
                  {submitting ? 'جاري الإرسال...' : 'ابعت الرابط'}
                  <span>←</span>
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-brand-ink/10 text-center text-sm">
                <Link to="/login" className="text-brand-purple hover:text-brand-orange font-bold inline-flex items-center gap-1">
                  <ArrowLeft size={14} /> رجوع لتسجيل الدخول
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
