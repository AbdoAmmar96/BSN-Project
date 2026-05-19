import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsApi } from '@/api/notifications';

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list(),
    refetchInterval: 60_000,
  });

  const items = data?.data || [];
  const unread = data?.unread_count || 0;

  const markAll = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markOne = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `${Math.floor(diff / 60)} د`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
    return d.toLocaleDateString('ar-EG');
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="relative p-2 rounded-lg hover:bg-white/5"
        aria-label="الإشعارات"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-brand-orange rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 bg-white text-brand-ink rounded-xl border-2 border-brand-ink shadow-brutal overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-ink/10 bg-brand-cream">
            <h4 className="font-display font-black text-sm">الإشعارات</h4>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="text-xs font-bold text-brand-purple hover:text-brand-orange flex items-center gap-1"
                disabled={markAll.isPending}
              >
                <CheckCheck size={14} /> اعتبر الكل مقروء
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm opacity-60">
                مفيش إشعارات حالياً
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read_at && markOne.mutate(n.id)}
                  className={`w-full text-right px-4 py-3 border-b border-brand-ink/5 hover:bg-brand-paper transition-colors ${
                    !n.read_at ? 'bg-brand-paper/60' : ''
                  }`}
                >
                  <div className="text-sm font-bold mb-1">
                    {n.data?.title || n.data?.message || n.type}
                  </div>
                  {n.data?.body && (
                    <div className="text-xs opacity-70 line-clamp-2">{n.data.body}</div>
                  )}
                  <div className="text-[10px] font-mono opacity-50 mt-1">
                    {formatTime(n.created_at)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
