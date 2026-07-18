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
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
            <Hash className="w-4 h-4" />
            Text Channels
          </div>
          <button onClick={onCreateChannel} className="text-muted-foreground hover:text-foreground">
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
                  ? 'bg-primary/20 text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
      </div>

      <div>
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase">
            <Settings className="w-4 h-4" />
            Voice Channels
          </div>
          <button onClick={onCreateChannel} className="text-muted-foreground hover:text-foreground">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {channels
          .filter((ch: any) => ch.type === 'voice')
          .map((channel: any) => (
            <button
              key={channel.id}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
