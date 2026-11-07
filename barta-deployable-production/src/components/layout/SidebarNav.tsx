/**
 * BARTA Main Navigation Sidebar
 * Responsive brand header, navigation icons, unread badges, and PWA install trigger
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  PhoneCall,
  Users,
  Shield,
  EyeOff,
  Settings,
  Download,
  DownloadCloud,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { User } from '../../types';

export type NavTab = 'chats' | 'calls' | 'contacts' | 'devices' | 'privacy' | 'settings' | 'export' | 'help';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadCount: number;
  currentUser: User;
  onOpenProfile: () => void;
}

export const SidebarNav: React.FC<Props> = ({
  activeTab,
  onTabChange,
  unreadCount,
  currentUser,
  onOpenProfile,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const navItems = [
    { id: 'chats' as NavTab, label: 'Chats', icon: MessageSquare, badge: unreadCount },
    { id: 'calls' as NavTab, label: 'Calls', icon: PhoneCall },
    { id: 'contacts' as NavTab, label: 'Contacts', icon: Users },
    { id: 'devices' as NavTab, label: 'Sessions', icon: Shield },
    { id: 'privacy' as NavTab, label: 'Privacy', icon: EyeOff },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
    { id: 'export' as NavTab, label: 'Deploy & ZIP', icon: Download },
  ];

  return (
    <>
      <aside className="w-16 md:w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none z-30">
        {/* Top: Logo & Branding */}
        <div>
          <div className="h-16 flex items-center px-3.5 md:px-5 gap-3 border-b border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-950/40 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-sm tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  BA
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wider text-white">BARTA</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-semibold border border-emerald-500/30">
                  E2EE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight">Connect Beyond Boundaries</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-2 md:p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-center md:justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition group relative ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="hidden md:inline">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="hidden md:flex items-center justify-center px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}

                  {/* Mobile Badge dot */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="md:hidden absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: PWA Install & User Profile */}
        <div className="p-2 md:p-3 border-t border-slate-800/80 space-y-2">
          {/* In-App PWA Install Button */}
          {!isInstalled && isInstallable && (
            <button
              onClick={install}
              className="w-full flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition"
              title="Install BARTA as native App"
            >
              <DownloadCloud className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Install Web App</span>
            </button>
          )}

          {!isInstalled && isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="w-full flex items-center justify-center md:justify-start gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-300 text-xs font-medium hover:bg-slate-800 transition"
            >
              <DownloadCloud className="w-4 h-4 shrink-0 text-cyan-400" />
              <span className="hidden md:inline">Install on iOS</span>
            </button>
          )}

          {/* User Profile Card */}
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center justify-center md:justify-between p-2 rounded-xl bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 text-left transition group"
            title="Edit Profile & Keys"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.displayName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#090d16]" />
              </div>
              <div className="hidden md:block truncate">
                <div className="font-semibold text-xs text-white truncate flex items-center gap-1">
                  {currentUser.displayName}
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                </div>
                <div className="text-[10px] text-slate-400 truncate">@{currentUser.username}</div>
              </div>
            </div>
            <ChevronRight className="hidden md:block w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
          </button>
        </div>
      </aside>

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#0d1424] p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Install BARTA on iPhone / iPad</h3>
            <p className="text-xs text-slate-300 leading-relaxed space-y-2 mb-4">
              1. Tap the <strong>Share</strong> button at the bottom of Safari.<br />
              2. Scroll down and select <strong>&quot;Add to Home Screen&quot;</strong>.<br />
              3. Launch BARTA from your home screen for standalone zero-distraction encrypted messaging.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
