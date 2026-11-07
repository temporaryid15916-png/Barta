/**
 * BARTA Contacts & Public Key Directory View
 * Manage cryptographic peer relationships, verify safety numbers, and launch chats
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  Phone,
  Video,
  KeyRound,
  UserPlus,
  Copy,
  Check
} from 'lucide-react';
import { User, Room, CallType } from '../../types';
import { SecurityVerificationModal } from '../modals/SecurityVerificationModal';

interface Props {
  contacts: User[];
  onStartChat: (user: User) => void;
  onStartCall: (user: User, type: CallType) => void;
}

export const ContactsView: React.FC<Props> = ({ contacts, onStartChat, onStartCall }) => {
  const [search, setSearch] = useState('');
  const [selectedUserForVerification, setSelectedUserForVerification] = useState<User | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredContacts = contacts.filter((c) =>
    c.displayName.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase()) ||
    c.publicKeyFingerprint.toLowerCase().includes(search.toLowerCase())
  );

  const copyFingerprint = (fingerprint: string) => {
    navigator.clipboard.writeText(fingerprint);
    setCopiedKey(fingerprint);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080c15] overflow-y-auto p-4 sm:p-8 scrollbar-thin">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Key Directory & Contacts</h2>
            <p className="text-xs text-slate-400">Authenticated peer identities with ECDH public keys</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or key..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={contact.avatar}
                        alt={contact.displayName}
                        className="w-12 h-12 rounded-full object-cover border border-slate-700"
                      />
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#080c15]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-sm text-white">{contact.displayName}</h4>
                        {contact.verified ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">@{contact.username}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    contact.verified
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {contact.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3 line-clamp-2">
                  {contact.bio}
                </p>

                {/* Key Fingerprint Box */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 mb-4">
                  <div className="flex items-center gap-1.5 truncate">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{contact.publicKeyFingerprint}</span>
                  </div>
                  <button
                    onClick={() => copyFingerprint(contact.publicKeyFingerprint)}
                    className="p-1 hover:text-white transition shrink-0"
                    title="Copy Fingerprint"
                  >
                    {copiedKey === contact.publicKeyFingerprint ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onStartChat(contact)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>

                <button
                  onClick={() => onStartCall(contact, 'audio')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Audio Call"
                >
                  <Phone className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onStartCall(contact, 'video')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedUserForVerification(contact)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition"
                  title="Verify Safety Number"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Modal */}
      <SecurityVerificationModal
        user={selectedUserForVerification}
        onClose={() => setSelectedUserForVerification(null)}
      />
    </div>
  );
};
