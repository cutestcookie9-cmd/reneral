import { useState, useEffect, useRef } from 'react';
import { database } from '../lib/firebase';
import { ref, push, onValue, set } from 'firebase/database';
import { Send, Smile, MoreVertical, Image, Gift } from 'lucide-react';
import { format } from 'date-fns';
import EmojiPicker from './EmojiPicker';
import GifPicker from './GifPicker';

interface ChatAreaProps {
  channel: any;
  server: any;
  currentUser: any;
}

export default function ChatArea({ channel, server, currentUser }: ChatAreaProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!channel?.id || !server?.id) return;

    // Use Real-time Database for real-time messaging
    const messagesRef = ref(database, `servers/${server.id}/channels/${channel.id}/messages`);

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
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [channel, server]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !channel?.id || !server?.id) return;

    try {
      const messagesRef = ref(database, `servers/${server.id}/channels/${channel.id}/messages`);
      const newMessageRef = push(messagesRef);
      
      console.log('Sending message to:', `servers/${server.id}/channels/${channel.id}/messages`);
      console.log('Message data:', {
        content: newMessage,
        authorId: currentUser.id,
        authorName: currentUser.username,
        timestamp: Date.now()
      });
      
      await set(newMessageRef, {
        content: newMessage,
        authorId: currentUser.id,
        authorName: currentUser.username,
        timestamp: Date.now()
      });

      setNewMessage('');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Check console for details.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('https://api.imgbb.com/1/upload?key=756edd853b4d23cee872be8b2d41ac77', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        const imageUrl = data.data.url;
        
        const messagesRef = ref(database, `servers/${server.id}/channels/${channel.id}/messages`);
        const newMessageRef = push(messagesRef);
        
        await set(newMessageRef, {
          content: imageUrl,
          authorId: currentUser.id,
          authorName: currentUser.username,
          timestamp: Date.now(),
          isImage: true
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGifSelect = async (gifUrl: string) => {
    try {
      const messagesRef = ref(database, `servers/${server.id}/channels/${channel.id}/messages`);
      const newMessageRef = push(messagesRef);
      
      await set(newMessageRef, {
        content: gifUrl,
        authorId: currentUser.id,
        authorName: currentUser.username,
        timestamp: Date.now(),
        isGif: true
      });
    } catch (error) {
      console.error('Error sending GIF:', error);
      alert('Failed to send GIF');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-12 px-4 flex items-center border-b border-[#1e1f22] bg-[#313338] shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl text-[#949ba4]">#</span>
          <h3 className="font-semibold text-white">{channel?.name}</h3>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="text-[#b5bac1] hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#949ba4]">
            <div className="text-center">
              <div className="text-4xl mb-2">#</div>
              <p>Welcome to #{channel?.name}</p>
              <p className="text-sm">This is the start of the channel.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-4 group">
              <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-semibold flex-shrink-0">
                {message.authorAvatar ? (
                  <img src={message.authorAvatar} alt={message.authorName} className="w-10 h-10 rounded-full" />
                ) : (
                  message.authorName?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-white hover:underline cursor-pointer">
                    {message.authorName}
                  </span>
                  <span className="text-xs text-[#949ba4]">
                    {format(new Date(message.timestamp), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                {message.isImage ? (
                  <img src={message.content} alt="Uploaded image" className="max-w-md rounded-lg" />
                ) : message.isGif ? (
                  <img src={message.content} alt="GIF" className="max-w-md rounded-lg" />
                ) : (
                  <p className="text-[#dbdee1] break-words">{message.content}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#313338] border-t border-[#1e1f22]">
        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-[#b5bac1] hover:text-white transition-colors"
            >
              <Smile className="w-6 h-6" />
            </button>
            {showEmojiPicker && (
              <EmojiPicker
                onSelect={(emoji) => setNewMessage(prev => prev + emoji)}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowGifPicker(!showGifPicker)}
              className="p-2 text-[#b5bac1] hover:text-white transition-colors"
            >
              <Gift className="w-6 h-6" />
            </button>
            {showGifPicker && (
              <GifPicker
                onSelect={handleGifSelect}
                onClose={() => setShowGifPicker(false)}
              />
            )}
          </div>
          
          <label className="p-2 text-[#b5bac1] hover:text-white transition-colors cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
            {uploadingImage ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-[#5865f2] border-t-transparent" />
            ) : (
              <Image className="w-6 h-6" />
            )}
          </label>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message #${channel?.name}`}
            className="flex-1 px-4 py-2 bg-[#383a40] border border-[#383a40] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865f2] text-white placeholder-[#949ba4]"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
}
