import { useState, useEffect } from 'react';
import { firestore } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDocs } from 'firebase/firestore';
import { LogOut, Plus, Settings, Users, MessageSquare, Copy, Check } from 'lucide-react';
import ServerList from './ServerList';
import ChannelList from './ChannelList';
import ChatArea from './ChatArea';
import MemberList from './MemberList';
import CreateServerModal from './CreateServerModal';
import FriendsList from './FriendsList';
import DirectMessages from './DirectMessages';

interface DashboardProps {
  currentUser: any;
  onLogout: () => void;
}

export default function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [view, setView] = useState<'servers' | 'friends' | 'dm'>('servers');
  const [selectedDMUser, setSelectedDMUser] = useState<any>(null);
  const [copiedInviteCode, setCopiedInviteCode] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(firestore, 'servers'),
      where('members', 'array-contains', currentUser.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serversData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServers(serversData);
      if (serversData.length > 0 && !selectedServer) {
        setSelectedServer(serversData[0]);
      }
    });

    return () => unsubscribe();
  }, [selectedServer, currentUser]);

  const handleCreateServer = async (name: string) => {
    if (!currentUser) return;

    try {
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      await addDoc(collection(firestore, 'servers'), {
        name,
        ownerId: currentUser.id,
        members: [currentUser.id],
        channels: [
          {
            id: 'general',
            name: 'general',
            type: 'text',
            createdAt: Date.now()
          }
        ],
        inviteCode,
        createdAt: serverTimestamp()
      });

      setShowCreateServer(false);
    } catch (error) {
      console.error('Error creating server:', error);
    }
  };

  const handleCopyInviteCode = (server: any) => {
    if (server.inviteCode) {
      navigator.clipboard.writeText(server.inviteCode);
      setCopiedInviteCode(server.id);
      setTimeout(() => setCopiedInviteCode(null), 2000);
    }
  };

  const handleJoinServer = async (inviteCode: string) => {
    try {
      const q = query(
        collection(firestore, 'servers'),
        where('inviteCode', '==', inviteCode.toUpperCase())
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const serverDoc = snapshot.docs[0];
        const serverData = serverDoc.data();
        
        if (!serverData.members.includes(currentUser.id)) {
          await updateDoc(doc(firestore, 'servers', serverDoc.id), {
            members: [...serverData.members, currentUser.id]
          });
        }
      }
    } catch (error) {
      console.error('Error joining server:', error);
    }
  };

  const handleSelectDM = (userId: string, username: string) => {
    setSelectedDMUser({ id: userId, username });
    setView('dm');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Server Sidebar */}
      <div className="w-18 bg-secondary flex flex-col items-center py-3 gap-2">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold mb-2">
          R
        </div>
        <div className="w-8 h-0.5 bg-border mb-2"></div>
        
        <button
          onClick={() => setView('servers')}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${view === 'servers' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
        >
          <MessageSquare className="w-6 h-6" />
        </button>

        <button
          onClick={() => setView('friends')}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${view === 'friends' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="w-6 h-6" />
        </button>

        <div className="w-8 h-0.5 bg-border mb-2"></div>
        
        {view === 'servers' && (
          <>
            <ServerList
              servers={servers}
              selectedServer={selectedServer}
              onSelectServer={(server: any) => {
                setSelectedServer(server);
                setSelectedChannel(null);
                setView('servers');
              }}
            />

            <button
              onClick={() => setShowCreateServer(true)}
              className="w-12 h-12 bg-secondary hover:bg-green-600 text-green-500 hover:text-white rounded-full flex items-center justify-center transition-colors mt-2"
            >
              <Plus className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="w-12 h-12 bg-secondary hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Channel Sidebar / Friends Sidebar */}
      {view === 'servers' && selectedServer && (
        <div className="w-60 bg-card flex flex-col border-r border-border">
          <div className="h-12 px-4 flex items-center justify-between border-b border-border">
            <h2 className="font-semibold text-foreground truncate">{selectedServer.name}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopyInviteCode(selectedServer)}
                className="text-muted-foreground hover:text-foreground"
                title="Copy invite code"
              >
                {copiedInviteCode === selectedServer.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
              <button className="text-muted-foreground hover:text-foreground">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-3 border-b border-border">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter invite code"
                className="flex-1 px-2 py-1 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinServer(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>

          <ChannelList
            server={selectedServer}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
          />
        </div>
      )}

      {view === 'friends' && (
        <div className="w-60 bg-card flex flex-col border-r border-border">
          <FriendsList currentUser={currentUser} onSelectDM={handleSelectDM} />
        </div>
      )}

      {/* Main Chat Area */}
      {view === 'servers' && selectedChannel && (
        <div className="flex-1 flex flex-col">
          <ChatArea
            channel={selectedChannel}
            server={selectedServer}
            currentUser={currentUser}
          />
        </div>
      )}

      {view === 'dm' && selectedDMUser && (
        <div className="flex-1 flex flex-col">
          <DirectMessages currentUser={currentUser} selectedUser={selectedDMUser} />
        </div>
      )}

      {/* Member List */}
      {view === 'servers' && selectedServer && (
        <div className="w-60 bg-card border-l border-border hidden lg:block">
          <MemberList server={selectedServer} />
        </div>
      )}

      {showCreateServer && (
        <CreateServerModal
          onClose={() => setShowCreateServer(false)}
          onCreateServer={handleCreateServer}
        />
      )}
    </div>
  );
}
