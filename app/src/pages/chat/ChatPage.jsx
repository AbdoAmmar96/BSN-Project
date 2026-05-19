import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { chatApi } from '@/api/chat';
import { initEcho } from '@/lib/echo';
import RoomList from '@/components/chat/RoomList';
import Thread from '@/components/chat/Thread';
import NewTicketDialog from '@/components/chat/NewTicketDialog';
import clsx from 'clsx';

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRoom = Number(searchParams.get('room')) || null;
  const [activeRoomId, setActiveRoomId] = useState(initialRoom);
  const [showThread, setShowThread] = useState(!!initialRoom); // mobile state
  const [ticketOpen, setTicketOpen] = useState(false);

  // Initialize Echo on mount
  useEffect(() => {
    initEcho();
  }, []);

  // Load rooms
  const { data, isLoading } = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: () => chatApi.rooms(),
    refetchInterval: 2_000, // refresh rooms list every 2s
  });

  const rooms = data?.data || [];

  // Auto-select first room on desktop
  useEffect(() => {
    if (!activeRoomId && rooms.length > 0 && window.innerWidth >= 768) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  // Sync to URL
  useEffect(() => {
    if (activeRoomId) {
      setSearchParams({ room: activeRoomId }, { replace: true });
    }
  }, [activeRoomId]); // eslint-disable-line

  const handleSelect = (room) => {
    setActiveRoomId(room.id);
    setShowThread(true);
  };

  return (
    <div className="flex bg-brand-purple-deep overflow-hidden border-t-2 border-brand-orange -m-4 lg:-m-8 h-[calc(100%+2rem)] lg:h-[calc(100%+4rem)]">
      {/* Sidebar (rooms) */}
      <div className={clsx(
        'w-full md:w-80 lg:w-96 flex-shrink-0',
        showThread && 'hidden md:flex'
      )}>
        <RoomList
          rooms={rooms}
          activeId={activeRoomId}
          onSelect={handleSelect}
          loading={isLoading}
          onNewTicket={() => setTicketOpen(true)}
        />
      </div>

      {/* Thread */}
      <div className={clsx(
        'flex-1 min-w-0',
        !showThread && 'hidden md:flex'
      )}>
        <Thread
          roomId={activeRoomId}
          onBack={() => setShowThread(false)}
        />
      </div>

      <NewTicketDialog
        open={ticketOpen}
        onClose={() => setTicketOpen(false)}
        onCreated={(room) => {
          setActiveRoomId(room.id);
          setShowThread(true);
        }}
      />
    </div>
  );
}
