/**
 * BARTA Main Application
 * Connect Beyond Boundaries — Premium E2EE Messaging & Communication Platform
 * @license Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SidebarNav, NavTab } from './components/layout/SidebarNav';
import { ChatList } from './components/chats/ChatList';
import { ChatArea } from './components/chats/ChatArea';
import { CallsView } from './components/views/CallsView';
import { ContactsView } from './components/views/ContactsView';
import { HelpView } from './components/views/HelpView';
import { CallModal } from './components/calling/CallModal';
import { NewChatModal } from './components/modals/NewChatModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { PrivacyDashboardModal } from './components/modals/PrivacyDashboardModal';
import { DeviceManagementModal } from './components/modals/DeviceManagementModal';
import { ExportZipModal } from './components/modals/ExportZipModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OfflineIndicator } from './components/common/OfflineIndicator';

import { store } from './services/storage/store';
import { BartaCryptoEngine } from './services/crypto/e2ee';
import { BartaCallEngine } from './services/webrtc/callEngine';
import { User, Room, Message, CallType, ActiveCall, CallStatus } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(store.getCurrentUser());
  const [rooms, setRooms] = useState<Room[]>(store.getRooms());
  const [activeRoomId, setActiveRoomId] = useState<string | null>(rooms[0]?.id || null);
  const [activeTab, setActiveTab] = useState<NavTab>('chats');

  // Modals state
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Calling state
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const callEngineRef = useRef<BartaCallEngine>(new BartaCallEngine());

  // Preferences & Theme
  const [preferences, setPreferences] = useState(store.getPreferences());

  // Initialize WebCrypto Identity Keys on launch
  useEffect(() => {
    BartaCryptoEngine.getInstance().initIdentity().then(({ fingerprint, safetyNumber }) => {
      store.updateCurrentUser({
        publicKeyFingerprint: fingerprint,
        safetyNumber,
      });
    });

    const unsubscribe = store.subscribe(() => {
      setCurrentUser(store.getCurrentUser());
      setRooms([...store.getRooms()]);
      setPreferences(store.getPreferences());
    });

    return () => unsubscribe();
  }, []);

  // Configure WebRTC Call Engine Listeners
  useEffect(() => {
    const engine = callEngineRef.current;
    engine.setEvents({
      onStatusChange: (status: CallStatus) => {
        setActiveCall((prev) => (prev ? { ...prev, status } : null));
        if (status === 'ended' || status === 'declined') {
          setTimeout(() => setActiveCall(null), 1200);
        }
      },
      onQualityChange: (quality) => {
        setActiveCall((prev) => (prev ? { ...prev, connectionQuality: quality } : null));
      },
    });
  }, []);

  // Navigation tab switcher handler
  const handleTabChange = (tab: NavTab) => {
    if (tab === 'privacy') {
      setShowPrivacyModal(true);
      return;
    }
    if (tab === 'settings') {
      setShowSettingsModal(true);
      return;
    }
    if (tab === 'devices') {
      setShowDeviceModal(true);
      return;
    }
    if (tab === 'export') {
      setShowExportModal(true);
      return;
    }
    setActiveTab(tab);
  };

  // Start outgoing call
  const handleStartCall = async (peer: User, type: CallType) => {
    const newCall: ActiveCall = {
      id: `call_${Date.now()}`,
      roomId: activeRoomId || 'room_call',
      peerId: peer.id,
      peerUser: peer,
      type,
      status: 'ringing_outgoing',
      duration: 0,
      isMuted: false,
      isVideoEnabled: type === 'video',
      isScreenSharing: false,
      connectionQuality: 'excellent',
    };

    setActiveCall(newCall);

    // Record call log in store
    store.addCallLog({
      roomId: activeRoomId || 'room_call',
      peerUser: peer,
      type,
      direction: 'outgoing',
      timestamp: Date.now(),
      duration: 0,
    });

    await callEngineRef.current.initiateCall(peer, type);
  };

  // Call termination & response handlers
  const handleEndCall = () => {
    callEngineRef.current.endCall();
  };

  const handleAcceptIncomingCall = async () => {
    await callEngineRef.current.answerIncomingCall();
  };

  const handleDeclineIncomingCall = () => {
    callEngineRef.current.declineCall();
  };

  // Sending message
  const handleSendMessage = (
    content: string,
    type: Message['type'] = 'text',
    mediaDetails?: Record<string, unknown>,
    replyTo?: Message['replyTo']
  ) => {
    if (!activeRoomId) return;
    store.sendMessage(
      activeRoomId,
      content,
      type,
      mediaDetails as {
        mediaUrl?: string;
        mediaName?: string;
        mediaSize?: number;
        mediaMime?: string;
        duration?: number;
        waveform?: number[];
      },
      replyTo
    );
  };

  // Calculate total unread messages
  const totalUnread = rooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);

  // Active room messages
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];
  const activeMessages = activeRoom ? store.getMessages(activeRoom.id) : [];

  // Theme styling mapper
  const getThemeClass = (theme: typeof preferences.theme) => {
    switch (theme) {
      case 'emerald':
        return 'bg-[#041410] text-emerald-50';
      case 'sapphire':
        return 'bg-[#061122] text-cyan-50';
      case 'midnight':
        return 'bg-[#0f081c] text-purple-50';
      case 'titanium':
        return 'bg-[#12161f] text-slate-100';
      default:
        return 'bg-[#080c15] text-slate-100';
    }
  };

  return (
    <ErrorBoundary>
      <div className={`h-screen w-screen flex overflow-hidden ${getThemeClass(preferences.theme)} font-sans`}>
        {/* Navigation Sidebar */}
        <SidebarNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          unreadCount={totalUnread}
          currentUser={currentUser}
          onOpenProfile={() => setShowSettingsModal(true)}
        />

        {/* Center Panel (Chats View, Calls View, Contacts, Help) */}
        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'chats' && (
            <>
              {/* Conversation List */}
              <div className={`w-full md:w-auto h-full ${activeRoomId ? 'hidden md:block' : 'block'}`}>
                <ChatList
                  rooms={rooms}
                  activeRoomId={activeRoomId}
                  onSelectRoom={(id) => setActiveRoomId(id)}
                  onOpenNewChat={() => setShowNewChatModal(true)}
                  currentUserId={currentUser.id}
                />
              </div>

              {/* Active Conversation Thread */}
              <div className={`flex-1 h-full ${!activeRoomId ? 'hidden md:flex' : 'flex'}`}>
                {activeRoom ? (
                  <ChatArea
                    room={activeRoom}
                    messages={activeMessages}
                    currentUser={currentUser}
                    onSendMessage={handleSendMessage}
                    onStartCall={handleStartCall}
                    onBackMobile={() => setActiveRoomId(null)}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                    <p className="text-sm">Select an encrypted conversation or start a new chat.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'calls' && (
            <CallsView
              callLogs={store.getCallLogs()}
              onStartCall={handleStartCall}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsView
              contacts={store.getContacts()}
              onStartChat={(targetUser) => {
                const room = store.createDirectRoom(targetUser);
                setActiveRoomId(room.id);
                setActiveTab('chats');
              }}
              onStartCall={handleStartCall}
            />
          )}

          {activeTab === 'help' && <HelpView />}
        </main>

        {/* WebRTC Video / Audio Call Modal */}
        {activeCall && (
          <CallModal
            call={activeCall}
            callEngine={callEngineRef.current}
            onEndCall={handleEndCall}
            onAcceptIncoming={handleAcceptIncomingCall}
            onDeclineIncoming={handleDeclineIncomingCall}
          />
        )}

        {/* Modals */}
        {showNewChatModal && (
          <NewChatModal
            onClose={() => setShowNewChatModal(false)}
            onRoomSelect={(room) => {
              setActiveRoomId(room.id);
              setActiveTab('chats');
            }}
          />
        )}

        {showSettingsModal && (
          <SettingsModal onClose={() => setShowSettingsModal(false)} />
        )}

        {showPrivacyModal && (
          <PrivacyDashboardModal onClose={() => setShowPrivacyModal(false)} />
        )}

        {showDeviceModal && (
          <DeviceManagementModal onClose={() => setShowDeviceModal(false)} />
        )}

        {showExportModal && (
          <ExportZipModal onClose={() => setShowExportModal(false)} />
        )}

        {/* Offline Connectivity Toast */}
        <OfflineIndicator />
      </div>
    </ErrorBoundary>
  );
}
