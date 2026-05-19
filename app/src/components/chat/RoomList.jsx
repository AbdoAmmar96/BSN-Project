import { useMemo, useState } from 'react';
import { Search, MessageSquarePlus, Briefcase, User as UserIcon, LifeBuoy, Plus } from 'lucide-react';
import clsx from 'clsx';

/**
 * Sidebar list of chat rooms.
 *
 * Props:
 *   rooms:    Array
 *   activeId: number | null
 *   onSelect: (room) => void
 *   loading:  bool
 */
export default function RoomList({ rooms = [], activeId, onSelect, loading, onNewTicket }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return rooms;
    const q = search.toLowerCase();
    return rooms.filter(r => r.name?.toLowerCase().includes(q));
  }, [rooms, search]);

  return (
    <div className="flex flex-col h-full bg-brand-purple-deep border-l-2 border-brand-orange">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-black text-xl">المحادثات</h2>
          {onNewTicket && (
            <button
              type="button"
              onClick={onNewTicket}
              className="inline-flex items-center gap-1.5 bg-brand-orange text-white font-bold text-xs px-3 py-1.5 rounded-full border-2 border-white shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
            >
              <Plus size={14} /> تذكرة جديدة
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث..."
            className="w-full pr-10 py-2 px-3 rounded-xl bg-white/5 border-2 border-white/10 focus:border-brand-orange focus:outline-none text-sm text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-center py-8 text-white/60 text-sm font-mono">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-white/60">
            <MessageSquarePlus className="mx-auto mb-3" size={32} />
            <p className="text-sm mb-4">مفيش محادثات لسه</p>
            {onNewTicket && (
              <button
                type="button"
                onClick={onNewTicket}
                className="inline-flex items-center gap-2 bg-brand-orange text-white font-display font-black text-xs px-4 py-2 rounded-full border-2 border-white shadow-brutal-sm hover:-translate-y-0.5 transition-transform"
              >
                <LifeBuoy size={14} /> ابدأ تذكرة تواصل
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelect(room)}
                className={clsx(
                  'w-full text-right p-2.5 rounded-xl transition flex items-start gap-3 border-2',
                  activeId === room.id
                    ? 'bg-brand-orange text-white border-white shadow-brutal-sm'
                    : 'bg-white/5 border-transparent hover:bg-white/10'
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {room.avatar ? (
                    <img
                      src={room.avatar}
                      alt={room.name}
                      className="w-11 h-11 rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div className={clsx(
                      'w-11 h-11 rounded-full border-2 border-white flex items-center justify-center',
                      room.type === 'project' ? 'bg-brand-teal text-brand-purple-deep'
                      : room.type === 'support' ? 'bg-brand-orange text-white'
                      : 'bg-brand-purple text-white'
                    )}>
                      {room.type === 'project' ? <Briefcase size={18} />
                       : room.type === 'support' ? <LifeBuoy size={18} />
                       : <UserIcon size={18} />}
                    </div>
                  )}
                  {room.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-brand-orange border-2 border-brand-purple-deep text-white text-[10px] font-black flex items-center justify-center px-1">
                      {room.unread_count > 99 ? '99' : room.unread_count}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm truncate">{room.name}</div>
                    {room.last_message && (
                      <span className="text-[10px] opacity-60 font-mono whitespace-nowrap">
                        {formatTime(room.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  {room.last_message ? (
                    <div className="text-xs opacity-70 truncate mt-0.5">
                      {room.last_message.type === 'image' && '📷 صورة'}
                      {room.last_message.type === 'file' && '📎 ملف'}
                      {room.last_message.type === 'text' && room.last_message.body}
                    </div>
                  ) : (
                    <div className="text-xs opacity-50 truncate mt-0.5 italic">— ابدأ المحادثة —</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  }
  const days = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (days < 7) return `${days} ي`;
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
}
