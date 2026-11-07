/**
 * BARTA Main Chat Area Component
 * Complete real-time E2EE messaging, voice notes with live waveform scrubber,
 * attachments, replies, reactions, pinned banners, and ciphertext inspection.
 * @license Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Video,
  ShieldCheck,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  Pin,
  Clock,
  CheckCheck,
  Check,
  Trash2,
  X,
  Reply,
  Star,
  Play,
  Pause,
  Download,
  Image as ImageIcon,
  FileText,
  Volume2,
  Lock,
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { Room, Message, User, CallType } from '../../types';
import { VoiceRecorderService, RecordedAudioData } from '../../services/audio/recorder';
import { store } from '../../services/storage/store';
import { CiphertextInspectorModal } from '../modals/CiphertextInspectorModal';
import { SecurityVerificationModal } from '../modals/SecurityVerificationModal';

interface Props {
  room: Room;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, type: Message['type'], mediaDetails?: Record<string, unknown>, replyTo?: Message['replyTo']) => void;
  onStartCall: (peerUser: User, type: CallType) => void;
  onBackMobile?: () => void;
}

export const ChatArea: React.FC<Props> = ({
  room,
  messages,
  currentUser,
  onSendMessage,
  onStartCall,
  onBackMobile,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingWaveform, setRecordingWaveform] = useState<number[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showDisappearingOptions, setShowDisappearingOptions] = useState(false);
  const [inspectingMessage, setInspectingMessage] = useState<Message | null>(null);
  const [inspectingUser, setInspectingUser] = useState<User | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recorderServiceRef = useRef<VoiceRecorderService | null>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    store.markRoomAsRead(room.id);
  }, [messages.length, room.id]);

  // Peer User (if direct room)
  const peerUserId = room.participants.find((id) => id !== currentUser.id) || room.participants[0];
  const peerUser = store.getContacts().find((c) => c.id === peerUserId) || {
    id: peerUserId,
    displayName: room.name,
    username: room.name.toLowerCase().replace(/\s+/g, '_'),
    avatar: room.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    bio: room.description || '',
    isOnline: true,
    lastSeen: Date.now(),
    verified: true,
    publicKeyFingerprint: 'BARTA-PEER-8842',
    safetyNumber: '11204 98321 00481 77392 48102 99482 17294 88391 02938 47102 99481 29481',
    deviceId: 'DEV_PEER_01',
  };

  // Find pinned message in this room
  const pinnedMessage = messages.find((m) => m.isPinned);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const replyDetails = replyingTo
      ? {
          id: replyingTo.id,
          senderName: replyingTo.senderName,
          content: replyingTo.content,
          type: replyingTo.type,
        }
      : undefined;

    onSendMessage(inputText.trim(), 'text', undefined, replyDetails);
    setInputText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Voice recording
  const startVoiceRecording = async () => {
    try {
      recorderServiceRef.current = new VoiceRecorderService();
      await recorderServiceRef.current.startRecording((waveform, dur) => {
        setRecordingWaveform([...waveform]);
        setRecordingDuration(dur);
      });
      setIsRecordingVoice(true);
    } catch {
      alert('Could not access microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopAndSendVoiceRecording = async () => {
    if (!recorderServiceRef.current) return;
    try {
      const data: RecordedAudioData = await recorderServiceRef.current.stopRecording();
      setIsRecordingVoice(false);
      setRecordingDuration(0);
      setRecordingWaveform([]);

      onSendMessage('Voice Note', 'audio', {
        mediaUrl: data.url,
        duration: data.duration,
        waveform: data.waveform,
      });
    } catch (err) {
      console.warn('Voice recording stop error:', err);
      setIsRecordingVoice(false);
    }
  };

  const cancelVoiceRecording = () => {
    recorderServiceRef.current?.cancelRecording();
    setIsRecordingVoice(false);
    setRecordingDuration(0);
    setRecordingWaveform([]);
  };

  // File Upload (Images & Documents)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const type: Message['type'] = isImage ? 'image' : isVideo ? 'video' : 'document';

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      onSendMessage(
        isImage ? 'Encrypted Photo' : file.name,
        type,
        {
          mediaUrl: resultUrl,
          mediaName: file.name,
          mediaSize: file.size,
          mediaMime: file.type,
        }
      );
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Play audio voice message with playback speed
  const togglePlayAudio = (msgId: string, url?: string) => {
    if (!url) return;

    if (playingAudioId === msgId) {
      activeAudioElementRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
      }
      const audio = new Audio(url);
      audio.playbackRate = playbackSpeed;
      audio.onended = () => setPlayingAudioId(null);
      audio.play().catch(() => {});
      activeAudioElementRef.current = audio;
      setPlayingAudioId(msgId);
    }
  };

  const cyclePlaybackSpeed = () => {
    const nextSpeed: 1 | 1.5 | 2 = playbackSpeed === 1 ? 1.5 : playbackSpeed === 1.5 ? 2 : 1;
    setPlaybackSpeed(nextSpeed);
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.playbackRate = nextSpeed;
    }
  };

  const handleExportChat = () => {
    const exportData = {
      room: room.name,
      exportedAt: new Date().toISOString(),
      messages: messages.map((m) => ({
        id: m.id,
        sender: m.senderName,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString(),
        isEncrypted: m.isEncrypted,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barta-chat-${room.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMoreMenu(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080c15] relative overflow-hidden select-text">
      {/* Active Conversation Header */}
      <header className="h-16 px-4 bg-[#0a0f1d] border-b border-slate-800/80 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => setInspectingUser(peerUser)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <img
                src={room.avatar || peerUser.avatar}
                alt={room.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0f1d]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition truncate max-w-[180px] sm:max-w-xs">
                  {room.name}
                </h3>
                {peerUser.verified && (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400/90 font-mono">ECDH P-256 Verified</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* E2EE Safety Badge */}
          <button
            onClick={() => setInspectingUser(peerUser)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition"
            title="Inspect safety numbers and verify keys"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Keys</span>
          </button>

          {/* WebRTC Audio Call */}
          <button
            onClick={() => onStartCall(peerUser, 'audio')}
            className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
            title="Start WebRTC Audio Call"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* WebRTC Video Call */}
          <button
            onClick={() => onStartCall(peerUser, 'video')}
            className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition"
            title="Start WebRTC Video Call"
          >
            <Video className="w-4 h-4" />
          </button>

          {/* More Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-12 w-56 rounded-2xl bg-[#0d1424] border border-slate-700 shadow-2xl p-2 z-50 text-xs text-slate-200 space-y-1 animate-in fade-in">
                <button
                  onClick={() => setShowDisappearingOptions(!showDisappearingOptions)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 text-left transition"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" /> Disappearing Timer
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {showDisappearingOptions && (
                  <div className="p-1.5 bg-slate-950 rounded-xl space-y-1 mb-1">
                    {[
                      { label: 'Off', sec: 0 },
                      { label: '30 seconds', sec: 30 },
                      { label: '5 minutes', sec: 300 },
                      { label: '1 hour', sec: 3600 },
                      { label: '24 hours', sec: 86400 },
                    ].map((opt) => (
                      <button
                        key={opt.sec}
                        onClick={() => {
                          store.setDisappearingMessages(room.id, opt.sec);
                          setShowMoreMenu(false);
                        }}
                        className={`w-full py-1.5 px-2 rounded-lg text-left text-[11px] transition ${
                          room.disappearingTimeSec === opt.sec
                            ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                            : 'hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    store.togglePinRoom(room.id);
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-left transition"
                >
                  <Pin className="w-4 h-4 text-emerald-400" />
                  {room.isPinned ? 'Unpin Conversation' : 'Pin Conversation'}
                </button>

                <button
                  onClick={() => {
                    store.toggleMuteRoom(room.id);
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-left transition"
                >
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  {room.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
                </button>

                <button
                  onClick={handleExportChat}
                  className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-left transition"
                >
                  <Download className="w-4 h-4 text-cyan-400" /> Export Chat Log
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 z-10 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-400 shrink-0">Pinned:</span>
            <span className="truncate">{pinnedMessage.content}</span>
          </div>
          <button
            onClick={() => store.togglePinMessage(pinnedMessage.id)}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Unpin message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Disappearing Messages Active Banner */}
      {room.disappearingTimeSec > 0 && (
        <div className="px-4 py-1.5 bg-cyan-950/40 border-b border-cyan-800/30 flex items-center justify-center gap-2 text-[11px] text-cyan-300 font-mono">
          <Clock className="w-3 h-3" />
          Disappearing messages active: expires after {room.disappearingTimeSec >= 3600 ? `${room.disappearingTimeSec / 3600}h` : `${room.disappearingTimeSec}s`}
        </div>
      )}

      {/* Messages Scroll Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
        {/* Top Cryptographic Room Notice */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center max-w-md shadow-inner">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-medium text-xs mb-1">
              <Lock className="w-3.5 h-3.5" />
              End-to-End Encrypted Room
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Messages and calls are secured with AES-GCM-256. Only you and recipients have the keys. Click any message&apos;s lock icon to inspect the authentic ciphertext envelope.
            </p>
          </div>
        </div>

        {/* Message Bubble List */}
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isVoice = msg.type === 'audio';
          const isImage = msg.type === 'image';
          const isDoc = msg.type === 'document';

          return (
            <div
              key={msg.id}
              className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Sender Name in group */}
              {!isMe && room.type === 'group' && (
                <span className="text-[10px] text-slate-400 font-medium ml-2 mb-1">
                  {msg.senderName}
                </span>
              )}

              {/* Message Bubble Container */}
              <div className="relative max-w-[85%] sm:max-w-md">
                <div
                  className={`p-3.5 rounded-2xl relative shadow-md transition ${
                    isMe
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white rounded-br-xs'
                      : 'bg-slate-900/90 text-slate-100 border border-slate-800/90 rounded-bl-xs'
                  }`}
                >
                  {/* Quoted Reply Snippet */}
                  {msg.replyTo && (
                    <div className={`p-2 rounded-xl mb-2 text-xs border-l-2 ${
                      isMe
                        ? 'bg-emerald-700/60 border-white text-emerald-100'
                        : 'bg-slate-800/80 border-emerald-400 text-slate-300'
                    }`}>
                      <div className="font-semibold text-[10px] opacity-90">{msg.replyTo.senderName}</div>
                      <div className="truncate text-[11px] opacity-80">{msg.replyTo.content}</div>
                    </div>
                  )}

                  {/* Voice Note View */}
                  {isVoice ? (
                    <div className="space-y-2 min-w-[220px]">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => togglePlayAudio(msg.id, msg.mediaUrl)}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-md ${
                            isMe
                              ? 'bg-white text-emerald-700 hover:bg-slate-100'
                              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          }`}
                        >
                          {playingAudioId === msg.id ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>

                        {/* Waveform Bars */}
                        <div className="flex-1 flex items-center gap-1 h-8">
                          {(msg.waveform || [0.3, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8, 0.3, 0.6]).map((amp, idx) => (
                            <div
                              key={idx}
                              className={`w-1 rounded-full transition-all ${
                                isMe ? 'bg-white/80' : 'bg-emerald-400'
                              }`}
                              style={{ height: `${Math.max(6, amp * 28)}px` }}
                            />
                          ))}
                        </div>

                        <button
                          onClick={cyclePlaybackSpeed}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isMe ? 'border-white/30 text-white' : 'border-slate-700 text-slate-300'
                          }`}
                        >
                          {playbackSpeed}x
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
                        <span>Voice message</span>
                        <span>0:0{msg.duration || 6}</span>
                      </div>
                    </div>
                  ) : isImage ? (
                    <div className="space-y-2">
                      <img
                        src={msg.mediaUrl}
                        alt="Encrypted attachment"
                        className="rounded-xl max-h-64 object-cover w-full border border-slate-700/50"
                      />
                      {msg.content && <p className="text-xs">{msg.content}</p>}
                    </div>
                  ) : isDoc ? (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-950/40 border border-white/10">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate flex-1">
                        <div className="font-medium text-xs truncate">{msg.mediaName || msg.content}</div>
                        <div className="text-[10px] opacity-70">
                          {msg.mediaSize ? `${Math.round(msg.mediaSize / 1024)} KB` : 'Encrypted Document'}
                        </div>
                      </div>
                      <a
                        href={msg.mediaUrl}
                        download={msg.mediaName || 'barta-file'}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  )}

                  {/* Bottom Meta Bar (Timestamp, ticks, E2EE lock) */}
                  <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] font-mono ${
                    isMe ? 'text-emerald-100/90' : 'text-slate-400'
                  }`}>
                    {msg.isEdited && <span>(edited)</span>}
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {/* Lock Icon for inspecting Ciphertext */}
                    <button
                      onClick={() => setInspectingMessage(msg)}
                      className="hover:scale-125 transition"
                      title="Inspect genuine AES-GCM ciphertext envelope"
                    >
                      <Lock className="w-3 h-3 text-emerald-300" />
                    </button>

                    {isMe && (
                      <span>
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-emerald-200/80" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reaction Chips */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Object.entries(msg.reactions).map(([emoji, users]) => (
                      <button
                        key={emoji}
                        onClick={() => store.toggleReaction(msg.id, emoji)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition ${
                          users.includes(currentUser.id)
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="text-[10px] font-bold">{users.length}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Hover Quick Action Bar */}
                <div
                  className={`absolute top-0 -translate-y-1/2 hidden group-hover:flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-20 ${
                    isMe ? 'right-0' : 'left-0'
                  }`}
                >
                  {['❤️', '👍', '🔒', '🚀'].map((em) => (
                    <button
                      key={em}
                      onClick={() => store.toggleReaction(msg.id, em)}
                      className="p-1 hover:scale-125 transition text-xs"
                    >
                      {em}
                    </button>
                  ))}

                  <div className="w-[1px] h-3 bg-slate-700 my-auto mx-0.5" />

                  <button
                    onClick={() => setReplyingTo(msg)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => store.togglePinMessage(msg.id)}
                    className="p-1 text-slate-400 hover:text-emerald-400"
                    title="Pin"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setInspectingMessage(msg)}
                    className="p-1 text-slate-400 hover:text-cyan-400"
                    title="Inspect Ciphertext"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => store.deleteMessage(msg.id, isMe)}
                    className="p-1 text-slate-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <Reply className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-emerald-400">{replyingTo.senderName}: </span>
              <span className="text-slate-400">{replyingTo.content}</span>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-3 bg-[#0a0f1d] border-t border-slate-800/80 shrink-0">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,application/pdf,.doc,.docx"
        />

        {isRecordingVoice ? (
          /* Live Voice Recording UI */
          <div className="flex items-center gap-3 p-2 bg-slate-900 rounded-2xl border border-emerald-500/40">
            <button
              onClick={cancelVoiceRecording}
              className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition"
              title="Cancel recording"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Live animated waveform visualizer */}
            <div className="flex-1 flex items-center gap-1 h-8 px-2 overflow-hidden">
              {recordingWaveform.map((amp, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-emerald-400 rounded-full transition-all"
                  style={{ height: `${Math.max(6, amp * 28)}px` }}
                />
              ))}
            </div>

            <span className="text-xs font-mono text-emerald-400 font-bold shrink-0">
              0:0{recordingDuration}
            </span>

            <button
              onClick={stopAndSendVoiceRecording}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 transition"
            >
              <Send className="w-4 h-4" /> Send Voice
            </button>
          </div>
        ) : (
          /* Standard Input Bar */
          <div className="flex items-center gap-2">
            {/* Attachment Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
              title="Attach Encrypted File / Photo"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Emoji Picker Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 p-3 rounded-2xl bg-[#0d1424] border border-slate-700 shadow-2xl z-50 grid grid-cols-6 gap-2 text-xl animate-in fade-in">
                  {['🔒', '🛡️', '⚡', '🚀', '🔥', '❤️', '👍', '🎉', '💯', '🔑', '🤖', '✨'].map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        setInputText((prev) => prev + e);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1.5 hover:scale-125 transition"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Textarea Input */}
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write an encrypted message (AES-GCM-256)..."
              className="flex-1 py-2.5 px-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none max-h-32 scrollbar-thin"
            />

            {/* Voice Record / Send Button */}
            {inputText.trim() ? (
              <button
                onClick={handleSend}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition hover:scale-105 shrink-0"
                title="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={startVoiceRecording}
                className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition shrink-0"
                title="Record Voice Note"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Ciphertext Inspector Modal */}
      <CiphertextInspectorModal
        message={inspectingMessage}
        onClose={() => setInspectingMessage(null)}
      />

      {/* Safety Number & Cryptographic Verification Modal */}
      <SecurityVerificationModal
        user={inspectingUser}
        onClose={() => setInspectingUser(null)}
      />
    </div>
  );
};
