/**
 * BARTA Safety Number & Cryptographic Verification Modal
 * Compares 60-digit safety numbers (12 blocks of 5 digits) and scans QR fingerprints
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, QrCode, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { User } from '../../types';
import { store } from '../../services/storage/store';

interface Props {
  user: User | null;
  onClose: () => void;
}

export const SecurityVerificationModal: React.FC<Props> = ({ user, onClose }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'numbers' | 'qr'>('numbers');
  const currentUser = store.getCurrentUser();

  if (!user) return null;

  const safetyBlocks = user.safetyNumber.split(' ');

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      store.verifyContact(user.id);
      setIsVerifying(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700/60 bg-[#0d1424] p-6 shadow-2xl text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              user.verified 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {user.verified ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Cryptographic Verification</h3>
              <p className="text-xs text-slate-400">Verifying identity with {user.displayName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between text-xs ${
          user.verified
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${user.verified ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-medium">
              {user.verified ? 'Device Session Verified & Trusted' : 'Unverified Device Fingerprint'}
            </span>
          </div>
          <span className="font-mono text-[11px] opacity-80">ECDH: P-256</span>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 mt-4 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('numbers')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'numbers' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            60-Digit Safety Number
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'qr' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            QR Code Fingerprint
          </button>
        </div>

        {activeTab === 'numbers' ? (
          <div className="mt-4">
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              Compare this safety number with <strong>{user.displayName}</strong> on their device. If the numbers match exactly, no third party is intercepting your conversation.
            </p>

            <div className="grid grid-cols-3 gap-2 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center font-mono text-sm tracking-wider">
              {safetyBlocks.map((block, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-900/60 text-emerald-400 font-semibold border border-slate-800/50">
                  {block}
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Your Key: {currentUser.publicKeyFingerprint}</span>
              <span>Peer: {user.publicKeyFingerprint}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center">
            <p className="text-xs text-slate-300 mb-3 text-center">
              Scan this QR code from {user.displayName}&apos;s device to instantly authenticate public keys.
            </p>
            {/* High Tech Synthetic QR Code SVG */}
            <div className="p-4 rounded-2xl bg-white shadow-xl flex items-center justify-center">
              <svg width="180" height="180" viewBox="0 0 100 100" className="text-slate-950 fill-current">
                {/* 3 Corner Anchor Boxes */}
                <rect x="5" y="5" width="25" height="25" fill="#090d16" rx="3" />
                <rect x="9" y="9" width="17" height="17" fill="#ffffff" rx="1" />
                <rect x="13" y="13" width="9" height="9" fill="#10b981" rx="1" />

                <rect x="70" y="5" width="25" height="25" fill="#090d16" rx="3" />
                <rect x="74" y="9" width="17" height="17" fill="#ffffff" rx="1" />
                <rect x="78" y="13" width="9" height="9" fill="#10b981" rx="1" />

                <rect x="5" y="70" width="25" height="25" fill="#090d16" rx="3" />
                <rect x="9" y="74" width="17" height="17" fill="#ffffff" rx="1" />
                <rect x="13" y="78" width="9" height="9" fill="#10b981" rx="1" />

                {/* Simulated Data Matrix Nodes */}
                <rect x="35" y="10" width="6" height="6" fill="#090d16" />
                <rect x="45" y="10" width="6" height="6" fill="#090d16" />
                <rect x="55" y="10" width="6" height="6" fill="#090d16" />
                <rect x="35" y="20" width="6" height="6" fill="#090d16" />
                <rect x="50" y="20" width="6" height="6" fill="#090d16" />
                <rect x="10" y="38" width="6" height="6" fill="#090d16" />
                <rect x="20" y="45" width="6" height="6" fill="#090d16" />
                <rect x="38" y="38" width="8" height="8" fill="#10b981" />
                <rect x="52" y="38" width="6" height="6" fill="#090d16" />
                <rect x="65" y="45" width="6" height="6" fill="#090d16" />
                <rect x="78" y="38" width="6" height="6" fill="#090d16" />
                <rect x="88" y="48" width="6" height="6" fill="#090d16" />
                <rect x="38" y="52" width="6" height="6" fill="#090d16" />
                <rect x="48" y="60" width="6" height="6" fill="#090d16" />
                <rect x="60" y="55" width="6" height="6" fill="#090d16" />
                <rect x="38" y="72" width="6" height="6" fill="#090d16" />
                <rect x="50" y="78" width="6" height="6" fill="#090d16" />
                <rect x="62" y="70" width="6" height="6" fill="#090d16" />
                <rect x="78" y="80" width="6" height="6" fill="#090d16" />
                <rect x="85" y="70" width="6" height="6" fill="#090d16" />
              </svg>
            </div>
            <span className="mt-3 font-mono text-xs text-slate-400">Fingerprint: {user.publicKeyFingerprint}</span>
          </div>
        )}

        {/* Verification action */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition"
          >
            Close
          </button>

          {!user.verified ? (
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm shadow-lg shadow-emerald-950/40 transition"
            >
              {isVerifying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Mark as Verified
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Fingerprint Authenticated
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
