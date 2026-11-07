/**
 * BARTA New Encrypted Conversation / Group Creation Modal
 * Direct E2EE rooms or multi-participant encrypted groups
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Users, UserPlus, Search, Check, X, ShieldCheck } from 'lucide-react';
import { store } from '../../services/storage/store';
import { User, Room } from '../../types';

interface Props {
  onClose: () => void;
  onRoomSelect: (room: Room) => void;
}

export const NewChatModal: React.FC<Props> = ({ onClose, onRoomSelect }) => {
  const [mode, setMode] = useState<'direct' | 'group'>('direct');
  const [search, setSearch] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const contacts = store.getContacts();

  const filteredContacts = contacts.filter((c) =>
    c.displayName.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase()) ||
    c.publicKeyFingerprint.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartDirect = (user: User) => {
    const room = store.createDirectRoom(user);
    onRoomSelect(room);
    onClose();
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUserIds.length === 0) return;

    const group = store.createGroupRoom(groupName.trim(), groupDesc.trim(), selectedUserIds);
    onRoomSelect(group);
    onClose();
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 bg-[#0d1424] p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {mode === 'direct' ? <UserPlus className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">
                {mode === 'direct' ? 'New Encrypted Chat' : 'Create Encrypted Group'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'direct' ? 'Peer-to-peer ECDH key agreement' : 'Multi-device group room'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mt-4 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setMode('direct')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition ${
              mode === 'direct' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct 1-on-1 (E2EE)
          </button>
          <button
            onClick={() => setMode('group')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition ${
              mode === 'group' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Group Conversation
          </button>
        </div>

        {mode === 'direct' ? (
          <div className="mt-4 flex-1 flex flex-col overflow-hidden">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, @username, or key fingerprint..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleStartDirect(contact)}
                  className="w-full p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700 flex items-center justify-between text-left transition group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={contact.avatar}
                      alt={contact.displayName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm text-white group-hover:text-emerald-400 transition">
                          {contact.displayName}
                        </span>
                        {contact.verified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">@{contact.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-slate-500 block">
                      {contact.publicKeyFingerprint}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">Start Chat →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleCreateGroup} className="mt-4 flex-1 flex flex-col overflow-hidden">
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Group Title</label>
                <input
                  type="text"
                  placeholder="e.g. Cryptography Working Group"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description / Topic</label>
                <input
                  type="text"
                  placeholder="Optional group description"
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400 mb-2">
              Select Participants ({selectedUserIds.length})
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {contacts.map((contact) => {
                const isSelected = selectedUserIds.includes(contact.id);
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => toggleSelectUser(contact.id)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={contact.avatar}
                        alt={contact.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-xs text-white">{contact.displayName}</div>
                        <div className="text-[11px] text-slate-400">@{contact.username}</div>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-950'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!groupName.trim() || selectedUserIds.length === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-medium text-white transition shadow-lg shadow-emerald-950/40"
              >
                Create Group
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
