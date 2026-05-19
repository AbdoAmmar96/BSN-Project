import { useState } from 'react';
import { X, Send, LifeBuoy } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/api/chat';
import toast from 'react-hot-toast';

export default function NewTicketDialog({ open, onClose, onCreated }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: () => chatApi.supportTicket(subject.trim(), body.trim()),
    onSuccess: ({ room }) => {
      qc.invalidateQueries({ queryKey: ['chat', 'rooms'] });
      toast.success('تم فتح التذكرة');
      setSubject('');
      setBody('');
      onCreated?.(room);
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'فشل فتح التذكرة');
    },
  });

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    create.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white text-brand-ink rounded-2xl border-2 border-brand-ink shadow-brutal overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-brand-ink bg-brand-cream">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-orange text-white rounded-lg border-2 border-brand-ink flex items-center justify-center">
              <LifeBuoy size={18} />
            </div>
            <h3 className="font-display font-black text-lg">تذكرة تواصل جديدة</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand-ink/10"
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">الموضوع</label>
            <input
              type="text"
              maxLength={120}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: عاوز استفسار عن خدمة المتاجر"
              className="field"
              required
            />
          </div>

          <div>
            <label className="label">التفاصيل</label>
            <textarea
              rows={5}
              maxLength={5000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="اكتب تفاصيل طلبك أو استفسارك..."
              className="field"
              required
            />
            <div className="text-[10px] font-mono opacity-50 mt-1 text-left">
              {body.length}/5000
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={create.isPending || !subject.trim() || !body.trim()}
              className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <Send size={16} /> {create.isPending ? 'جاري الإرسال...' : 'افتح التذكرة'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-white text-brand-ink font-display font-black text-sm px-5 py-2.5 rounded-full border-2 border-brand-ink shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
