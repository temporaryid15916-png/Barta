/**
 * BARTA WebRTC Audio & Video Calling Modal
 * Implements real-time streams, camera/mic toggles, screen share, and audio wave animations
 * @license Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  Monitor,
  ShieldCheck,
  Signal,
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';
import { ActiveCall } from '../../types';
import { BartaCallEngine } from '../../services/webrtc/callEngine';

interface Props {
  call: ActiveCall;
  callEngine: BartaCallEngine;
  onEndCall: () => void;
  onAcceptIncoming: () => void;
  onDeclineIncoming: () => void;
}

export const CallModal: React.FC<Props> = ({
  call,
  callEngine,
  onEndCall,
  onAcceptIncoming,
  onDeclineIncoming,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(call.type === 'video');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Bind video streams to <video> tags
  useEffect(() => {
    const bindStreams = () => {
      const localStream = callEngine.getLocalStream();
      const remoteStream = callEngine.getRemoteStream();

      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    bindStreams();
    const interval = setInterval(bindStreams, 500);
    return () => clearInterval(interval);
  }, [callEngine, call.status]);

  // Duration Timer
  useEffect(() => {
    if (call.status === 'connected') {
      const timer = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [call.status]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const toggleMic = () => {
    const muted = callEngine.toggleMute();
    setIsMuted(muted);
  };

  const toggleVideo = () => {
    const enabled = callEngine.toggleVideo();
    setIsVideoEnabled(enabled);
  };

  const toggleScreen = async () => {
    const sharing = await callEngine.toggleScreenShare();
    setIsScreenSharing(sharing);
  };

  // Incoming Call Overlay View
  if (call.status === 'ringing_incoming') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-sm rounded-3xl border border-emerald-500/30 bg-[#0b101c] p-8 text-center text-slate-100 shadow-2xl flex flex-col items-center">
          {/* Animated Avatar Waves */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="absolute -inset-3 rounded-full bg-emerald-500/10 animate-pulse" />
            <img
              src={call.peerUser.avatar}
              alt={call.peerUser.displayName}
              className="relative w-24 h-24 rounded-full object-cover border-2 border-emerald-400 shadow-xl"
            />
          </div>

          <h3 className="font-semibold text-xl text-white mb-1">{call.peerUser.displayName}</h3>
          <p className="text-xs text-slate-400 mb-2">@{call.peerUser.username}</p>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 mb-8">
            <ShieldCheck className="w-3.5 h-3.5" />
            Incoming WebRTC {call.type === 'video' ? 'Video' : 'Audio'} Call
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={onDeclineIncoming}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-950/50 transition group-hover:scale-105">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-xs text-slate-400">Decline</span>
            </button>

            <button
              onClick={onAcceptIncoming}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-950/50 transition group-hover:scale-105 animate-bounce">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs text-emerald-400 font-medium">Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active / Outgoing Ringing Call Screen
  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isFullscreen
          ? 'inset-0 bg-black'
          : 'inset-4 md:inset-10 rounded-3xl overflow-hidden border border-slate-700/80 bg-[#090d16] shadow-2xl flex flex-col'
      }`}
    >
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-slate-700/60 text-white">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="font-semibold text-xs flex items-center gap-1.5">
              {call.peerUser.displayName}
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-[10px] text-slate-300 font-mono flex items-center gap-2">
              <span>{call.status === 'connected' ? formatDuration(duration) : 'Ringing...'}</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Signal className="w-3 h-3" />
                STUN Peer-to-Peer
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white transition"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Remote Feed Area */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
        {call.type === 'video' ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center text-center p-8">
            <div className="relative mb-6">
              <div className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-pulse" />
              <img
                src={call.peerUser.avatar}
                alt={call.peerUser.displayName}
                className="w-28 h-28 rounded-full object-cover border-4 border-slate-800 shadow-2xl"
              />
            </div>
            <h3 className="font-semibold text-2xl text-white mb-2">{call.peerUser.displayName}</h3>
            <p className="text-sm text-emerald-400 font-mono mb-6">
              {call.status === 'connected' ? formatDuration(duration) : 'Connecting WebRTC audio stream...'}
            </p>
            {/* Animated synthetic audio wave bars */}
            <div className="flex items-center gap-1.5 h-12">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-emerald-400 rounded-full animate-pulse"
                  style={{
                    height: `${Math.sin(i * 0.5 + duration * 2) * 20 + 24}px`,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Local Video Picture-in-Picture */}
        {call.type === 'video' && (
          <div className="absolute bottom-24 right-4 z-20 w-36 h-48 sm:w-44 sm:h-56 rounded-2xl overflow-hidden border-2 border-emerald-500/40 shadow-2xl bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
            />
            {!isVideoEnabled && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-500 p-2 text-center text-xs">
                <VideoOff className="w-6 h-6 mb-1 text-slate-400" />
                Camera Off
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white font-medium">
              You
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-center gap-3 sm:gap-4 z-20">
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl border transition ${
            isMuted
              ? 'bg-red-600/20 text-red-400 border-red-500/40'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {call.type === 'video' && (
          <>
            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-2xl border transition ${
                !isVideoEnabled
                  ? 'bg-red-600/20 text-red-400 border-red-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={isVideoEnabled ? 'Disable camera' : 'Enable camera'}
            >
              {!isVideoEnabled ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleScreen}
              className={`p-3.5 rounded-2xl border transition ${
                isScreenSharing
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Share screen"
            >
              <Monitor className="w-5 h-5" />
            </button>
          </>
        )}

        <button
          onClick={onEndCall}
          className="px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-red-950/50 transition hover:scale-105"
          title="End Call"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-xs font-semibold">End Call</span>
        </button>
      </div>
    </div>
  );
};
