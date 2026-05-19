import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download } from 'lucide-react';
import clsx from 'clsx';

/**
 * Renders a single chat message.
 * Messages from the current user appear on the left (since we're RTL).
 * Messages from others appear on the right.
 */
export default function MessageBubble({ message, showSender = true }) {
  const { user } = useAuth();
  const isMine = message.user_id === user?.id || message.sender?.id === user?.id;

  return (
    <div className={clsx('flex gap-2 mb-2', isMine ? 'flex-row-reverse' : '')}>
      {/* Avatar */}
      {!isMine && showSender && (
        <img
          src={message.sender?.avatar || `https://ui-avatars.com/api/?name=${message.sender?.name}&background=5C15CC&color=fff`}
          alt={message.sender?.name}
          className="w-8 h-8 rounded-full border-2 border-brand-ink object-cover flex-shrink-0"
        />
      )}
      {!isMine && !showSender && <div className="w-8 flex-shrink-0" />}

      {/* Bubble */}
      <div className={clsx('max-w-[75%] flex flex-col', isMine ? 'items-end' : 'items-start')}>
        {!isMine && showSender && (
          <span className="text-xs font-bold opacity-70 mb-0.5">{message.sender?.name}</span>
        )}

        <div className={clsx(
          'px-3 py-2 rounded-2xl border-[2.5px] border-brand-ink',
          isMine
            ? 'bg-brand-orange text-white shadow-brutal-sm rounded-tr-sm'
            : 'bg-white text-brand-ink shadow-brutal-sm rounded-tl-sm'
        )}>
          {/* Reply context */}
          {message.reply_to && (
            <div className={clsx(
              'text-xs px-2 py-1 mb-1 rounded-lg border-r-2',
              isMine ? 'bg-white/20 border-white' : 'bg-brand-purple/10 border-brand-purple'
            )}>
              <div className="font-bold opacity-80">{message.reply_to.sender?.name}</div>
              <div className="opacity-70 truncate">{message.reply_to.body}</div>
            </div>
          )}

          {/* Image attachment */}
          {message.type === 'image' && message.attachment_url && (
            <a href={message.attachment_url} target="_blank" rel="noreferrer" className="block mb-1">
              <img
                src={message.attachment_url}
                alt={message.attachment_name}
                className="max-w-full max-h-64 rounded-xl border-2 border-brand-ink"
              />
            </a>
          )}

          {/* File attachment */}
          {message.type === 'file' && message.attachment_url && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noreferrer"
              className={clsx(
                'flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1 border-2',
                isMine ? 'bg-white/20 border-white text-white' : 'bg-brand-purple/10 border-brand-purple/30'
              )}
            >
              <FileText size={16} />
              <div className="flex-1 min-w-0 text-xs">
                <div className="font-bold truncate">{message.attachment_name}</div>
                <div className="opacity-70">{(message.attachment_size / 1024).toFixed(1)} KB</div>
              </div>
              <Download size={14} />
            </a>
          )}

          {/* Body text */}
          {message.body && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.body}</p>
          )}
        </div>

        {/* Time */}
        <span className="text-[10px] font-mono opacity-50 mt-0.5 px-1">
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'الآن';
  if (diff < 3600) return `${Math.floor(diff / 60)} د`;
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
}
