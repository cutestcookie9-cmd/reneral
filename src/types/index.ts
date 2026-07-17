export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  createdAt: number;
}

export interface Server {
  id: string;
  name: string;
  icon?: string;
  ownerId: string;
  members: string[];
  channels: Channel[];
  inviteCode?: string;
  createdAt: number;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  serverId: string;
  createdAt: number;
}

export interface Message {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  channelId: string;
  serverId: string;
  timestamp: number;
  reactions?: Reaction[];
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface DirectMessage {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  recipientId: string;
  timestamp: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

export interface Friendship {
  id: string;
  userId1: string;
  userId2: string;
  createdAt: number;
}
