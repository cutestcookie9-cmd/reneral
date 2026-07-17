
interface ServerListProps {
  servers: any[];
  selectedServer: any;
  onSelectServer: (server: any) => void;
}

export default function ServerList({ servers, selectedServer, onSelectServer }: ServerListProps) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto">
      {servers.map((server) => (
        <button
          key={server.id}
          onClick={() => onSelectServer(server)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold transition-all hover:rounded-xl ${
            selectedServer?.id === server.id
              ? 'bg-primary rounded-xl'
              : 'bg-secondary hover:bg-primary'
          }`}
          title={server.name}
        >
          {server.icon ? (
            <img src={server.icon} alt={server.name} className="w-8 h-8 rounded-full" />
          ) : (
            <span className="text-lg">{server.name.charAt(0).toUpperCase()}</span>
          )}
        </button>
      ))}
    </div>
  );
}
