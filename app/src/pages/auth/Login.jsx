import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || null;

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      const dest = from || (
        user.role === 'admin' ? '/admin'
        : user.role === 'developer' ? '/dev'
        : '/dashboard'
      );
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-brand-purple-deep">
      {/* Bg pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-brand-purple opacity-30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-brand-orange opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="block text-center mb-8 group">
          <div className="inline-block">
            <div className="font-display font-black text-4xl text-white">
              <span className="text-brand-orange italic">BSN</span>
            </div>
            <div className="text-white opacity-70 text-sm font-mono tracking-widest mt-1">
              شريك الأعمال
            </div>
          </div>
        </Link>

        <div className="card text-right">
          <div className="mb-6">
            <span className="eyebrow text-brand-orange">— تسجيل دخول</span>
            <h1 className="text-2xl font-display font-black text-brand-ink mt-2">
              أهلاً <span className="text-brand-orange">بيك تاني</span>
            </h1>
            <p className="text-sm opacity-70 mt-1">سجّل دخولك للوصول لمشاريعك</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-purple pointer-events-none z-10" size={18} />
                <input
                  type="email"
                  dir="ltr"
                  placeholder="you@example.com"
                  className="field text-left"
                  style={{ paddingRight: '2.75rem', paddingLeft: '1rem' }}
                  {...register('email', { required: 'البريد مطلوب' })}
                />
              </div>
              {errors.email && <p className="text-brand-orange text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">كلمة المرور</label>
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
                  placeholder="••••••••"
                  className="field"
                  style={{ paddingRight: '2.75rem', paddingLeft: '2.75rem' }}
                  {...register('password', { required: 'كلمة المرور مطلوبة' })}
                />
              </div>
              {errors.password && <p className="text-brand-orange text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-bold text-brand-purple hover:text-brand-orange">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {isSubmitting ? 'جاري الدخول...' : 'دخول'}
              <span>←</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-brand-ink/10 text-center text-sm">
            <span className="opacity-70">لسه ما عندكش حساب؟ </span>
            <Link to="/register" className="text-brand-orange font-bold hover:underline">
              أنشئ حساب جديد
            </Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 text-center text-white text-xs font-mono opacity-60 space-y-1">
          <div>Demo accounts (password = "password"):</div>
          <div>amr@bp-eg.com (admin) · dev@bp-eg.com (dev) · client@example.com (user)</div>
        </div>
      </div>
    </div>
  );
}
