import { useState } from 'react';

interface CreateServerModalProps {
  onClose: () => void;
  onCreateServer: (name: string) => void;
}

export default function CreateServerModal({ onClose, onCreateServer }: CreateServerModalProps) {
  const [serverName, setServerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverName.trim()) {
      onCreateServer(serverName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Create a Server</h2>
        <p className="text-muted-foreground mb-6">
          Your server is where you and your friends hang out. Make yours and start talking.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="serverName" className="block text-sm font-medium text-foreground mb-2">
              Server Name
            </label>
            <input
              id="serverName"
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              required
              maxLength={100}
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              placeholder="My Awesome Server"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
