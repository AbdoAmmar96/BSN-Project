import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/auth';
import PageHeader from '@/components/dashboard/PageHeader';
import Badge from '@/components/dashboard/Badge';
import { ROLE_LABELS, ROLE_COLORS } from '@/api/users';
import { Save, Lock, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MY ACCOUNT"
        title="حسابي"
        description="عدّل بياناتك الشخصية أو غيّر كلمة المرور"
      />

      {/* User card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl border-[2.5px] border-brand-ink object-cover shadow-brutal-sm"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-black text-2xl">{user?.name}</h2>
            <p className="text-sm opacity-70">{user?.email}</p>
            <div className="mt-2">
              <Badge color={ROLE_COLORS[user?.role]} size="sm">{ROLE_LABELS[user?.role]}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ProfileForm user={user} updateUser={updateUser} />
        <PasswordForm />
      </div>
    </div>
  );
}

// ============================================
function ProfileForm({ user, updateUser }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: user.phone || '',
        company: user.company || '',
        position: user.position || '',
        bio: user.bio || '',
        locale: user.locale || 'ar',
      });
    }
  }, [user, reset]);

  const mut = useMutation({
    mutationFn: (data) => authApi.updateProfile(data),
    onSuccess: ({ user }) => {
      updateUser(user);
      toast.success('تم تحديث البيانات');
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach(e => toast.error(e));
      else toast.error('حصل خطأ');
    },
  });

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <UserIcon className="text-brand-orange" size={20} />
        <h3 className="font-display font-black text-lg">البيانات الشخصية</h3>
      </div>

      <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="space-y-4">
        <div>
          <label className="label">الاسم</label>
          <input className="field" {...register('name', { required: 'مطلوب' })} />
          {errors.name && <p className="text-brand-orange text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">الموبايل</label>
            <input className="field text-left" dir="ltr" {...register('phone')} />
          </div>
          <div>
            <label className="label">اللغة</label>
            <select className="field" {...register('locale')}>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">الشركة</label>
            <input className="field" {...register('company')} />
          </div>
          <div>
            <label className="label">المنصب</label>
            <input className="field" {...register('position')} />
          </div>
        </div>

        <div>
          <label className="label">نبذة</label>
          <textarea className="field" rows={3} {...register('bio')} />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="btn-primary w-full justify-center disabled:opacity-60"
        >
          <Save size={16} /> {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </form>
    </div>
  );
}

// ============================================
function PasswordForm() {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm();

  const mut = useMutation({
    mutationFn: (data) => authApi.changePassword(data),
    onSuccess: () => {
      toast.success('تم تغيير كلمة المرور');
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'حصل خطأ'),
  });

  return (
    <div className="card" style={{ boxShadow: '6px 6px 0 #65C8D0' }}>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="text-brand-teal-deep" size={20} />
        <h3 className="font-display font-black text-lg">كلمة المرور</h3>
      </div>

      <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="space-y-4">
        <div>
          <label className="label">كلمة المرور الحالية *</label>
          <input
            type="password"
            className="field"
            {...register('current_password', { required: 'مطلوبة' })}
          />
          {errors.current_password && <p className="text-brand-orange text-xs mt-1">{errors.current_password.message}</p>}
        </div>

        <div>
          <label className="label">كلمة المرور الجديدة *</label>
          <input
            type="password"
            className="field"
            {...register('password', { required: 'مطلوبة', minLength: { value: 8, message: '8 أحرف على الأقل' } })}
          />
          {errors.password && <p className="text-brand-orange text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label">تأكيد كلمة المرور *</label>
          <input
            type="password"
            className="field"
            {...register('password_confirmation', {
              required: 'مطلوبة',
              validate: v => v === watch('password') || 'مش متطابقة',
            })}
          />
          {errors.password_confirmation && <p className="text-brand-orange text-xs mt-1">{errors.password_confirmation.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center disabled:opacity-60">
          <Lock size={16} /> {isSubmitting ? 'جاري التغيير...' : 'غيّر كلمة المرور'}
        </button>
      </form>
    </div>
  );
}
