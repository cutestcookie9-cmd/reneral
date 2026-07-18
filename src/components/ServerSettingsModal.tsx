import { useState } from 'react';
import { X, Hash, Users, Trash2, Copy, Check } from 'lucide-react';

interface ServerSettingsModalProps {
  server: any;
  currentUser: any;
  onClose: () => void;
  onUpdateServer: (updates: any) => void;
  onDeleteServer: () => void;
}

export default function ServerSettingsModal({ server, currentUser, onClose, onUpdateServer, onDeleteServer }: ServerSettingsModalProps) {
  const [serverName, setServerName] = useState(server.name || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const isOwner = server.ownerId === currentUser.id;

  const handleSave = () => {
    if (serverName.trim()) {
      onUpdateServer({ name: serverName.trim() });
      onClose();
    }
  };

  const handleCopyInviteCode = () => {
    if (server.inviteCode) {
      navigator.clipboard.writeText(server.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Server Overview</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Server Icon */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-3xl">
              {serverName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{serverName}</h3>
              <p className="text-sm text-muted-foreground">Server ID: {server.id}</p>
            </div>
          </div>
        </div>

        {/* Server Name */}
        <div className="p-6 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">Server Name</h3>
          <input
            type="text"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            disabled={!isOwner}
          />
        </div>

        {/* Invite Code */}
        <div className="p-6 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">Invite Code</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={server.inviteCode || ''}
              readOnly
              className="flex-1 px-4 py-2 bg-background border border-border rounded-md text-foreground"
            />
            <button
              onClick={handleCopyInviteCode}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
            >
              {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Share this code with friends to let them join your server.</p>
        </div>

        {/* Server Stats */}
        <div className="p-6 border-b border-border">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">Server Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{server.members?.length || 0} Members</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">{server.channels?.length || 0} Channels</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        {isOwner && (
          <div className="p-6">
            <h3 className="text-xs font-semibold text-destructive uppercase mb-4">Danger Zone</h3>
            <button
              onClick={onDeleteServer}
              className="flex items-center gap-2 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete Server
            </button>
          </div>
        )}

        {/* Footer */}
        {isOwner && (
          <div className="p-6 border-t border-border flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-foreground hover:bg-secondary rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
