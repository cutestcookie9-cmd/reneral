import { useState, useEffect } from 'react';
import { firestore } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';
import { UserPlus, UserMinus, X, MessageCircle } from 'lucide-react';

interface FriendsListProps {
  currentUser: any;
  onSelectDM: (userId: string, username: string) => void;
}

export default function FriendsList({ currentUser, onSelectDM }: FriendsListProps) {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // Listen for friend requests
    const requestsQuery = query(
      collection(firestore, 'friendRequests'),
      where('toUserId', '==', currentUser.id),
      where('status', '==', 'pending')
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFriendRequests(requests);
    });

    // Listen for friendships
    const friendshipsQuery = query(
      collection(firestore, 'friendships'),
      where('userId1', '==', currentUser.id)
    );

    const unsubscribeFriendships1 = onSnapshot(friendshipsQuery, (snapshot) => {
      const friendships = snapshot.docs.map(doc => doc.data());
      loadFriends(friendships, 'userId2');
    });

    const friendshipsQuery2 = query(
      collection(firestore, 'friendships'),
      where('userId2', '==', currentUser.id)
    );

    const unsubscribeFriendships2 = onSnapshot(friendshipsQuery2, (snapshot) => {
      const friendships = snapshot.docs.map(doc => doc.data());
      loadFriends(friendships, 'userId1');
    });

    return () => {
      unsubscribeRequests();
      unsubscribeFriendships1();
      unsubscribeFriendships2();
    };
  }, [currentUser]);

  const loadFriends = async (friendships: any[], otherUserIdField: string) => {
    const friendIds = friendships.map(f => f[otherUserIdField]);
    if (friendIds.length === 0) {
      setFriends([]);
      return;
    }

    const usersQuery = query(
      collection(firestore, 'users'),
      where('__name__', 'in', friendIds)
    );

    const snapshot = await getDocs(usersQuery);
    const friendsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setFriends(friendsData);
  };

  const searchUser = async () => {
    if (!searchUsername.trim()) return;

    const q = query(
      collection(firestore, 'users'),
      where('username', '==', searchUsername.toLowerCase())
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const user = snapshot.docs[0];
      const userData = user.data();
      if (user.id !== currentUser.id) {
        setSearchResult({
          id: user.id,
          ...userData
        });
      } else {
        setSearchResult(null);
      }
    } else {
      setSearchResult(null);
    }
  };

  const sendFriendRequest = async () => {
    if (!searchResult) return;

    try {
      await addDoc(collection(firestore, 'friendRequests'), {
        fromUserId: currentUser.id,
        fromUsername: currentUser.username,
        toUserId: searchResult.id,
        status: 'pending',
        createdAt: Date.now()
      });
      setSearchResult(null);
      setSearchUsername('');
      setShowAddFriend(false);
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const acceptFriendRequest = async (requestId: string, fromUserId: string) => {
    try {
      await updateDoc(doc(firestore, 'friendRequests', requestId), {
        status: 'accepted'
      });

      await addDoc(collection(firestore, 'friendships'), {
        userId1: currentUser.id,
        userId2: fromUserId,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(firestore, 'friendRequests', requestId), {
        status: 'declined'
      });
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      const q = query(
        collection(firestore, 'friendships'),
        where('userId1', '==', currentUser.id),
        where('userId2', '==', friendId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        await deleteDoc(doc(firestore, 'friendships', snapshot.docs[0].id));
        return;
      }

      const q2 = query(
        collection(firestore, 'friendships'),
        where('userId1', '==', friendId),
        where('userId2', '==', currentUser.id)
      );
      const snapshot2 = await getDocs(q2);
      if (!snapshot2.empty) {
        await deleteDoc(doc(firestore, 'friendships', snapshot2.docs[0].id));
      }
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Friends</h2>
          <button
            onClick={() => setShowAddFriend(!showAddFriend)}
            className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {showAddFriend && (
          <div className="space-y-2">
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={searchUser}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-1 px-3 rounded-md text-sm transition-colors"
              >
                Search
              </button>
              <button
                onClick={() => {
                  setShowAddFriend(false);
                  setSearchUsername('');
                  setSearchResult(null);
                }}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {searchResult && (
              <div className="flex items-center justify-between p-2 bg-background rounded-md">
                <span className="text-foreground text-sm">{searchResult.username}</span>
                <button
                  onClick={sendFriendRequest}
                  className="p-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {friendRequests.length > 0 && (
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">Pending Requests</h3>
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-2 bg-background rounded-md mb-2">
                <span className="text-foreground text-sm">{request.fromUsername}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(request.id, request.fromUserId)}
                    className="p-1 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => declineFriendRequest(request.id)}
                    className="p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-4">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">All Friends</h3>
          {friends.length === 0 ? (
            <p className="text-sm text-muted-foreground">No friends yet. Add some!</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-2 bg-background rounded-md mb-2 group">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-foreground text-sm">{friend.username}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onSelectDM(friend.id, friend.username)}
                    className="p-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="p-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md transition-colors"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
