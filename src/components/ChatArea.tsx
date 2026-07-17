import { useState, useEffect, useRef } from 'react';
import { auth, firestore, database } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, push, onValue, set } from 'firebase/database';
import { Send, Smile, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface ChatAreaProps {
  channel: any;
  server: any;
}

export default function ChatArea({ channel, server }: ChatAreaProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!channel?.id || !server?.id) return;

    // Use Real-time Database for real-time messaging
    const messagesRef = ref(database, `servers/${server.id}/channels/${channel.id}/messages`);
    const messagesQuery = query(messagesRef);

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value
        }));
        setMessages(messagesArray);
      } else {
        setMessages([]);
      }
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [channel, server]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser || !channel?.id || !server?.id) return;

    try {
      const messagesRef = ref(database, `servers/${server.id}/channels/${channel.id}/messages`);
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        content: newMessage,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous',
        authorAvatar: auth.currentUser.photoURL,
        timestamp: Date.now()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-12 px-4 flex items-center border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <span className="text-xl text-muted-foreground">#</span>
          <h3 className="font-semibold text-foreground">{channel?.name}</h3>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">#</div>
              <p>Welcome to #{channel?.name}</p>
              <p className="text-sm">This is the start of the channel.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                {message.authorAvatar ? (
                  <img src={message.authorAvatar} alt={message.authorName} className="w-10 h-10 rounded-full" />
                ) : (
                  message.authorName?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground hover:underline cursor-pointer">
                    {message.authorName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <p className="text-foreground break-words">{message.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <button
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Smile className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${channel?.name}`}
            className="flex-1 px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
