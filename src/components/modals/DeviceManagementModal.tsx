/**
 * BARTA Multi-Device & Session Management Modal
 * Active sessions, cryptographic device pairing with 6-digit codes, and session revocation
 * @license Apache-2.0
 */

import React, { useState } from 'react';
import { Laptop, Smartphone, Monitor, ShieldCheck, ShieldAlert, Plus, Trash2, X, KeyRound, QrCode } from 'lucide-react';
import { store } from '../../services/storage/store';
import { DeviceSession } from '../../types';

interface Props {
  onClose: () => void;
}

export const DeviceManagementModal: React.FC<Props> = ({ onClose }) => {
  const [devices, setDevices] = useState<DeviceSession[]>(store.getDevices());
  const [isLinking, setIsLinking] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceSession['deviceType']>('mobile');
  const [pairingCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  const handleLinkDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    store.linkNewDevice(newDeviceName.trim(), deviceType);
    setDevices(store.getDevices());
    setNewDeviceName('');
    setIsLinking(false);
  };

  const handleRevoke = (deviceId: string) => {
    if (confirm('Revoke encryption keys for this device? It will be immediately disconnected.')) {
      store.revokeDevice(deviceId);
      setDevices(store.getDevices());
    }
  };

  const getDeviceIcon = (type: DeviceSession['deviceType']) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'desktop':
        return <Laptop className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700/60 bg-[#0d1424] p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Active Devices & Sessions</h3>
              <p className="text-xs text-slate-400">Manage cross-signing keys and authorized devices</p>
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
          {!isLinking ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Linked Sessions ({devices.length})
                </span>
                <button
                  onClick={() => setIsLinking(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition"
                >
                  <Plus className="w-4 h-4" /> Link New Device
                </button>
              </div>

              <div className="space-y-2.5">
                {devices.map((device) => (
                  <div
                    key={device.deviceId}
                    className={`p-4 rounded-xl border transition ${
                      device.isCurrent
                        ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl border mt-0.5 ${
                          device.isCurrent
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {getDeviceIcon(device.deviceType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm text-white">{device.deviceName}</h4>
                            {device.isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                                This Device
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {device.browser} • IP: {device.ip}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-400">
                            <span className="flex items-center gap-1 text-emerald-400/90">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {device.fingerprint}
                            </span>
                            <span>•</span>
                            <span>
                              {device.isCurrent
                                ? 'Active now'
                                : `Active ${Math.round((Date.now() - device.lastActive) / 60000)}m ago`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!device.isCurrent && (
                        <button
                          onClick={() => handleRevoke(device.deviceId)}
                          title="Revoke device access and keys"
                          className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h4 className="text-sm font-semibold text-white mb-1">Cryptographic Device Link</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To link a second device (Phone, Tablet, or Laptop), scan the secure QR code or enter the 6-digit confirmation code on your new device.
                </p>

                <div className="mt-4 flex flex-col items-center">
                  <div className="p-3 rounded-xl bg-white shadow-lg">
                    <svg width="120" height="120" viewBox="0 0 100 100" className="text-slate-950 fill-current">
                      <rect x="5" y="5" width="25" height="25" rx="2" />
                      <rect x="10" y="10" width="15" height="15" fill="#fff" />
                      <rect x="14" y="14" width="7" height="7" fill="#090d16" />

                      <rect x="70" y="5" width="25" height="25" rx="2" />
                      <rect x="75" y="10" width="15" height="15" fill="#fff" />
                      <rect x="79" y="14" width="7" height="7" fill="#090d16" />

                      <rect x="5" y="70" width="25" height="25" rx="2" />
                      <rect x="10" y="75" width="15" height="15" fill="#fff" />
                      <rect x="14" y="79" width="7" height="7" fill="#090d16" />

                      <rect x="40" y="20" width="10" height="10" />
                      <rect x="55" y="45" width="10" height="10" fill="#10b981" />
                      <rect x="35" y="55" width="15" height="15" />
                      <rect x="70" y="70" width="15" height="15" />
                    </svg>
                  </div>

                  <div className="mt-3 text-center">
                    <span className="text-[11px] text-slate-400 block mb-1">One-Time Pairing Code:</span>
                    <span className="px-4 py-1.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xl tracking-widest font-bold border border-emerald-500/30">
                      {pairingCode}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleLinkDevice} className="mt-5 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">New Device Name</label>
                    <input
                      type="text"
                      placeholder="e.g. iPad Pro 13, Work Laptop"
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Device Form Factor</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {(['mobile', 'desktop', 'tablet'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setDeviceType(t)}
                          className={`py-2 px-3 rounded-lg capitalize border font-medium transition ${
                            deviceType === t
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsLinking(false)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newDeviceName.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-medium text-white transition shadow-lg shadow-emerald-950/40"
                    >
                      Authorize & Link
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
