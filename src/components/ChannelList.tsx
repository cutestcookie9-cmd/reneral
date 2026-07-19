import { Hash, Plus, Settings } from 'lucide-react';

interface ChannelListProps {
  server: any;
  selectedChannel: any;
  onSelectChannel: (channel: any) => void;
  onCreateChannel: () => void;
}

export default function ChannelList({ server, selectedChannel, onSelectChannel, onCreateChannel }: ChannelListProps) {
  const channels = server.channels || [];

  return (
    <div className="flex-1 overflow-y-auto p-2">
      <div className="mb-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2 text-[#949ba4] text-xs font-semibold uppercase tracking-wide">
            <Hash className="w-4 h-4" />
            Text Channels
          </div>
          <button onClick={onCreateChannel} className="text-[#949ba4] hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {channels
          .filter((ch: any) => ch.type === 'text')
          .map((channel: any) => (
            <button
              key={channel.id}
              onClick={() => onSelectChannel(channel)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                selectedChannel?.id === channel.id
                  ? 'bg-[#404249] text-white'
                  : 'text-[#949ba4] hover:bg-[#35373c] hover:text-white'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
      </div>

      <div>
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2 text-[#949ba4] text-xs font-semibold uppercase tracking-wide">
            <Settings className="w-4 h-4" />
            Voice Channels
          </div>
          <button onClick={onCreateChannel} className="text-[#949ba4] hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {channels
          .filter((ch: any) => ch.type === 'voice')
          .map((channel: any) => (
            <button
              key={channel.id}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[#949ba4] hover:bg-[#35373c] hover:text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
