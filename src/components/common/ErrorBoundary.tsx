/**
 * BARTA Production Error Boundary
 * Prevents white screen of death and offers instant recovery
 * @license Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('BARTA caught an unhandled exception:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-6">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0f172a] border border-red-500/30 shadow-2xl text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
              <AlertOctagon className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">BARTA Protected State</h2>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              An unexpected client runtime issue was intercepted by BARTA&apos;s error shield. Your encrypted keys remain safe.
            </p>

            <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-red-300 text-left overflow-x-auto mb-6 border border-slate-800">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Reload App
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition shadow-lg shadow-red-950/40"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Vault
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
