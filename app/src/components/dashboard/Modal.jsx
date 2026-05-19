import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import clsx from 'clsx';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const previousActiveRef = useRef(null);

  // Escape to close + lock background scroll
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

  // Move focus into the dialog on open; restore on close.
  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement;
    const node = dialogRef.current;
    if (!node) return;
    const first = node.querySelector(FOCUSABLE);
    (first || node).focus({ preventScroll: true });

    return () => {
      const prev = previousActiveRef.current;
      if (prev && typeof prev.focus === 'function') prev.focus({ preventScroll: true });
    };
  }, [open]);

  // Tab key trap
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    if (!node) return;
    const onTab = (e) => {
      if (e.key !== 'Tab') return;
      const focusables = Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => !el.hasAttribute('disabled'));
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    node.addEventListener('keydown', onTab);
    return () => node.removeEventListener('keydown', onTab);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-8 animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={clsx(
          'relative bg-white text-brand-ink rounded-3xl border-[2.5px] border-brand-ink shadow-brutal-orange w-full max-h-[90vh] overflow-hidden flex flex-col focus:outline-none',
          size === 'sm' && 'max-w-md',
          size === 'md' && 'max-w-2xl',
          size === 'lg' && 'max-w-4xl',
          size === 'xl' && 'max-w-6xl',
        )}
      >
        <div className="flex items-center justify-between p-5 border-b-2 border-brand-ink/10">
          <h3 id={titleId} className="font-display font-black text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="w-9 h-9 rounded-full bg-brand-ink/5 hover:bg-brand-ink/15 flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-brand-purple"
          >
            <X size={18} aria-hidden="true" />
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
