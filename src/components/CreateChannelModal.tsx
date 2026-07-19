import { useState } from 'react';
import { X, Hash, Volume2 } from 'lucide-react';

interface CreateChannelModalProps {
  onClose: () => void;
  onCreateChannel: (name: string, type: 'text' | 'voice') => void;
}

export default function CreateChannelModal({ onClose, onCreateChannel }: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'voice'>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateChannel(name.trim().toLowerCase(), type);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#313338] rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create Channel</h2>
          <button onClick={onClose} className="text-[#b5bac1] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Channel Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('text')}
                className={`flex-1 p-3 rounded-md border border-[#1e1f22] flex items-center justify-center gap-2 transition-colors ${
                  type === 'text' ? 'bg-[#5865f2] text-white border-[#5865f2]' : 'bg-[#1e1f22] text-[#b5bac1] hover:bg-[#2b2d31]'
                }`}
              >
                <Hash className="w-5 h-5" />
                <span>Text</span>
              </button>
              <button
                type="button"
                onClick={() => setType('voice')}
                className={`flex-1 p-3 rounded-md border border-[#1e1f22] flex items-center justify-center gap-2 transition-colors ${
                  type === 'voice' ? 'bg-[#5865f2] text-white border-[#5865f2]' : 'bg-[#1e1f22] text-[#b5bac1] hover:bg-[#2b2d31]'
                }`}
              >
                <Volume2 className="w-5 h-5" />
                <span>Voice</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="channelName" className="block text-sm font-medium text-white mb-2">
              Channel Name
            </label>
            <input
              id="channelName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="new-channel"
              className="w-full px-4 py-2 bg-[#1e1f22] border border-[#1e1f22] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5865f2] text-white placeholder-[#949ba4]"
              required
              pattern="^[a-z0-9-]+$"
              title="Only lowercase letters, numbers, and hyphens"
            />
            <p className="text-xs text-[#949ba4] mt-1">Lowercase letters, numbers, and hyphens only</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white hover:bg-[#2b2d31] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-md transition-colors"
            >
              Create Channel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
