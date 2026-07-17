import { useState, useEffect } from 'react';
import { auth, firestore } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { LogOut, Plus, Settings } from 'lucide-react';
import ServerList from './ServerList';
import ChannelList from './ChannelList';
import ChatArea from './ChatArea';
import MemberList from './MemberList';
import CreateServerModal from './CreateServerModal';

export default function Dashboard() {
  const [servers, setServers] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [showCreateServer, setShowCreateServer] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(firestore, 'servers'),
      where('members', 'array-contains', auth.currentUser.uid)
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
  }, [selectedServer]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleCreateServer = async (name: string) => {
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(firestore, 'servers'), {
        name,
        ownerId: auth.currentUser.uid,
        members: [auth.currentUser.uid],
        channels: [
          {
            id: 'general',
            name: 'general',
            type: 'text',
            createdAt: serverTimestamp()
          }
        ],
        createdAt: serverTimestamp()
      });

      setShowCreateServer(false);
    } catch (error) {
      console.error('Error creating server:', error);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Server Sidebar */}
      <div className="w-18 bg-secondary flex flex-col items-center py-3 gap-2">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold mb-2">
          R
        </div>
        <div className="w-8 h-0.5 bg-border mb-2"></div>
        
        <ServerList
          servers={servers}
          selectedServer={selectedServer}
          onSelectServer={setSelectedServer}
        />

        <button
          onClick={() => setShowCreateServer(true)}
          className="w-12 h-12 bg-secondary hover:bg-green-600 text-green-500 hover:text-white rounded-full flex items-center justify-center transition-colors mt-2"
        >
          <Plus className="w-6 h-6" />
        </button>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-12 h-12 bg-secondary hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-full flex items-center justify-center transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Channel Sidebar */}
      {selectedServer && (
        <div className="w-60 bg-card flex flex-col border-r border-border">
          <div className="h-12 px-4 flex items-center justify-between border-b border-border">
            <h2 className="font-semibold text-foreground truncate">{selectedServer.name}</h2>
            <button className="text-muted-foreground hover:text-foreground">
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <ChannelList
            server={selectedServer}
            selectedChannel={selectedChannel}
            onSelectChannel={setSelectedChannel}
          />
        </div>
      )}

      {/* Main Chat Area */}
      {selectedChannel && (
        <div className="flex-1 flex flex-col">
          <ChatArea
            channel={selectedChannel}
            server={selectedServer}
          />
        </div>
      )}

      {/* Member List */}
      {selectedServer && (
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
