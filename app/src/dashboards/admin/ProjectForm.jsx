import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, PROJECT_STATUS, SERVICE_TYPE } from '@/api/projects';
import { usersApi } from '@/api/users';
import PageHeader from '@/components/dashboard/PageHeader';
import { Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      title: '', description: '', service_type: 'web',
      client_id: '', lead_developer_id: '', status: 'pending',
      budget: '', currency: 'EGP', deadline: '', progress: 0,
    },
  });

  // Fetch users to populate selects (clients + developers)
  const { data: clientsData } = useQuery({
    queryKey: ['admin', 'users', { role: 'user' }],
    queryFn: () => usersApi.list({ role: 'user', per_page: 100 }),
  });

  const { data: devsData } = useQuery({
    queryKey: ['admin', 'users', { role: 'developer' }],
    queryFn: () => usersApi.list({ role: 'developer', per_page: 100 }),
  });

  const { data: existing } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.show(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing?.project) {
      const p = existing.project;
      reset({
        title: p.title,
        description: p.description || '',
        service_type: p.service_type,
        client_id: p.client_id,
        lead_developer_id: p.lead_developer_id || '',
        status: p.status,
        budget: p.budget,
        currency: p.currency,
        deadline: p.deadline?.split('T')[0] || '',
        progress: p.progress,
        package_tier: p.package_tier || '',
      });
    }
  }, [existing, reset]);

  const mut = useMutation({
    mutationFn: (data) => {
      // Clean empty strings to null for nullable fields
      if (!data.lead_developer_id) data.lead_developer_id = null;
      if (!data.deadline) data.deadline = null;
      return isEdit ? projectsApi.update(id, data) : projectsApi.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      toast.success(isEdit ? 'تم التحديث' : 'تم الإنشاء');
      navigate('/admin/projects');
    },
    onError: (err) => {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach(e => toast.error(e));
      else toast.error(err.response?.data?.message || 'حصل خطأ');
    },
  });

  const clients = clientsData?.data?.data || [];
  const devs = devsData?.data?.data || [];

  return (
    <div>
      <PageHeader
        eyebrow={isEdit ? 'EDIT PROJECT' : 'NEW PROJECT'}
        title={isEdit ? 'تعديل المشروع' : 'مشروع جديد'}
        backTo="/admin/projects"
      />

      <form
        onSubmit={handleSubmit((d) => mut.mutate(d))}
        className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-6 shadow-brutal max-w-4xl"
      >
        <div className="space-y-4">
          <div>
            <label className="label">عنوان المشروع *</label>
            <input className="field" placeholder="موقع شركة فلانية..."
              {...register('title', { required: 'مطلوب' })} />
            {errors.title && <p className="text-brand-orange text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">الوصف</label>
            <textarea className="field" rows={3} placeholder="تفاصيل المشروع، النطاق، المتطلبات..."
              {...register('description')} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">نوع الخدمة *</label>
              <select className="field" {...register('service_type', { required: true })}>
                {Object.entries(SERVICE_TYPE).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">الباقة (اختياري)</label>
              <input className="field" placeholder="landing, multipage_pro, enterprise..."
                {...register('package_tier')} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">العميل *</label>
              <select className="field" {...register('client_id', { required: 'اختار عميل' })}>
                <option value="">— اختار عميل —</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
              {errors.client_id && <p className="text-brand-orange text-xs mt-1">{errors.client_id.message}</p>}
            </div>
            <div>
              <label className="label">المطور المسؤول</label>
              <select className="field" {...register('lead_developer_id')}>
                <option value="">— غير مسند —</option>
                {devs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">الحالة</label>
              <select className="field" {...register('status')}>
                {Object.entries(PROJECT_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">الميزانية</label>
              <input type="number" step="0.01" className="field text-left" dir="ltr"
                {...register('budget')} />
            </div>
            <div>
              <label className="label">العملة</label>
              <select className="field" {...register('currency')}>
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
            <div>
              <label className="label">التقدّم %</label>
              <input type="number" min="0" max="100" className="field text-left" dir="ltr"
                {...register('progress', { valueAsNumber: true })} />
            </div>
          </div>

          <div>
            <label className="label">موعد التسليم</label>
            <input type="date" className="field text-left" dir="ltr" {...register('deadline')} />
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-brand-ink/10">
          <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
            <Save size={16} /> {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
          </button>
          <button type="button" onClick={() => navigate('/admin/projects')} className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform">
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
