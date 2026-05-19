import clsx from 'clsx';

export default function Badge({ children, color = 'bg-gray-300 text-gray-700', size = 'sm', dot }) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 rounded-full font-bold border border-brand-ink/20',
      size === 'xs' && 'px-2 py-0.5 text-[10px]',
      size === 'sm' && 'px-2.5 py-1 text-xs',
      size === 'md' && 'px-3 py-1.5 text-sm',
      color
    )}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dot)} />}
      {children}
    </span>
  );
}
