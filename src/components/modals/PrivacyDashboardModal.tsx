/**
 * BARTA Privacy Dashboard & Advanced Security Settings
 * Controls last seen, read receipts, typing broadcast, and disappearing message defaults
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff, CheckCheck, Clock, Fingerprint, X, ShieldAlert, Sparkles } from 'lucide-react';
import { store } from '../../services/storage/store';
import { PrivacySettings } from '../../types';

interface Props {
  onClose: () => void;
}

export const PrivacyDashboardModal: React.FC<Props> = ({ onClose }) => {
  const [privacy, setPrivacy] = useState<PrivacySettings>(store.getPrivacySettings());
  const [savedNotice, setSavedNotice] = useState(false);

  const handleUpdate = (updates: Partial<PrivacySettings>) => {
    const updated = { ...privacy, ...updates };
    setPrivacy(updated);
    store.updatePrivacySettings(updates);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 bg-[#0d1424] p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <EyeOff className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Privacy & Security Dashboard</h3>
              <p className="text-xs text-slate-400">Zero-leak telemetry and visibility controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedNotice && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4" />
            Privacy settings updated & persisted across linked sessions.
          </div>
        )}

        {/* Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {/* Read Receipts */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
                <CheckCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Read Receipts</h4>
                <p className="text-xs text-slate-400">
                  If turned off, you won&apos;t send or receive read receipts (double blue checkmarks).
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.readReceipts}
                onChange={(e) => handleUpdate({ readReceipts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Typing Indicators */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
                <Eye className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Typing Indicators</h4>
                <p className="text-xs text-slate-400">
                  Broadcast when you are composing a message in personal chats.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.typingIndicators}
                onChange={(e) => handleUpdate({ typingIndicators: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Last Seen Visibility */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <h4 className="text-sm font-medium text-white mb-1">Last Seen & Online Presence</h4>
            <p className="text-xs text-slate-400 mb-3">
              Choose who can see your active presence timestamp.
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['everyone', 'contacts', 'nobody'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => handleUpdate({ lastSeenVisibility: option })}
                  className={`py-2 px-3 rounded-lg capitalize border font-medium transition ${
                    privacy.lastSeenVisibility === option
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Disappearing Messages Default */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-medium text-white">Default Disappearing Timer</h4>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Automatically set an expiration timer on new direct conversations.
            </p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[
                { label: 'Off', sec: 0 },
                { label: '5m', sec: 300 },
                { label: '1 hour', sec: 3600 },
                { label: '24 hours', sec: 86400 },
              ].map((item) => (
                <button
                  key={item.sec}
                  onClick={() => handleUpdate({ disappearingDefault: item.sec })}
                  className={`py-2 px-2.5 rounded-lg border font-medium transition text-center ${
                    privacy.disappearingDefault === item.sec
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* App Lock / Biometric */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 mt-0.5">
                <Fingerprint className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">Biometric App Shield</h4>
                <p className="text-xs text-slate-400">
                  Require TouchID / FaceID / WebAuthn passcode to unlock BARTA.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacy.biometricLockEnabled}
                onChange={(e) => handleUpdate({ biometricLockEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Threat Model Callout */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
              <ShieldAlert className="w-4 h-4" />
              Documented Threat Model
            </div>
            BARTA encrypts all message bodies, images, files, and voice notes with client-side WebCrypto AES-GCM-256. Intermediary servers cannot decrypt content. Metadata visible to network operators is strictly limited to transport packet timestamps and IP endpoints (unless routed via Tor/VPN).
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
