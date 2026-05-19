import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi, INVOICE_STATUS } from '@/api/invoices';
import { usersApi } from '@/api/users';
import { projectsApi } from '@/api/projects';
import PageHeader from '@/components/dashboard/PageHeader';
import { Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InvoiceForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      project_id: '',
      user_id: '',
      currency: 'EGP',
      tax: 0,
      discount: 0,
      items: [{ description: '', quantity: 1, price: 0 }],
      issued_at: new Date().toISOString().split('T')[0],
      due_at: '',
      notes: '',
      status: 'draft',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const items = watch('items');
  const tax = Number(watch('tax')) || 0;
  const discount = Number(watch('discount')) || 0;
  const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity) * Number(it.price) || 0), 0);
  const total = subtotal + tax - discount;

  // Load existing for edit
  const { data: existing } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.show(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing?.invoice) {
      const inv = existing.invoice;
      reset({
        project_id: inv.project_id,
        user_id: inv.user_id,
        currency: inv.currency,
        tax: inv.tax,
        discount: inv.discount,
        items: inv.items || [{ description: '', quantity: 1, price: 0 }],
        issued_at: inv.issued_at?.split('T')[0] || '',
        due_at: inv.due_at?.split('T')[0] || '',
        notes: inv.notes || '',
        status: inv.status,
      });
    }
  }, [existing, reset]);

  // Users + projects for dropdowns
  const { data: clientsData } = useQuery({
    queryKey: ['admin', 'users', { role: 'user' }],
    queryFn: () => usersApi.list({ role: 'user', per_page: 100 }),
  });
  const { data: projectsData } = useQuery({
    queryKey: ['admin', 'projects-list'],
    queryFn: () => projectsApi.list({ per_page: 100 }),
  });
  const clients = clientsData?.data?.data || [];
  const projects = projectsData?.data?.data || [];

  const mut = useMutation({
    mutationFn: (data) => {
      // Clean items
      data.items = data.items.filter(i => i.description && i.quantity && i.price);
      return isEdit ? invoicesApi.update(id, data) : invoicesApi.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'invoices'] });
      toast.success(isEdit ? 'تم التحديث' : 'تم إصدار الفاتورة');
      navigate('/admin/invoices');
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
        eyebrow={isEdit ? 'EDIT INVOICE' : 'NEW INVOICE'}
        title={isEdit ? 'تعديل الفاتورة' : 'فاتورة جديدة'}
        backTo="/admin/invoices"
      />

      <form
        onSubmit={handleSubmit((d) => mut.mutate(d))}
        className="bg-white text-brand-ink rounded-2xl border-[2.5px] border-brand-ink p-6 shadow-brutal max-w-4xl space-y-5"
      >
        {/* Client + Project */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">العميل *</label>
            <select className="field" disabled={isEdit} {...register('user_id', { required: true })}>
              <option value="">— اختار عميل —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.company && `(${c.company})`}</option>)}
            </select>
          </div>
          <div>
            <label className="label">المشروع *</label>
            <select className="field" disabled={isEdit} {...register('project_id', { required: true })}>
              <option value="">— اختار مشروع —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">البنود *</label>
            <button
              type="button"
              onClick={() => append({ description: '', quantity: 1, price: 0 })}
              className="text-sm font-bold text-brand-orange hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> بند جديد
            </button>
          </div>

          <div className="space-y-2">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                <input
                  className="field col-span-6 text-sm"
                  placeholder="الوصف"
                  {...register(`items.${idx}.description`, { required: true })}
                />
                <input
                  type="number"
                  step="0.01"
                  className="field col-span-2 text-center text-sm"
                  dir="ltr"
                  placeholder="العدد"
                  {...register(`items.${idx}.quantity`, { required: true, valueAsNumber: true })}
                />
                <input
                  type="number"
                  step="0.01"
                  className="field col-span-3 text-center text-sm"
                  dir="ltr"
                  placeholder="السعر"
                  {...register(`items.${idx}.price`, { required: true, valueAsNumber: true })}
                />
                <button
                  type="button"
                  onClick={() => fields.length > 1 && remove(idx)}
                  className="col-span-1 p-2 rounded-lg hover:bg-red-100 text-red-600 disabled:opacity-30"
                  disabled={fields.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">الضريبة</label>
            <input type="number" step="0.01" className="field text-left" dir="ltr"
              {...register('tax', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="label">الخصم</label>
            <input type="number" step="0.01" className="field text-left" dir="ltr"
              {...register('discount', { valueAsNumber: true })} />
          </div>
        </div>

        <div className="bg-brand-purple/5 rounded-xl border-2 border-brand-ink/10 p-4 space-y-2">
          <div className="flex justify-between text-sm"><span>الإجمالي الفرعي</span><span className="font-mono">{subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>الضريبة</span><span className="font-mono">+ {tax.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span>الخصم</span><span className="font-mono">− {discount.toLocaleString()}</span></div>
          <div className="flex justify-between font-display font-black text-xl pt-2 border-t-2 border-brand-ink/20">
            <span>الإجمالي</span>
            <span className="text-brand-orange">{total.toLocaleString()} {watch('currency')}</span>
          </div>
        </div>

        {/* Dates + status */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">تاريخ الإصدار</label>
            <input type="date" className="field text-left" dir="ltr" {...register('issued_at')} />
          </div>
          <div>
            <label className="label">تاريخ الاستحقاق</label>
            <input type="date" className="field text-left" dir="ltr" {...register('due_at')} />
          </div>
          <div>
            <label className="label">العملة</label>
            <select className="field" {...register('currency')}>
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
              <option value="SAR">SAR</option>
            </select>
          </div>
        </div>

        {isEdit && (
          <div>
            <label className="label">الحالة</label>
            <select className="field" {...register('status')}>
              {Object.entries(INVOICE_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        )}

        <div>
          <label className="label">ملاحظات</label>
          <textarea className="field" rows={2} {...register('notes')} />
        </div>

        <div className="flex gap-3 pt-5 border-t border-brand-ink/10">
          <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
            <Save size={16} /> {isSubmitting ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
          </button>
          <button type="button" onClick={() => navigate('/admin/invoices')} className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform">إلغاء</button>
        </div>
      </form>
    </div>
  );
}
