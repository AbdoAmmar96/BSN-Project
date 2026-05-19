import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/api/auth';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const invalidLink = !token || !email;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('كلمة المرور لازم تكون 8 حروف على الأقل');
      return;
    }
    if (password !== passwordConfirm) {
      toast.error('كلمة المرور وتأكيدها مش متطابقين');
      return;
    }

    setSubmitting(true);
    try {
      const { message } = await authApi.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirm,
      });
      toast.success(message || 'تم تغيير كلمة المرور');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {}).flat()[0]
        || 'الرابط غير صالح أو منتهي الصلاحية';
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
          {invalidLink ? (
            <div className="text-center py-6">
              <h1 className="text-xl font-display font-black mb-2">رابط غير صالح</h1>
              <p className="text-sm opacity-70 mb-5">
                الرابط ناقص — جرّب تطلب رابط جديد من صفحة "نسيت كلمة المرور".
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm"
              >
                اطلب رابط جديد
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <span className="eyebrow text-brand-orange">— إعادة ضبط كلمة المرور</span>
                <h1 className="text-2xl font-display font-black text-brand-ink mt-2">
                  كلمة <span className="text-brand-orange">مرور جديدة</span>
                </h1>
                <p className="text-sm opacity-70 mt-1 break-all" dir="ltr">{email}</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="label">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple pointer-events-none z-10" size={18} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-purple z-10"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="field"
                      style={{ paddingRight: '2.75rem', paddingLeft: '2.75rem' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">تأكيد كلمة المرور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple pointer-events-none z-10" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="field"
                      style={{ paddingRight: '2.75rem', paddingLeft: '1rem' }}
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full justify-center disabled:opacity-60"
                >
                  {submitting ? 'جاري الحفظ...' : 'تغيير كلمة المرور'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
