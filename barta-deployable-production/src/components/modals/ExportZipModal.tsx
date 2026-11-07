/**
 * BARTA Deployable ZIP Exporter & GitHub Publishing Modal
 * Generates verified production ZIP package and explains GitHub Pages deployment
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Download, CheckCircle2, Github, Terminal, X, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { generateProjectZip, triggerDownload } from '../../utils/exportZip';

interface Props {
  onClose: () => void;
}

export const ExportZipModal: React.FC<Props> = ({ onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateProjectZip();
      triggerDownload(blob, 'barta-production-deployable.zip');
      setDownloaded(true);
    } catch (err) {
      console.error('ZIP generation failed:', err);
      alert('Error generating ZIP archive: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700/60 bg-[#0d1424] p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Deploy BARTA & Download ZIP</h3>
              <p className="text-xs text-slate-400">Zero white-screen guarantee for GitHub Pages</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 leading-relaxed">
            <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              Pre-Configured Production Architecture
            </div>
            This package includes all source files, TypeScript strict configs, Vite relative base path (<code>./</code>), GitHub Actions automated deployment workflow, PWA service worker, and WebCrypto E2EE algorithms.
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Github className="w-4 h-4 text-slate-300" />
              GitHub Pages Deployment in 3 Steps
            </div>

            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 pl-1 leading-relaxed">
              <li>
                <strong>Create a new GitHub repository</strong> (e.g., <code>barta</code>) on your account.
              </li>
              <li>
                <strong>Push or upload the extracted ZIP source code</strong> to the <code>main</code> branch.
              </li>
              <li>
                Go to <strong>Settings</strong> &gt; <strong>Pages</strong> in your GitHub repository, and under <strong>Build and deployment</strong>, set <strong>Source</strong> to <strong>GitHub Actions</strong>.
              </li>
            </ol>

            <div className="mt-3 p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-cyan-300 border border-slate-800">
              # The included .github/workflows/deploy.yml will automatically build and publish your site!
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Why This Prevents White Screen Failures
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside leading-relaxed">
              <li><strong>Vite Base Path:</strong> Set to <code>base: &apos;./&apos;</code> to support any repository subdirectory without hardcoded root paths.</li>
              <li><strong>Routing:</strong> Uses hash-safe navigation to eliminate 404s upon browser refresh on GitHub Pages.</li>
              <li><strong>Zero Missing Audio Assets:</strong> All call ringtones and message chimes are generated in-memory via the Web Audio API.</li>
              <li><strong>Clean Service Worker:</strong> Caches static app shell only, never stores sensitive keys or message plaintexts.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-medium transition"
          >
            Close
          </button>

          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 transition"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Packaging ZIP...
              </>
            ) : downloaded ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Download Again
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download Complete ZIP
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
