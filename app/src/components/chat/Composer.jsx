import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

/**
 * Message composer — text + file attachment.
 *
 * Props:
 *   onSend(body, file?)        - called when user sends
 *   onTyping(isTyping)         - debounced typing indicator
 *   disabled                    - bool
 *   replyTo                     - {sender, body} - shows reply preview if set
 *   onCancelReply               - clears reply context
 */
export default function Composer({ onSend, onTyping, disabled, replyTo, onCancelReply }) {
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);
  const typingTimer = useRef(null);
  const inputRef = useRef(null);

  // Focus input on mount + when replyTo changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [replyTo]);

  // Typing indicator (debounced)
  useEffect(() => {
    if (!body) return;
    onTyping?.(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => onTyping?.(false), 2000);
    return () => typingTimer.current && clearTimeout(typingTimer.current);
  }, [body, onTyping]);

  const canSend = !disabled && (body.trim().length > 0 || file);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!canSend) return;
    const text = body.trim();
    const f = file;
    setBody('');
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
    await onSend(text, f);
  };

  const handleKeyDown = (e) => {
    // Enter to send, Shift+Enter for newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const filePreviewIsImage = file && file.type.startsWith('image/');

  return (
    <div className="border-t-2 border-brand-ink/10 bg-white text-brand-ink px-3 pt-3 pb-3">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center justify-between gap-2 mb-2 bg-brand-purple/10 border-r-2 border-brand-purple rounded-lg px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-brand-purple">رد على {replyTo.sender?.name}</div>
            <div className="text-xs opacity-70 truncate">{replyTo.body}</div>
          </div>
          <button onClick={onCancelReply} className="p-1 rounded hover:bg-brand-ink/10">
            <X size={14} />
          </button>
        </div>
      )}

      {/* File preview */}
      {file && (
        <div className="flex items-center gap-3 mb-2 bg-brand-teal/15 border-2 border-brand-teal/30 rounded-xl p-2">
          {filePreviewIsImage ? (
            <img src={URL.createObjectURL(file)} alt="" className="w-12 h-12 rounded-lg object-cover border-2 border-brand-ink" />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-brand-teal text-brand-purple-deep border-2 border-brand-ink flex items-center justify-center">
              <Paperclip size={20} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">{file.name}</div>
            <div className="text-xs opacity-60 font-mono">{(file.size / 1024).toFixed(1)} KB</div>
          </div>
          <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
            className="p-1.5 rounded-full hover:bg-red-100 text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="p-2.5 rounded-xl border-2 border-brand-ink/15 hover:border-brand-orange hover:bg-brand-orange/10 transition disabled:opacity-50"
          title="إرفاق صورة"
        >
          <ImageIcon size={18} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files[0] || null;
            if (f && !f.type.startsWith('image/')) {
              e.target.value = '';
              return;
            }
            setFile(f);
          }}
        />

        <textarea
          ref={inputRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="اكتب رسالتك..."
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-brand-ink/15 focus:border-brand-orange focus:outline-none resize-none max-h-32 text-sm"
          style={{ minHeight: '42px' }}
        />

        <button
          type="submit"
          disabled={!canSend}
          className={clsx(
            'p-2.5 rounded-xl border-[2.5px] transition',
            canSend
              ? 'bg-brand-orange text-white border-brand-ink shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5'
              : 'bg-gray-100 border-brand-ink/15 text-gray-400 cursor-not-allowed'
          )}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
