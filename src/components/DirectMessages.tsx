import { useState, useEffect, useRef } from 'react';
import { database } from '../lib/firebase';
import { ref, push, onValue, set } from 'firebase/database';
import { Send, Smile, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface DirectMessagesProps {
  currentUser: any;
  selectedUser: any;
}

export default function DirectMessages({ currentUser, selectedUser }: DirectMessagesProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = [currentUser.id, selectedUser.id].sort().join('_');

  useEffect(() => {
    if (!selectedUser?.id) return;

    const messagesRef = ref(database, `directMessages/${conversationId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
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
  }, [selectedUser, conversationId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedUser?.id) return;

    try {
      const messagesRef = ref(database, `directMessages/${conversationId}/messages`);
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        content: newMessage,
        authorId: currentUser.id,
        authorName: currentUser.username,
        timestamp: Date.now()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending DM:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-12 px-4 flex items-center border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
            {selectedUser?.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <h3 className="font-semibold text-foreground">{selectedUser?.username}</h3>
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
              <div className="text-4xl mb-2">@</div>
              <p>Start your conversation with {selectedUser?.username}</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex gap-4 group ${message.authorId === currentUser.id ? 'flex-row-reverse' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold flex-shrink-0">
                {message.authorName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`flex items-baseline gap-2 ${message.authorId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                  <span className="font-semibold text-foreground hover:underline cursor-pointer">
                    {message.authorName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className={`inline-block max-w-md p-3 rounded-lg ${
                  message.authorId === currentUser.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-foreground'
                }`}>
                  <p className="break-words">{message.content}</p>
                </div>
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
            placeholder={`Message @${selectedUser?.username}`}
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
