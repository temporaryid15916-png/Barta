/**
 * BARTA Conversation / Room List Component
 * Fast search, folder filters (All, Direct, Groups, Encrypted, Unread), badges, and typing indicators
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Pin,
  VolumeX,
  Lock,
  Mic,
  Image as ImageIcon,
  CheckCheck,
  Check,
  ShieldCheck,
  Users
} from 'lucide-react';
import { Room } from '../../types';

interface Props {
  rooms: Room[];
  activeRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onOpenNewChat: () => void;
  currentUserId: string;
}

export const ChatList: React.FC<Props> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  onOpenNewChat,
  currentUserId,
}) => {
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<'all' | 'direct' | 'groups' | 'unread' | 'archived'>('all');

  const filteredRooms = rooms
    .filter((r) => {
      // Folder filter
      if (folder === 'direct' && r.type !== 'direct') return false;
      if (folder === 'groups' && r.type !== 'group') return false;
      if (folder === 'unread' && r.unreadCount === 0) return false;
      if (folder === 'archived' && !r.isArchived) return false;
      if (folder !== 'archived' && r.isArchived) return false;

      // Search filter
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchLastMsg = r.lastMessage?.content.toLowerCase().includes(q);
      return matchName || matchLastMsg;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      const timeA = a.lastMessage?.timestamp || a.createdAt;
      const timeB = b.lastMessage?.timestamp || b.createdAt;
      return timeB - timeA;
    });

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full md:w-80 lg:w-96 bg-[#0a0e19] border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Top Bar with Title & Action */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        <div>
          <h2 className="font-bold text-base text-white tracking-tight">Messages</h2>
          <span className="text-[10px] text-emerald-400 font-mono">E2EE • WebCrypto 256-bit</span>
        </div>
        <button
          onClick={onOpenNewChat}
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 transition hover:scale-105"
          title="Start Encrypted Chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search chats, contacts, or messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Folder Filter Chips */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto scrollbar-none pb-0.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'direct', label: 'Direct' },
            { id: 'groups', label: 'Groups' },
            { id: 'unread', label: 'Unread' },
            { id: 'archived', label: 'Archived' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFolder(f.id as typeof folder)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition ${
                folder === f.id
                  ? 'bg-slate-800 text-emerald-400 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 scrollbar-thin">
        {filteredRooms.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No conversations found.
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isActive = activeRoomId === room.id;
            const isTyping = (room.typingUserIds?.length ?? 0) > 0;
            const lastMsg = room.lastMessage;
            const isMyLastMsg = lastMsg?.senderId === currentUserId;

            return (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room.id)}
                className={`w-full p-3.5 flex items-start gap-3 text-left transition group ${
                  isActive
                    ? 'bg-emerald-500/10 border-l-2 border-emerald-500'
                    : 'hover:bg-slate-900/50'
                }`}
              >
                {/* Avatar with Badges */}
                <div className="relative shrink-0">
                  <img
                    src={room.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={room.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700/80"
                  />
                  {room.type === 'group' && (
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-400">
                      <Users className="w-2.5 h-2.5" />
                    </div>
                  )}
                  {room.type === 'direct' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0a0e19]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <h3 className={`text-xs font-semibold truncate ${isActive ? 'text-emerald-300' : 'text-slate-100'}`}>
                        {room.name}
                      </h3>
                      {room.isEncrypted && (
                        <Lock className="w-3 h-3 text-emerald-400/80 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {formatTimestamp(lastMsg?.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    {/* Message Preview or Typing */}
                    {isTyping ? (
                      <span className="text-xs text-emerald-400 font-medium animate-pulse flex items-center gap-1 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        typing...
                      </span>
                    ) : (
                      <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                        {isMyLastMsg && lastMsg && (
                          <span className="shrink-0">
                            {lastMsg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
                            ) : lastMsg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </span>
                        )}

                        {lastMsg?.type === 'audio' && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Mic className="w-3 h-3 text-cyan-400 shrink-0" /> Voice message
                          </span>
                        )}

                        {lastMsg?.type === 'image' && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <ImageIcon className="w-3 h-3 text-emerald-400 shrink-0" /> Photo
                          </span>
                        )}

                        {(!lastMsg?.type || lastMsg.type === 'text') && (
                          <span className="truncate">
                            {lastMsg ? lastMsg.content : 'Encrypted session ready'}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Status Icons & Unread Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {room.isMuted && <VolumeX className="w-3 h-3 text-slate-500" />}
                      {room.isPinned && <Pin className="w-3 h-3 text-emerald-400" />}

                      {room.unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
