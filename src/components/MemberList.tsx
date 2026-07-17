import { useEffect, useState } from 'react';
import { firestore } from '../lib/firebase';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';

interface MemberListProps {
  server: any;
}

export default function MemberList({ server }: MemberListProps) {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!server?.members) return;

    const fetchMembers = async () => {
      const memberPromises = server.members.map(async (memberId: string) => {
        const userDoc = await getDoc(doc(firestore, 'users', memberId));
        if (userDoc.exists()) {
          return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
      });

      const membersData = await Promise.all(memberPromises);
      setMembers(membersData.filter(Boolean));
    };

    fetchMembers();
  }, [server]);

  return (
    <div className="p-4 overflow-y-auto">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
        Members — {members.length}
      </h3>
      <div className="space-y-1">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary cursor-pointer transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {member.avatar ? (
                  <img src={member.avatar} alt={member.username} className="w-8 h-8 rounded-full" />
                ) : (
                  member.username?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                member.status === 'online' ? 'bg-green-500' :
                member.status === 'idle' ? 'bg-yellow-500' :
                member.status === 'dnd' ? 'bg-red-500' :
                'bg-gray-500'
              }`} />
            </div>
            <span className="text-foreground text-sm">{member.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
