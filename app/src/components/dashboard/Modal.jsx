import { X } from 'lucide-react';
import { useEffect } from 'react';
import clsx from 'clsx';

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8 animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx(
        'relative bg-white text-brand-ink rounded-3xl border-[2.5px] border-brand-ink shadow-brutal-orange w-full max-h-[90vh] overflow-hidden flex flex-col',
        size === 'sm' && 'max-w-md',
        size === 'md' && 'max-w-2xl',
        size === 'lg' && 'max-w-4xl',
        size === 'xl' && 'max-w-6xl',
      )}>
        <div className="flex items-center justify-between p-5 border-b-2 border-brand-ink/10">
          <h3 className="font-display font-black text-xl">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-brand-ink/5 hover:bg-brand-ink/15 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">
          {children}
        </div>
        {footer && (
          <div className="border-t-2 border-brand-ink/10 p-4 bg-brand-purple/5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
