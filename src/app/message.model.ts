import {User} from './user.model'

export interface Message {
    id?: number;
    senderId: number;
    receiverId: number;
    conversationId: number;
    content: string;
    timestamp?: Date;
    isRead?: boolean;
  }
  
  export interface Conversation {
    id: number;
    title: string;
    participants: { userId: number; user: User }[];
    messages?: Message[];
  }
  