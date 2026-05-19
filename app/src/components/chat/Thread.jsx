import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/api/chat';
import { subscribeToChannel } from '@/lib/echo';
import { useAuth } from '@/contexts/AuthContext';
import MessageBubble from './MessageBubble';
import Composer from './Composer';
import { ArrowRight, Users, Briefcase, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

/**
 * Chat thread (right pane) — fetches room, subscribes to live updates, sends messages.
 *
 * Props:
 *   roomId        - active room id
 *   onBack        - mobile: close thread
 */
export default function Thread({ roomId, onBack }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [replyTo, setReplyTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const scrollRef = useRef(null);

  // ============================================
  // Load room + messages
  // ============================================
  const { data, isLoading } = useQuery({
    queryKey: ['chat', 'room', roomId],
    queryFn: () => chatApi.show(roomId),
    enabled: !!roomId,
    refetchInterval: 2_000,
  });

  const room = data?.room;
  const initialMessages = data?.messages || [];
  const [messages, setMessages] = useState([]);

  // Sync messages from query into local state (so we can append live ones)
  useEffect(() => {
    if (initialMessages.length || messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================
  // Subscribe to live events
  // ============================================
  useEffect(() => {
    if (!roomId) return;

    const cleanup = subscribeToChannel(`chat-room.${roomId}`, {
      'message.sent': (event) => {
        setMessages(prev => {
          // Avoid duplicates (our own optimistic message may already be there)
          if (prev.some(m => m.id === event.id)) return prev;
          return [...prev, event];
        });
        // Update the rooms list ordering
        qc.invalidateQueries({ queryKey: ['chat', 'rooms'] });
        // Mark as read since we're viewing
        chatApi.markRead(roomId).catch(() => {});
      },
      'user.typing': (event) => {
        if (event.user_id === user?.id) return;
        setTypingUsers(prev => {
          const without = prev.filter(u => u.id !== event.user_id);
          if (event.is_typing) {
            return [...without, { id: event.user_id, name: event.user_name }];
          }
          return without;
        });
        // Auto-clear after 5s in case "stopped typing" event is lost
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.id !== event.user_id));
        }, 5000);
      },
    });

    return cleanup;
  }, [roomId, user?.id, qc]);

  // ============================================
  // Scroll to bottom on new messages
  // ============================================
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  // ============================================
  // Send message
  // ============================================
  const sendMut = useMutation({
    mutationFn: ({ body, file }) =>
      file
        ? chatApi.sendWithFile(roomId, body, file, replyTo?.id)
        : chatApi.send(roomId, body, replyTo?.id),
    onSuccess: ({ message }) => {
      setMessages(prev => [...prev, message]);
      setReplyTo(null);
      qc.invalidateQueries({ queryKey: ['chat', 'rooms'] });
    },
    onError: (e) => {
      const msg = e.response?.data?.message || e.response?.data?.errors;
      toast.error(typeof msg === 'string' ? msg : 'فشل الإرسال');
    },
  });

  const handleSend = (body, file) => sendMut.mutate({ body, file });
  const handleTyping = (isTyping) => {
    if (!roomId) return;
    chatApi.typing(roomId, isTyping).catch(() => {});
  };

  // ============================================
  // Render
  // ============================================
  if (!roomId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/70">
        <MessageCircle size={64} className="mb-4 opacity-30" />
        <h3 className="font-display font-black text-2xl mb-2">اختار محادثة</h3>
        <p className="opacity-70 text-sm max-w-sm">اضغط على أي محادثة من القائمة للبدء</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Thread header */}
      <header className="bg-brand-ink border-b-2 border-brand-orange p-3 flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="md:hidden p-2 -ms-2 text-white hover:bg-white/10 rounded-lg">
            <ArrowRight size={18} />
          </button>
        )}
        {isLoading ? (
          <div className="text-white/60 font-mono text-sm">جاري التحميل...</div>
        ) : room ? (
          <>
            {room.project ? (
              <div className="w-10 h-10 rounded-xl bg-brand-teal text-brand-purple-deep border-2 border-white flex items-center justify-center">
                <Briefcase size={18} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-brand-purple text-white border-2 border-white flex items-center justify-center">
                <Users size={18} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-display font-black text-white truncate">
                {room.project?.title || room.name || 'محادثة'}
              </div>
              <div className="text-xs text-white/60 flex items-center gap-2">
                <Users size={11} /> {room.users?.length || 0} عضو
                {typingUsers.length > 0 && (
                  <span className="text-brand-orange flex items-center gap-1">
                    · <TypingDots /> {typingUsers.map(u => u.name).join(', ')} بيكتب...
                  </span>
                )}
              </div>
            </div>
          </>
        ) : null}
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-brand-purple-deep/50">
        {isLoading ? (
          <div className="text-center py-8 text-white/60 font-mono text-sm">جاري التحميل...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/60">
            <MessageCircle size={48} className="mb-3 opacity-30" />
            <p className="text-sm">ابدأ المحادثة بأول رسالة!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prev = messages[idx - 1];
            const showSender = !prev || prev.user_id !== msg.user_id;
            return (
              <MessageBubble
                key={msg.id || `tmp-${idx}`}
                message={msg}
                showSender={showSender}
              />
            );
          })
        )}
      </div>

      {/* Composer */}
      <Composer
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={sendMut.isPending}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-0.5">
      <span className="w-1 h-1 rounded-full bg-brand-orange animate-pulse" />
      <span className="w-1 h-1 rounded-full bg-brand-orange animate-pulse" style={{ animationDelay: '0.2s' }} />
      <span className="w-1 h-1 rounded-full bg-brand-orange animate-pulse" style={{ animationDelay: '0.4s' }} />
    </span>
  );
}
