import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import PageHeader from '@/components/dashboard/PageHeader';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: '', email: '', password: '', role: 'user',
      phone: '', company: '', position: '', bio: '', is_active: true,
    },
  });

  const { data: existing } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => usersApi.show(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing?.user) {
      reset({
        name: existing.user.name,
        email: existing.user.email,
        role: existing.user.role,
        phone: existing.user.phone || '',
        company: existing.user.company || '',
        position: existing.user.position || '',
        bio: existing.user.bio || '',
        is_active: existing.user.is_active,
        password: '',
      });
    }
  }, [existing, reset]);

  const mut = useMutation({
    mutationFn: (data) => {
      if (!data.password) delete data.password;
      return isEdit ? usersApi.update(id, data) : usersApi.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(isEdit ? 'تم التحديث' : 'تم الإنشاء');
      navigate('/admin/users');
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach(e => toast.error(e));
      else toast.error(err.response?.data?.message || 'حصل خطأ');
    },
  });

  return (
    <div>
      <PageHeader
        eyebrow={isEdit ? 'EDIT USER' : 'NEW USER'}
        title={isEdit ? 'تعديل المستخدم' : 'مستخدم جديد'}
        backTo="/admin/users"
      />

      <form
        onSubmit={handleSubmit((d) => mut.mutate(d))}
        className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-6 shadow-brutal max-w-3xl"
      >
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">الاسم *</label>
              <input className="field" {...register('name', { required: 'الاسم مطلوب' })} />
              {errors.name && <p className="text-brand-orange text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">البريد *</label>
              <input type="email" className="field text-left" dir="ltr"
                {...register('email', { required: 'البريد مطلوب' })} />
              {errors.email && <p className="text-brand-orange text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{isEdit ? 'كلمة المرور (اختياري)' : 'كلمة المرور *'}</label>
              <input type="password" className="field"
                placeholder={isEdit ? 'اتركها فاضية للإبقاء على الحالية' : ''}
                {...register('password', isEdit ? {} : { required: 'مطلوبة', minLength: 8 })} />
              {errors.password && <p className="text-brand-orange text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">الدور *</label>
              <select className="field" {...register('role', { required: true })}>
                <option value="user">عميل</option>
                <option value="developer">مطور</option>
                <option value="admin">أدمن</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">الموبايل</label>
              <input className="field text-left" dir="ltr" {...register('phone')} />
            </div>
            <div>
              <label className="label">الشركة</label>
              <input className="field" {...register('company')} />
            </div>
          </div>

          <div>
            <label className="label">المنصب</label>
            <input className="field" {...register('position')} />
          </div>

          <div>
            <label className="label">نبذة</label>
            <textarea className="field" rows={3} {...register('bio')} />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-brand-orange" {...register('is_active')} />
              <span className="font-bold">الحساب نشط</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-brand-ink/10">
          <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
            <Save size={16} /> {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button type="button" onClick={() => navigate('/admin/users')} className="btn-ghost">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
