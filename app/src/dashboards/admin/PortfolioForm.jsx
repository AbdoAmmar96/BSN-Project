import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Save, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminPortfolioApi } from '@/api/portfolio';

const screenshotUrl = (url) =>
  url ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=400&h=260` : null;

export default function PortfolioForm({ work, onClose, onSaved }) {
  const isEdit = !!work;

  const [form, setForm] = useState({
    title: work?.title || '',
    company_ar: work?.company_ar || '',
    url: work?.url || '',
    tag: work?.tag || '',
    description: work?.description || '',
    tech: (work?.tech || []).join(', '),
    category: work?.category || 'web',
    sort_order: work?.sort_order ?? 0,
    is_active: work?.is_active ?? true,
  });
  const [file, setFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Local object URL preview of a freshly picked file; else the existing upload; else auto screenshot.
  const filePreview = file ? URL.createObjectURL(file) : null;
  const preview = filePreview || (!removeImage && work?.image_url) || screenshotUrl(form.url);

  const save = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('company_ar', form.company_ar || '');
      fd.append('url', form.url);
      fd.append('tag', form.tag || '');
      fd.append('description', form.description || '');
      fd.append('category', form.category);
      fd.append('sort_order', Number(form.sort_order) || 0);
      fd.append('is_active', form.is_active ? '1' : '0');
      const tech = form.tech.split(',').map((t) => t.trim()).filter(Boolean);
      fd.append('tech', JSON.stringify(tech));
      if (file) fd.append('image', file);
      if (removeImage && !file) fd.append('remove_image', '1');
      return isEdit ? adminPortfolioApi.update(work.id, fd) : adminPortfolioApi.create(fd);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'تم تحديث العمل' : 'تم إضافة العمل');
      onSaved();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'فشل الحفظ'),
  });

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error('الملف لازم يكون صورة'); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error('أقصى حجم 5 ميجا'); return; }
    setFile(f);
    setRemoveImage(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 md:pt-24 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white text-brand-ink rounded-2xl border-2 border-brand-ink shadow-brutal mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-ink bg-brand-cream">
          <h3 className="font-display font-black text-lg">{isEdit ? `تعديل: ${work.title}` : 'عمل جديد'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-brand-ink/10" aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="p-5 space-y-4">
          {/* Image */}
          <div>
            <label className="label">صورة العمل (اختياري)</label>
            <div className="flex items-start gap-3">
              <div className="w-40 shrink-0 aspect-[16/10] rounded-xl border-2 border-brand-ink/15 bg-brand-ink/5 overflow-hidden">
                {preview && (
                  <img src={preview} alt="معاينة" className="w-full h-full object-cover object-top"
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 bg-white !text-brand-ink font-bold text-xs px-3 py-2 rounded-lg border-2 border-brand-ink cursor-pointer hover:bg-brand-ink/5">
                  <Upload size={14} /> رفع صورة
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
                </label>
                {(work?.image_url && !removeImage && !file) && (
                  <button type="button" onClick={() => setRemoveImage(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800">
                    <Trash2 size={12} /> حذف الصورة الحالية
                  </button>
                )}
                <p className="text-[11px] text-brand-ink/55 leading-relaxed">
                  لو ما رفعتش صورة، هنعرض لقطة شاشة تلقائية من اللينك. (حد أقصى 5 ميجا)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">العنوان *</label>
              <input type="text" className="field" required value={form.title}
                onChange={(e) => setField('title', e.target.value)} placeholder="مثال: Al Amein" />
            </div>
            <div>
              <label className="label">اسم الشركة (عربي)</label>
              <input type="text" className="field" value={form.company_ar}
                onChange={(e) => setField('company_ar', e.target.value)} placeholder="شركة الأمين لتصدير الكيماويات" />
            </div>
          </div>

          <div>
            <label className="label">رابط الموقع *</label>
            <input type="url" className="field text-left" dir="ltr" required value={form.url}
              onChange={(e) => setField('url', e.target.value)} placeholder="https://example.com/" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">القسم</label>
              <select className="field" value={form.category} onChange={(e) => setField('category', e.target.value)}>
                <option value="web">المواقع</option>
                <option value="ecommerce">المتاجر</option>
              </select>
            </div>
            <div>
              <label className="label">الوسم (Tag)</label>
              <input type="text" className="field" value={form.tag}
                onChange={(e) => setField('tag', e.target.value)} placeholder="موقع · كيماويات" />
            </div>
          </div>

          <div>
            <label className="label">التقنيات (افصل بفاصلة)</label>
            <input type="text" className="field text-left" dir="ltr" value={form.tech}
              onChange={(e) => setField('tech', e.target.value)} placeholder="React, Laravel" />
          </div>

          <div>
            <label className="label">وصف مختصر</label>
            <textarea className="field" rows={2} value={form.description}
              onChange={(e) => setField('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="label">ترتيب</label>
              <input type="number" className="field text-left" dir="ltr" value={form.sort_order}
                onChange={(e) => setField('sort_order', e.target.value)} />
            </div>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setField('is_active', e.target.checked)} />
              <span className="text-sm font-bold">نشط (يظهر للعملاء)</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-brand-ink/10">
            <button type="submit" disabled={save.isPending} className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform disabled:opacity-60">
              <Save size={16} /> {save.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 bg-white !text-brand-ink font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
