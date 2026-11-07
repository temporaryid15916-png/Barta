/**
 * BARTA Central Data & Storage Store
 * Provides state persistence, BroadcastChannel real-time multi-tab synchronization,
 * message lifecycles, and contact key management.
 * @license Apache-2.0
 */

import {
  User,
  Room,
  Message,
  DeviceSession,
  CallLog,
  PrivacySettings,
  AppPreferences,
  MatrixServerConfig
} from '../../types';
import { BartaCryptoEngine } from '../crypto/e2ee';
import { sounds } from '../audio/soundEffects';

const INITIAL_CURRENT_USER: User = {
  id: 'usr_me',
  username: 'alex_mercer',
  displayName: 'Alex Mercer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Systems Security Architect | BARTA Core Contributor',
  statusText: '🔐 All communications encrypted end-to-end',
  isOnline: true,
  lastSeen: Date.now(),
  verified: true,
  publicKeyFingerprint: 'BARTA-89A4-F291-C83D',
  safetyNumber: '39418 82019 45192 00192 84729 19284 75620 18274 95821 73620 48291 03829',
  deviceId: 'DEV_CURRENT_01',
};

const INITIAL_CONTACTS: User[] = [
  {
    id: 'usr_elena',
    username: 'elena_rostova',
    displayName: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Cryptographer • Matrix & Olm Ratchet Specialist',
    statusText: 'Auditing Double Ratchet session keys',
    isOnline: true,
    lastSeen: Date.now(),
    verified: true,
    publicKeyFingerprint: 'ELEN-49F1-88DC-11A0',
    safetyNumber: '11204 98321 00481 77392 48102 99482 17294 88391 02938 47102 99481 29481',
    deviceId: 'DEV_ELENA_01',
  },
  {
    id: 'usr_marcus',
    username: 'marcus_vance',
    displayName: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Decentralized P2P Network Engineer',
    statusText: 'Deploying WebRTC SFU edge nodes',
    isOnline: true,
    lastSeen: Date.now() - 1000 * 60 * 12,
    verified: true,
    publicKeyFingerprint: 'MARC-9021-BB43-559D',
    safetyNumber: '55019 48201 99284 10294 88371 02948 11928 47291 88374 99182 47291 99381',
    deviceId: 'DEV_MARCUS_01',
  },
  {
    id: 'usr_sarah',
    username: 'sarah_chen',
    displayName: 'Dr. Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Post-Quantum Security Auditor & Cryptanalyst',
    statusText: 'Testing Kyber-1024 hybrid key agreement',
    isOnline: false,
    lastSeen: Date.now() - 1000 * 60 * 45,
    verified: true,
    publicKeyFingerprint: 'CHEN-3321-77BA-991C',
    safetyNumber: '77391 02948 11928 47291 00293 84729 11928 38472 99102 84729 11029 38472',
    deviceId: 'DEV_SARAH_01',
  },
  {
    id: 'usr_sentinel',
    username: 'barta_sentinel',
    displayName: 'BARTA Sentinel 🛡️',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    bio: 'Official Cryptographic Assistant & Security Bot',
    statusText: 'Always active • Instant encrypted response test',
    isOnline: true,
    lastSeen: Date.now(),
    verified: true,
    publicKeyFingerprint: 'BOT-0001-SENT-8888',
    safetyNumber: '00000 11111 22222 33333 44444 55555 66666 77777 88888 99999 12345 67890',
    deviceId: 'DEV_BOT_SENTINEL',
  },
  {
    id: 'usr_kai',
    username: 'kai_rivera',
    displayName: 'Kai Rivera',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Mobile systems developer • PWA enthusiast',
    statusText: 'Living in standalone display mode',
    isOnline: false,
    lastSeen: Date.now() - 1000 * 60 * 60 * 3,
    verified: false,
    publicKeyFingerprint: 'KAI-8832-CC19-3321',
    safetyNumber: '99281 74829 11029 38472 88392 01928 37482 91029 38472 91029 38472 10293',
    deviceId: 'DEV_KAI_01',
  }
];

const INITIAL_DEVICES: DeviceSession[] = [
  {
    deviceId: 'DEV_CURRENT_01',
    deviceName: 'MacBook Pro 16" (Current App)',
    deviceType: 'desktop',
    browser: 'Chrome / PWA Standalone',
    ip: '192.168.1.104',
    lastActive: Date.now(),
    isCurrent: true,
    isVerified: true,
    fingerprint: 'BARTA-89A4-F291-C83D',
  },
  {
    deviceId: 'DEV_IPHONE_16',
    deviceName: 'iPhone 16 Pro (BARTA iOS)',
    deviceType: 'mobile',
    browser: 'Mobile Safari / PWA',
    ip: '10.0.0.12',
    lastActive: Date.now() - 1000 * 60 * 25,
    isCurrent: false,
    isVerified: true,
    fingerprint: 'IOS-7721-B002-99EA',
  },
  {
    deviceId: 'DEV_THINKPAD',
    deviceName: 'ThinkPad Carbon X1 (Arch Linux)',
    deviceType: 'desktop',
    browser: 'Firefox ESR',
    ip: '172.16.4.22',
    lastActive: Date.now() - 1000 * 60 * 60 * 5,
    isCurrent: false,
    isVerified: false,
    fingerprint: 'ARCH-1092-FF88-331B',
  }
];

const INITIAL_CALL_LOGS: CallLog[] = [
  {
    id: 'call_1',
    roomId: 'room_elena',
    peerUser: INITIAL_CONTACTS[0],
    type: 'video',
    direction: 'incoming',
    timestamp: Date.now() - 1000 * 60 * 120,
    duration: 384, // 6m 24s
  },
  {
    id: 'call_2',
    roomId: 'room_marcus',
    peerUser: INITIAL_CONTACTS[1],
    type: 'audio',
    direction: 'outgoing',
    timestamp: Date.now() - 1000 * 60 * 360,
    duration: 145, // 2m 25s
  },
  {
    id: 'call_3',
    roomId: 'room_sarah',
    peerUser: INITIAL_CONTACTS[2],
    type: 'video',
    direction: 'missed',
    timestamp: Date.now() - 1000 * 60 * 60 * 18,
    duration: 0,
  }
];

export class BartaStore {
  private static instance: BartaStore;
  private currentUser: User = INITIAL_CURRENT_USER;
  private contacts: User[] = INITIAL_CONTACTS;
  private rooms: Room[] = [];
  private messages: Map<string, Message[]> = new Map();
  private devices: DeviceSession[] = INITIAL_DEVICES;
  private callLogs: CallLog[] = INITIAL_CALL_LOGS;
  private privacySettings: PrivacySettings = {
    lastSeenVisibility: 'everyone',
    readReceipts: true,
    typingIndicators: true,
    profileVisibility: 'everyone',
    allowCallsFrom: 'everyone',
    disappearingDefault: 0,
    biometricLockEnabled: false,
  };
  private preferences: AppPreferences = {
    theme: 'obsidian',
    bubbleStyle: 'modern',
    fontSize: 'normal',
    soundNotifications: true,
    callRingtone: 'cyber',
    sendOnEnter: true,
    activeFolder: 'all',
  };
  private matrixConfig: MatrixServerConfig = {
    homeserverUrl: 'https://matrix.org',
    identityServerUrl: 'https://vector.im',
    isConnected: false,
    mode: 'standalone_e2ee',
  };

  private listeners: Set<() => void> = new Set();
  private syncChannel: BroadcastChannel | null = null;

  private constructor() {
    this.loadFromStorage();
    this.setupSyncChannel();
  }

  public static getInstance(): BartaStore {
    if (!BartaStore.instance) {
      BartaStore.instance = new BartaStore();
    }
    return BartaStore.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.saveToStorage();
    this.listeners.forEach((listener) => listener());
  }

  private setupSyncChannel(): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.syncChannel = new BroadcastChannel('barta_multitab_sync');
      this.syncChannel.onmessage = (event) => {
        if (event.data?.type === 'STATE_UPDATED') {
          this.loadFromStorage();
          this.listeners.forEach((l) => l());
        }
      };
    }
  }

  private broadcastChange(): void {
    this.syncChannel?.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedUser = localStorage.getItem('barta_current_user');
      if (storedUser) this.currentUser = JSON.parse(storedUser);

      const storedRooms = localStorage.getItem('barta_rooms');
      const storedMessages = localStorage.getItem('barta_messages');

      if (storedRooms && storedMessages) {
        this.rooms = JSON.parse(storedRooms);
        const parsedMsgs: Record<string, Message[]> = JSON.parse(storedMessages);
        this.messages = new Map(Object.entries(parsedMsgs));
      } else {
        this.seedInitialData();
      }

      const storedPrefs = localStorage.getItem('barta_preferences');
      if (storedPrefs) this.preferences = { ...this.preferences, ...JSON.parse(storedPrefs) };

      const storedPrivacy = localStorage.getItem('barta_privacy');
      if (storedPrivacy) this.privacySettings = { ...this.privacySettings, ...JSON.parse(storedPrivacy) };

      const storedMatrix = localStorage.getItem('barta_matrix_config');
      if (storedMatrix) this.matrixConfig = { ...this.matrixConfig, ...JSON.parse(storedMatrix) };

      const storedDevices = localStorage.getItem('barta_devices');
      if (storedDevices) this.devices = JSON.parse(storedDevices);

      const storedCalls = localStorage.getItem('barta_calls');
      if (storedCalls) this.callLogs = JSON.parse(storedCalls);
    } catch (e) {
      console.warn('Error reading from localStorage, using fresh state:', e);
      this.seedInitialData();
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('barta_current_user', JSON.stringify(this.currentUser));
      localStorage.setItem('barta_rooms', JSON.stringify(this.rooms));

      const msgsObj: Record<string, Message[]> = {};
      this.messages.forEach((list, key) => {
        msgsObj[key] = list;
      });
      localStorage.setItem('barta_messages', JSON.stringify(msgsObj));
      localStorage.setItem('barta_preferences', JSON.stringify(this.preferences));
      localStorage.setItem('barta_privacy', JSON.stringify(this.privacySettings));
      localStorage.setItem('barta_matrix_config', JSON.stringify(this.matrixConfig));
      localStorage.setItem('barta_devices', JSON.stringify(this.devices));
      localStorage.setItem('barta_calls', JSON.stringify(this.callLogs));

      this.broadcastChange();
    } catch (e) {
      console.warn('Error saving to localStorage:', e);
    }
  }

  private seedInitialData(): void {
    const elenaUser = this.contacts[0];
    const marcusUser = this.contacts[1];
    const sentinelUser = this.contacts[3];

    const roomElena: Room = {
      id: 'room_elena',
      type: 'direct',
      name: elenaUser.displayName,
      avatar: elenaUser.avatar,
      description: elenaUser.bio,
      participants: ['usr_me', elenaUser.id],
      admins: ['usr_me', elenaUser.id],
      isEncrypted: true,
      unreadCount: 0,
      isMuted: false,
      isPinned: true,
      isArchived: false,
      disappearingTimeSec: 0,
      createdAt: Date.now() - 1000 * 60 * 60 * 48,
    };

    const roomGroup: Room = {
      id: 'room_core_arch',
      type: 'group',
      name: 'BARTA Core Architecture',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      description: 'Discussions on Matrix Rust SDK, WebRTC SFU, and Double Ratchet key rotation.',
      participants: ['usr_me', elenaUser.id, marcusUser.id, this.contacts[2].id],
      admins: ['usr_me', elenaUser.id],
      isEncrypted: true,
      unreadCount: 2,
      isMuted: false,
      isPinned: true,
      isArchived: false,
      disappearingTimeSec: 0,
      createdAt: Date.now() - 1000 * 60 * 60 * 72,
    };

    const roomMarcus: Room = {
      id: 'room_marcus',
      type: 'direct',
      name: marcusUser.displayName,
      avatar: marcusUser.avatar,
      description: marcusUser.bio,
      participants: ['usr_me', marcusUser.id],
      admins: ['usr_me', marcusUser.id],
      isEncrypted: true,
      unreadCount: 0,
      isMuted: false,
      isPinned: false,
      isArchived: false,
      disappearingTimeSec: 3600, // 1 hour disappearing messages
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
    };

    const roomSentinel: Room = {
      id: 'room_sentinel',
      type: 'direct',
      name: sentinelUser.displayName,
      avatar: sentinelUser.avatar,
      description: sentinelUser.bio,
      participants: ['usr_me', sentinelUser.id],
      admins: ['usr_me', sentinelUser.id],
      isEncrypted: true,
      unreadCount: 0,
      isMuted: false,
      isPinned: false,
      isArchived: false,
      disappearingTimeSec: 0,
      createdAt: Date.now() - 1000 * 60 * 60 * 10,
    };

    const elenaMsgs: Message[] = [
      {
        id: 'msg_e1',
        roomId: 'room_elena',
        senderId: elenaUser.id,
        senderName: elenaUser.displayName,
        senderAvatar: elenaUser.avatar,
        content: 'Hey Alex! I have verified our safety numbers on BARTA. The ECDH P-256 session keys are securely established.',
        type: 'text',
        timestamp: Date.now() - 1000 * 60 * 45,
        status: 'read',
        isEncrypted: true,
        reactions: { '🔒': ['usr_me'] },
        encryptedEnvelope: {
          iv: 'yF8v1kd9pLaq0mX8',
          ciphertext: 'nK82xLaq8P10vmz9KaL982zmxp09Laksdmq1082KLAJkldms==',
          algo: 'AES-GCM-256',
          keyId: 'key_room_elena',
          timestamp: Date.now() - 1000 * 60 * 45,
        }
      },
      {
        id: 'msg_e2',
        roomId: 'room_elena',
        senderId: 'usr_me',
        senderName: 'Alex Mercer',
        content: 'Awesome Elena. I tested the WebRTC video calling pipeline with STUN and the Web Audio waveform recorder. Both working smoothly.',
        type: 'text',
        timestamp: Date.now() - 1000 * 60 * 30,
        status: 'read',
        isEncrypted: true,
        reactions: { '🚀': [elenaUser.id] },
        encryptedEnvelope: {
          iv: '4uNx82Lq1p9mKaQ9',
          ciphertext: 'Laks99210mxzlkad09812mxkldsmalkdm01823901kdjsa==',
          algo: 'AES-GCM-256',
          keyId: 'key_room_elena',
          timestamp: Date.now() - 1000 * 60 * 30,
        }
      },
      {
        id: 'msg_e3',
        roomId: 'room_elena',
        senderId: elenaUser.id,
        senderName: elenaUser.displayName,
        senderAvatar: elenaUser.avatar,
        content: 'Here is a quick encrypted voice note briefing on the latest security audit:',
        type: 'audio',
        timestamp: Date.now() - 1000 * 60 * 15,
        status: 'read',
        isEncrypted: true,
        duration: 8,
        waveform: [0.2, 0.4, 0.7, 0.9, 0.5, 0.8, 1.0, 0.6, 0.4, 0.7, 0.9, 0.8, 0.5, 0.3, 0.6, 0.4],
        reactions: {},
        encryptedEnvelope: {
          iv: '8Xkq92Lm10zPqaL0',
          ciphertext: '19mKaP01289zmxKLdsa091283mxklamd01823901kdlsakm==',
          algo: 'AES-GCM-256',
          keyId: 'key_room_elena',
          timestamp: Date.now() - 1000 * 60 * 15,
        }
      },
      {
        id: 'msg_e4',
        roomId: 'room_elena',
        senderId: elenaUser.id,
        senderName: elenaUser.displayName,
        senderAvatar: elenaUser.avatar,
        content: 'Ready to run our cross-device key backup verification whenever you are.',
        type: 'text',
        timestamp: Date.now() - 1000 * 60 * 3,
        status: 'read',
        isEncrypted: true,
        reactions: { '💯': ['usr_me'] },
        encryptedEnvelope: {
          iv: '92mxKaP01289zmxK',
          ciphertext: '88102391029312093810293810293810293810293810293812039==',
          algo: 'AES-GCM-256',
          keyId: 'key_room_elena',
          timestamp: Date.now() - 1000 * 60 * 3,
        }
      }
    ];

    const groupMsgs: Message[] = [
      {
        id: 'msg_g1',
        roomId: 'room_core_arch',
        senderId: elenaUser.id,
        senderName: elenaUser.displayName,
        senderAvatar: elenaUser.avatar,
        content: '📢 Pinned Notice: BARTA v1.0.0 architecture adheres strictly to Zero Plaintext and client-side WebCrypto encryption standards.',
        type: 'text',
        timestamp: Date.now() - 1000 * 60 * 60 * 12,
        status: 'read',
        isPinned: true,
        isEncrypted: true,
        reactions: { '🛡️': ['usr_me', marcusUser.id] },
      },
      {
        id: 'msg_g2',
        roomId: 'room_core_arch',
        senderId: marcusUser.id,
        senderName: marcusUser.displayName,
        senderAvatar: marcusUser.avatar,
        content: 'WebRTC data channels and STUN relay connectivity verified across all test clients.',
        type: 'text',
        timestamp: Date.now() - 1000 * 60 * 20,
        status: 'delivered',
        isEncrypted: true,
        reactions: {},
      },
      {
        id: 'msg_g3',
        roomId: 'room_core_arch',
        senderId: this.contacts[2].id,
        senderName: this.contacts[2].displayName,
        senderAvatar: this.contacts[2].avatar,
        content: 'The GitHub Pages zero-white-screen deployment test passed with flying colors.',
        type: 'text',
        timestamp: Date.now() - 1000 * 60 * 5,
        status: 'delivered',
        isEncrypted: true,
        reactions: { '🎉': ['usr_me'] },
      }
    ];

    const sentinelMsgs: Message[] = [
      {
        id: 'msg_s1',
        roomId: 'room_sentinel',
        senderId: sentinelUser.id,
        senderName: sentinelUser.displayName,
        senderAvatar: sentinelUser.avatar,
        content: 'Hello Alex! I am your BARTA Security Sentinel. Send me any test message or command: type "status", "keys", "verify", or "call" to test real-time E2EE messaging and automated bot responses.',
        type: 'text',
        timestamp: Date.now() - 1000 * 60 * 60,
        status: 'read',
        isEncrypted: true,
        reactions: { '🤖': ['usr_me'] },
      }
    ];

    roomElena.lastMessage = elenaMsgs[elenaMsgs.length - 1];
    roomGroup.lastMessage = groupMsgs[groupMsgs.length - 1];
    roomSentinel.lastMessage = sentinelMsgs[sentinelMsgs.length - 1];

    this.rooms = [roomElena, roomGroup, roomMarcus, roomSentinel];
    this.messages.set('room_elena', elenaMsgs);
    this.messages.set('room_core_arch', groupMsgs);
    this.messages.set('room_marcus', []);
    this.messages.set('room_sentinel', sentinelMsgs);
  }

  // Getters
  public getCurrentUser(): User {
    return this.currentUser;
  }

  public getContacts(): User[] {
    return this.contacts;
  }

  public getRooms(): Room[] {
    return this.rooms;
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.find((r) => r.id === roomId);
  }

  public getMessages(roomId: string): Message[] {
    return this.messages.get(roomId) || [];
  }

  public getDevices(): DeviceSession[] {
    return this.devices;
  }

  public getCallLogs(): CallLog[] {
    return this.callLogs;
  }

  public getPrivacySettings(): PrivacySettings {
    return this.privacySettings;
  }

  public getPreferences(): AppPreferences {
    return this.preferences;
  }

  public getMatrixConfig(): MatrixServerConfig {
    return this.matrixConfig;
  }

  // Mutators
  public updateCurrentUser(updates: Partial<User>): void {
    this.currentUser = { ...this.currentUser, ...updates };
    this.notify();
  }

  public updatePrivacySettings(updates: Partial<PrivacySettings>): void {
    this.privacySettings = { ...this.privacySettings, ...updates };
    this.notify();
  }

  public updatePreferences(updates: Partial<AppPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.notify();
  }

  public updateMatrixConfig(updates: Partial<MatrixServerConfig>): void {
    this.matrixConfig = { ...this.matrixConfig, ...updates };
    this.notify();
  }

  public async sendMessage(
    roomId: string,
    content: string,
    type: Message['type'] = 'text',
    mediaDetails?: {
      mediaUrl?: string;
      mediaName?: string;
      mediaSize?: number;
      mediaMime?: string;
      duration?: number;
      waveform?: number[];
    },
    replyTo?: Message['replyTo']
  ): Promise<Message> {
    const cryptoEngine = BartaCryptoEngine.getInstance();
    const room = this.getRoom(roomId);
    const isEncrypted = room?.isEncrypted ?? true;

    // Genuine cryptographic encryption for text payload
    let envelope: Message['encryptedEnvelope'] = undefined;
    if (isEncrypted && content) {
      try {
        envelope = await cryptoEngine.encryptText(roomId, content);
      } catch (err) {
        console.warn('E2EE envelope creation:', err);
      }
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      roomId,
      senderId: this.currentUser.id,
      senderName: this.currentUser.displayName,
      senderAvatar: this.currentUser.avatar,
      content,
      type,
      timestamp: Date.now(),
      status: 'sending',
      replyTo,
      reactions: {},
      isEncrypted,
      encryptedEnvelope: envelope,
      expiresAt: room?.disappearingTimeSec ? Date.now() + room.disappearingTimeSec * 1000 : undefined,
      ...mediaDetails,
    };

    // Optimistic addition
    const list = this.messages.get(roomId) || [];
    list.push(newMessage);
    this.messages.set(roomId, list);

    if (room) {
      room.lastMessage = newMessage;
    }

    sounds.playMessageSent();
    this.notify();

    // Transition sending -> sent -> delivered
    setTimeout(() => {
      newMessage.status = 'sent';
      this.notify();
    }, 200);

    setTimeout(() => {
      newMessage.status = 'delivered';
      this.notify();
    }, 450);

    // If sending to Sentinel Bot or mock active contacts, trigger automatic intelligent encrypted response
    this.handleAutoReply(roomId, newMessage);

    return newMessage;
  }

  private handleAutoReply(roomId: string, userMsg: Message): void {
    const room = this.getRoom(roomId);
    if (!room) return;

    if (roomId === 'room_sentinel') {
      setTimeout(async () => {
        // Set typing indicator
        room.typingUserIds = ['usr_sentinel'];
        this.notify();

        setTimeout(async () => {
          room.typingUserIds = [];
          const text = userMsg.content.toLowerCase();
          let botReply = '🔒 Encrypted message received and validated with AES-GCM-256. All cryptographic signatures intact.';

          if (text.includes('status')) {
            botReply = `✅ BARTA E2EE Engine Active.\n• Protocol: WebCrypto AES-GCM-256\n• Key Exchange: ECDH P-256\n• Verification: SHA-256 Safety Digits\n• Status: Online & Synchronized`;
          } else if (text.includes('key') || text.includes('fingerprint')) {
            botReply = `🔑 Your Identity Fingerprint: ${this.currentUser.publicKeyFingerprint}\nSafety Number: ${this.currentUser.safetyNumber}`;
          } else if (text.includes('verify')) {
            botReply = `🛡️ Cryptographic Handshake Verified! Your active device session DEV_CURRENT_01 is marked fully trusted.`;
          } else if (text.includes('call')) {
            botReply = `📞 WebRTC audio and video calling engines are initialized. Tap the phone or video icon in the header to launch a call!`;
          }

          const cryptoEngine = BartaCryptoEngine.getInstance();
          const envelope = await cryptoEngine.encryptText(roomId, botReply);

          const replyMsg: Message = {
            id: `msg_bot_${Date.now()}`,
            roomId,
            senderId: 'usr_sentinel',
            senderName: 'BARTA Sentinel 🛡️',
            senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
            content: botReply,
            type: 'text',
            timestamp: Date.now(),
            status: 'read',
            reactions: {},
            isEncrypted: true,
            encryptedEnvelope: envelope,
          };

          const list = this.messages.get(roomId) || [];
          list.push(replyMsg);
          this.messages.set(roomId, list);
          room.lastMessage = replyMsg;
          sounds.playMessageReceived();
          this.notify();
        }, 1200);
      }, 600);
    } else if (roomId === 'room_elena' && !userMsg.content.startsWith('bot:')) {
      // Occasional peer reply simulation
      setTimeout(() => {
        room.typingUserIds = ['usr_elena'];
        this.notify();
        setTimeout(async () => {
          room.typingUserIds = [];
          const replyText = 'Received your encrypted payload, Alex! Decrypted cleanly on my end.';
          const cryptoEngine = BartaCryptoEngine.getInstance();
          const envelope = await cryptoEngine.encryptText(roomId, replyText);

          const replyMsg: Message = {
            id: `msg_elena_${Date.now()}`,
            roomId,
            senderId: 'usr_elena',
            senderName: 'Elena Rostova',
            senderAvatar: this.contacts[0].avatar,
            content: replyText,
            type: 'text',
            timestamp: Date.now(),
            status: 'read',
            reactions: {},
            isEncrypted: true,
            encryptedEnvelope: envelope,
          };
          const list = this.messages.get(roomId) || [];
          list.push(replyMsg);
          this.messages.set(roomId, list);
          room.lastMessage = replyMsg;
          sounds.playMessageReceived();
          this.notify();
        }, 1800);
      }, 1000);
    }
  }

  public editMessage(messageId: string, newContent: string): void {
    for (const [roomId, list] of this.messages.entries()) {
      const msg = list.find((m) => m.id === messageId);
      if (msg) {
        msg.content = newContent;
        msg.isEdited = true;
        this.notify();
        break;
      }
    }
  }

  public deleteMessage(messageId: string, forEveryone: boolean): void {
    for (const [roomId, list] of this.messages.entries()) {
      const idx = list.findIndex((m) => m.id === messageId);
      if (idx !== -1) {
        if (forEveryone) {
          list[idx].content = '🚫 This message was deleted';
          list[idx].deletedForEveryone = true;
          list[idx].type = 'text';
          list[idx].mediaUrl = undefined;
        } else {
          list.splice(idx, 1);
        }
        this.notify();
        break;
      }
    }
  }

  public toggleReaction(messageId: string, emoji: string): void {
    for (const [_, list] of this.messages.entries()) {
      const msg = list.find((m) => m.id === messageId);
      if (msg) {
        if (!msg.reactions) msg.reactions = {};
        const current = msg.reactions[emoji] || [];
        const myId = this.currentUser.id;
        if (current.includes(myId)) {
          msg.reactions[emoji] = current.filter((id) => id !== myId);
          if (msg.reactions[emoji].length === 0) {
            delete msg.reactions[emoji];
          }
        } else {
          msg.reactions[emoji] = [...current, myId];
        }
        this.notify();
        break;
      }
    }
  }

  public togglePinMessage(messageId: string): void {
    for (const [_, list] of this.messages.entries()) {
      const msg = list.find((m) => m.id === messageId);
      if (msg) {
        msg.isPinned = !msg.isPinned;
        this.notify();
        break;
      }
    }
  }

  public toggleStarMessage(messageId: string): void {
    for (const [_, list] of this.messages.entries()) {
      const msg = list.find((m) => m.id === messageId);
      if (msg) {
        msg.isStarred = !msg.isStarred;
        this.notify();
        break;
      }
    }
  }

  public markRoomAsRead(roomId: string): void {
    const room = this.getRoom(roomId);
    if (room && room.unreadCount > 0) {
      room.unreadCount = 0;
      const msgs = this.messages.get(roomId) || [];
      msgs.forEach((m) => {
        if (m.senderId !== this.currentUser.id && m.status !== 'read') {
          m.status = 'read';
        }
      });
      this.notify();
    }
  }

  public setDisappearingMessages(roomId: string, seconds: number): void {
    const room = this.getRoom(roomId);
    if (room) {
      room.disappearingTimeSec = seconds;
      this.notify();
    }
  }

  public toggleMuteRoom(roomId: string): void {
    const room = this.getRoom(roomId);
    if (room) {
      room.isMuted = !room.isMuted;
      this.notify();
    }
  }

  public togglePinRoom(roomId: string): void {
    const room = this.getRoom(roomId);
    if (room) {
      room.isPinned = !room.isPinned;
      this.notify();
    }
  }

  public toggleArchiveRoom(roomId: string): void {
    const room = this.getRoom(roomId);
    if (room) {
      room.isArchived = !room.isArchived;
      this.notify();
    }
  }

  public setRoomWallpaper(roomId: string, wallpaperUrl: string): void {
    const room = this.getRoom(roomId);
    if (room) {
      room.wallpaper = wallpaperUrl;
      this.notify();
    }
  }

  public createDirectRoom(targetUser: User): Room {
    const existing = this.rooms.find(
      (r) => r.type === 'direct' && r.participants.includes(targetUser.id)
    );
    if (existing) {
      return existing;
    }

    const newRoom: Room = {
      id: `room_dir_${Date.now()}_${targetUser.id}`,
      type: 'direct',
      name: targetUser.displayName,
      avatar: targetUser.avatar,
      description: targetUser.bio,
      participants: [this.currentUser.id, targetUser.id],
      admins: [this.currentUser.id, targetUser.id],
      isEncrypted: true,
      unreadCount: 0,
      isMuted: false,
      isPinned: false,
      isArchived: false,
      disappearingTimeSec: 0,
      createdAt: Date.now(),
    };

    this.rooms.unshift(newRoom);
    this.messages.set(newRoom.id, []);
    this.notify();
    return newRoom;
  }

  public createGroupRoom(name: string, description: string, participantIds: string[]): Room {
    const newRoom: Room = {
      id: `room_grp_${Date.now()}`,
      type: 'group',
      name,
      avatar: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=80',
      description,
      participants: [this.currentUser.id, ...participantIds],
      admins: [this.currentUser.id],
      isEncrypted: true,
      unreadCount: 0,
      isMuted: false,
      isPinned: false,
      isArchived: false,
      disappearingTimeSec: 0,
      createdAt: Date.now(),
    };

    const initialAnnouncement: Message = {
      id: `msg_grp_init_${Date.now()}`,
      roomId: newRoom.id,
      senderId: this.currentUser.id,
      senderName: this.currentUser.displayName,
      content: `🔐 Group "${name}" created with End-to-End Encryption enabled. All participant devices have negotiated unique session keys.`,
      type: 'text',
      timestamp: Date.now(),
      status: 'read',
      reactions: {},
      isEncrypted: true,
    };

    newRoom.lastMessage = initialAnnouncement;
    this.rooms.unshift(newRoom);
    this.messages.set(newRoom.id, [initialAnnouncement]);
    this.notify();
    return newRoom;
  }

  public verifyContact(userId: string): void {
    const contact = this.contacts.find((c) => c.id === userId);
    if (contact) {
      contact.verified = true;
      this.notify();
    }
  }

  public linkNewDevice(deviceName: string, deviceType: DeviceSession['deviceType']): DeviceSession {
    const newDev: DeviceSession = {
      deviceId: `DEV_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      deviceName,
      deviceType,
      browser: 'BARTA Secure Client',
      ip: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
      lastActive: Date.now(),
      isCurrent: false,
      isVerified: true,
      fingerprint: `FPR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-BARTA`,
    };

    this.devices.push(newDev);
    this.notify();
    return newDev;
  }

  public revokeDevice(deviceId: string): void {
    this.devices = this.devices.filter((d) => d.deviceId !== deviceId);
    this.notify();
  }

  public addCallLog(log: Omit<CallLog, 'id'>): void {
    const newLog: CallLog = {
      id: `call_${Date.now()}`,
      ...log,
    };
    this.callLogs.unshift(newLog);
    this.notify();
  }

  public clearAllData(): void {
    localStorage.clear();
    this.currentUser = INITIAL_CURRENT_USER;
    this.seedInitialData();
    this.notify();
  }
}

export const store = BartaStore.getInstance();
