import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { todayISO } from '@/lib/dates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, SERVICE_TYPE } from '@/api/projects';
import PageHeader from '@/components/dashboard/PageHeader';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserNewProject() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { service_type: 'web', budget: '', currency: 'EGP', title: '', description: '' },
  });

  const mut = useMutation({
    mutationFn: (data) => projectsApi.create(data),
    onSuccess: ({ project }) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success('تم إرسال طلب المشروع! هنرجعلك خلال 24 ساعة.');
      navigate(`/dashboard/projects/${project.id}`);
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
        eyebrow="NEW PROJECT"
        title="ابدأ مشروع جديد"
        description="احكيلنا عن فكرتك وهنرجعلك بعرض مخصص في 24 ساعة"
        backTo="/dashboard/projects"
      />

      <form
        onSubmit={handleSubmit((d) => mut.mutate(d))}
        className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-6 shadow-brutal max-w-3xl"
      >
        <div className="space-y-4">
          <div>
            <label className="label">إيه الخدمة اللي محتاجها؟ *</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {Object.entries(SERVICE_TYPE).filter(([k]) => k !== 'other').map(([k, v]) => (
                <label key={k} className="cursor-pointer">
                  <input type="radio" value={k} className="peer sr-only" {...register('service_type', { required: true })} />
                  <div className="px-3 py-3 rounded-xl border-2 border-brand-ink/15 text-center peer-checked:bg-brand-orange peer-checked:text-white peer-checked:border-brand-ink transition">
                    <div className="text-2xl mb-1">{v.icon}</div>
                    <div className="text-xs font-bold">{v.label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">عنوان المشروع *</label>
            <input className="field" placeholder="موقع لشركتي / متجر إلكتروني / هوية بصرية..."
              {...register('title', { required: 'مطلوب', minLength: { value: 5, message: 'لازم 5 أحرف على الأقل' } })} />
            {errors.title && <p className="text-brand-orange text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">احكيلنا التفاصيل *</label>
            <textarea
              className="field" rows={5}
              placeholder="إيه فكرتك؟ مين العملاء؟ إيه الأهداف؟ في حاجات معينة عاوزها؟"
              {...register('description', { required: 'احكيلنا أكتر', minLength: { value: 30, message: 'تفاصيل قصيرة جداً' } })}
            />
            {errors.description && <p className="text-brand-orange text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" style={{ fontSize: '26px' }}>الميزانية التقديرية</label>
              <div className="flex gap-1">
                <input type="text" inputMode="decimal" className="field flex-1 text-left" dir="ltr"
                  placeholder="15000" {...register('budget', {
                    onChange: (e) => { e.target.value = e.target.value.replace(/[^\d.]/g, ''); },
                  })} />
                <select className="field w-20" {...register('currency')}>
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
                  <option value="SAR">SAR</option>
                </select>
              </div>
              <p className="text-xs opacity-60 mt-1">اختياري — هنرسلك عرض مخصص</p>
            </div>
            <div>
              <label className="label">الموعد المطلوب للتسليم</label>
              <input type="date" className="field text-left" dir="ltr" min={todayISO()} {...register('deadline')} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-brand-ink/10">
          <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
            <Send size={16} /> {isSubmitting ? 'جاري الإرسال...' : 'ابعت الطلب'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/projects')}
            className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
          >
            إلغاء
          </button>
        </div>

        <p className="mt-4 text-xs opacity-60 text-center font-mono">
          هنرد عليك خلال 24 ساعة بعرض سعر مخصص و timeline واضح
        </p>
      </form>
    </div>
  );
}
