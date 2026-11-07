/**
 * BARTA Core Domain Types
 * @license Apache-2.0
 */

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'call_log';

export interface MessageReply {
  id: string;
  senderName: string;
  content: string;
  type: MessageType;
}

export interface EncryptedPayload {
  iv: string;          // Base64 12-byte IV
  ciphertext: string;  // Base64 encrypted ciphertext
  mac?: string;        // Base64 auth tag
  keyId: string;       // Fingerprint of the session key used
  algo: string;        // 'AES-GCM-256'
  timestamp: number;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: MessageType;
  timestamp: number;
  status: MessageStatus;
  replyTo?: MessageReply;
  reactions: Record<string, string[]>; // emoji -> array of userIds
  isEdited?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  isEncrypted: boolean;
  encryptedEnvelope?: EncryptedPayload;
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  mediaMime?: string;
  duration?: number;       // For audio/video messages in seconds
  waveform?: number[];     // Sampled audio waveform amplitude array
  expiresAt?: number;      // For disappearing messages
  deletedForEveryone?: boolean;
  deletedForUserIds?: string[];
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  statusText?: string;
  isOnline: boolean;
  lastSeen: number;
  verified: boolean;
  publicKeyFingerprint: string;
  safetyNumber: string;
  deviceId: string;
  customStatus?: string;
}

export interface DeviceSession {
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'web';
  browser: string;
  ip: string;
  lastActive: number;
  isCurrent: boolean;
  isVerified: boolean;
  fingerprint: string;
}

export type RoomType = 'direct' | 'group';

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  avatar?: string;
  description?: string;
  participants: string[];       // User IDs
  admins: string[];             // Admin User IDs
  isEncrypted: boolean;
  lastMessage?: Message;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  disappearingTimeSec: number;  // 0 = disabled, 30, 300, 3600, 86400, etc.
  wallpaper?: string;
  createdAt: number;
  typingUserIds?: string[];
}

export type CallType = 'audio' | 'video';

export type CallStatus = 
  | 'idle'
  | 'ringing_incoming'
  | 'ringing_outgoing'
  | 'connecting'
  | 'connected'
  | 'ended'
  | 'declined'
  | 'missed';

export interface ActiveCall {
  id: string;
  roomId: string;
  peerId: string;
  peerUser: User;
  type: CallType;
  status: CallStatus;
  startTime?: number;
  duration: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
}

export interface CallLog {
  id: string;
  roomId: string;
  peerUser: User;
  type: CallType;
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: number;
  duration: number;
}

export interface PrivacySettings {
  lastSeenVisibility: 'everyone' | 'contacts' | 'nobody';
  readReceipts: boolean;
  typingIndicators: boolean;
  profileVisibility: 'everyone' | 'contacts' | 'nobody';
  allowCallsFrom: 'everyone' | 'contacts' | 'nobody';
  disappearingDefault: number;
  biometricLockEnabled: boolean;
}

export type ThemePreset = 'obsidian' | 'emerald' | 'sapphire' | 'midnight' | 'titanium';

export interface AppPreferences {
  theme: ThemePreset;
  bubbleStyle: 'modern' | 'minimal' | 'cyber';
  fontSize: 'compact' | 'normal' | 'spacious';
  soundNotifications: boolean;
  callRingtone: 'cyber' | 'minimal' | 'crystal';
  sendOnEnter: boolean;
  activeFolder: 'all' | 'direct' | 'groups' | 'encrypted' | 'unread' | 'archived';
}

export interface MatrixServerConfig {
  homeserverUrl: string;
  identityServerUrl?: string;
  isConnected: boolean;
  mode: 'standalone_e2ee' | 'matrix_federated';
  syncToken?: string;
}
