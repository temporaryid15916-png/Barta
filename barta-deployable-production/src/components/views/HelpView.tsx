/**
 * BARTA Architecture, E2EE Security Model & Deployment Guide View
 * Detailed technical breakdown, threat model, WebRTC instructions, and GitHub Pages guide
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Lock,
  Globe,
  Terminal,
  BookOpen,
  Download,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { generateProjectZip, triggerDownload } from '../../utils/exportZip';

export const HelpView: React.FC = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await generateProjectZip();
      triggerDownload(blob, 'barta-production-deployable.zip');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080c15] overflow-y-auto p-4 sm:p-8 scrollbar-thin text-slate-200">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        {/* Title Header */}
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold mb-1">
            <BookOpen className="w-4 h-4" />
            TECHNICAL SPECIFICATION & DEPLOYMENT MANUAL
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            BARTA: Connect Beyond Boundaries
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Architectural reference, E2EE cryptographic specifications, and GitHub Pages publication handbook.
          </p>
        </div>

        {/* Section 1: End-to-End Encryption Architecture */}
        <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2.5 text-base font-semibold text-white">
            <Lock className="w-5 h-5 text-emerald-400" />
            1. Cryptographic Architecture (E2EE)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            BARTA enforces client-side cryptographic isolation using the browser&apos;s native <code>SubtleCrypto</code> engine. Plaintext never leaves the client device.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-semibold text-emerald-400 block mb-1">Symmetric Encryption</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>AES-GCM-256</strong> with 96-bit random nonce (IV) and 128-bit authentication tag. Protects message bodies, voice waveforms, and attachment blobs.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-semibold text-cyan-400 block mb-1">Key Agreement & Exchange</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                <strong>ECDH over NIST P-256</strong>. Each participant device maintains a permanent Identity Key Pair and ephemeral ratchet keys.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-semibold text-purple-400 block mb-1">Verification Numbers</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                60-digit safety numbers formatted into 12 blocks of 5 digits derived via <strong>SHA-256</strong> hash over ordered public key representations.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="font-semibold text-amber-400 block mb-1">Zero-Knowledge Storage</span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Private keys are stored exclusively in client memory / secure device storage. The homeserver never receives or stores private keys.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: WebRTC Audio/Video Calling */}
        <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2.5 text-base font-semibold text-white">
            <Globe className="w-5 h-5 text-cyan-400" />
            2. WebRTC Audio & Video Calling Engine
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Calling is negotiated via <code>RTCPeerConnection</code> with default STUN endpoints (<code>stun:stun.l.google.com:19302</code>).
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-medium text-emerald-400">Media Pipeline:</div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li><strong>Local Stream Acquisition:</strong> Adaptive constraints for low-latency 720p/1080p video with echo cancellation.</li>
              <li><strong>Zero Missing Audio Assets:</strong> Incoming and outgoing ringtones are dynamically generated via the Web Audio API (preventing 404 audio errors).</li>
              <li><strong>Simulated Fallback Peer:</strong> AI/test peers stream animated real-time canvas spectrums with synthetic audio so you can test calls immediately without a second device.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: White Screen Prevention & GitHub Pages Deployment */}
        <section className="p-6 rounded-2xl bg-slate-900/60 border border-emerald-500/30 space-y-4">
          <div className="flex items-center gap-2.5 text-base font-semibold text-white">
            <Terminal className="w-5 h-5 text-emerald-400" />
            3. GitHub Pages Deployment (White Screen Prevention)
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
            <strong>Mandatory Architecture Compliance:</strong> BARTA uses <code>base: &apos;./&apos;</code> in <code>vite.config.ts</code> and hash-safe routing. It can be published to any GitHub Pages repository (e.g. <code>https://user.github.io/barta/</code>) without blank screen failures or 404 reload errors!
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <h4 className="font-semibold text-white">How to Publish to GitHub in 3 Minutes:</h4>
            <ol className="list-decimal list-inside space-y-2 pl-1 leading-relaxed">
              <li>Download the complete deployable ZIP package below.</li>
              <li>Extract the ZIP and push the source repository to GitHub.</li>
              <li>In your GitHub repo: Go to <strong>Settings</strong> &gt; <strong>Pages</strong>.</li>
              <li>Set <strong>Source</strong> to <strong>GitHub Actions</strong>.</li>
              <li>The included <code>.github/workflows/deploy.yml</code> will automatically build and publish!</li>
            </ol>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 transition"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Compiling ZIP...' : 'Download Complete Production ZIP'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
