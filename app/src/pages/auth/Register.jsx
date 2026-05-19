import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        phone: data.phone,
        company: data.company,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'خطأ في التسجيل';
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach(e => toast.error(e));
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-brand-purple-deep">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-brand-purple opacity-30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-brand-orange opacity-20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <Link to="/" className="block text-center mb-8">
          <div className="font-display font-black text-4xl text-white">
            <span className="text-brand-orange italic">BSN</span>
          </div>
          <div className="text-white opacity-70 text-sm font-mono mt-1">شريك الأعمال</div>
        </Link>

        <div className="card text-right">
          <div className="mb-6">
            <span className="eyebrow text-brand-orange">— حساب جديد</span>
            <h1 className="text-2xl font-display font-black text-brand-ink mt-2">
              ابدأ <span className="text-brand-orange">رحلتك</span> معانا
            </h1>
            <p className="text-sm opacity-70 mt-1">سجّل في دقيقتين وابدأ تتابع مشاريعك</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">الاسم الكامل *</label>
              <input type="text" placeholder="محمد أحمد" className="field"
                {...register('name', { required: 'الاسم مطلوب', minLength: { value: 2, message: 'اسم قصير جداً' } })} />
              {errors.name && <p className="text-brand-orange text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">البريد *</label>
                <input type="email" dir="ltr" placeholder="you@example.com" className="field text-left"
                  {...register('email', { required: 'البريد مطلوب' })} />
                {errors.email && <p className="text-brand-orange text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">رقم الموبايل</label>
                <input type="tel" dir="ltr" placeholder="0100..." className="field text-left"
                  {...register('phone')} />
              </div>
            </div>

            <div>
              <label className="label">الشركة (اختياري)</label>
              <input type="text" placeholder="اسم الشركة" className="field"
                {...register('company')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">كلمة المرور *</label>
                <input type="password" placeholder="••••••••" className="field"
                  {...register('password', { required: 'كلمة المرور مطلوبة', minLength: { value: 8, message: '8 أحرف على الأقل' } })} />
                {errors.password && <p className="text-brand-orange text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">تأكيد كلمة المرور *</label>
                <input type="password" placeholder="••••••••" className="field"
                  {...register('password_confirmation', {
                    required: 'مطلوب',
                    validate: v => v === watch('password') || 'كلمات المرور مش متطابقة'
                  })} />
                {errors.password_confirmation && <p className="text-brand-orange text-xs mt-1">{errors.password_confirmation.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center disabled:opacity-60">
              {isSubmitting ? 'جاري إنشاء الحساب...' : 'سجّل دلوقتي'}
              <span>←</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-brand-ink/10 text-center text-sm">
            <span className="opacity-70">عندك حساب؟ </span>
            <Link to="/login" className="text-brand-orange font-bold hover:underline">سجّل دخول</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
