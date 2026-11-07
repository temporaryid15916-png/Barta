/**
 * BARTA WebRTC Calls History View
 * Audio/video call history, missed call indicators, duration, and instant re-dial
 * @license Apache-2.0
 */

import React from 'react';
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, ShieldCheck, Clock } from 'lucide-react';
import { CallLog, User, CallType } from '../../types';

interface Props {
  callLogs: CallLog[];
  onStartCall: (user: User, type: CallType) => void;
}

export const CallsView: React.FC<Props> = ({ callLogs, onStartCall }) => {
  const formatDuration = (sec: number) => {
    if (sec === 0) return 'Missed';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const getDirectionIcon = (dir: CallLog['direction']) => {
    switch (dir) {
      case 'incoming':
        return <PhoneIncoming className="w-4 h-4 text-emerald-400" />;
      case 'outgoing':
        return <PhoneOutgoing className="w-4 h-4 text-cyan-400" />;
      case 'missed':
        return <PhoneMissed className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080c15] overflow-y-auto p-4 sm:p-8 scrollbar-thin">
      <div className="max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Call History</h2>
            <p className="text-xs text-slate-400">Encrypted WebRTC P2P & Relay Sessions</p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/30">
            SRTP Encrypted
          </span>
        </div>

        <div className="space-y-2.5">
          {callLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No recent calls. Start a call from any chat room header.
            </div>
          ) : (
            callLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 flex items-center justify-between transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={log.peerUser.avatar}
                      alt={log.peerUser.displayName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-700"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-slate-800">
                      {getDirectionIcon(log.direction)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm text-white">{log.peerUser.displayName}</h4>
                      {log.peerUser.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                      <span>{new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(log.duration)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onStartCall(log.peerUser, 'audio')}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition"
                    title="Audio Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onStartCall(log.peerUser, 'video')}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition"
                    title="Video Call"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
