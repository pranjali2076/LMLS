import { SessionHistoryItem, ChatMessage, UserSession } from '@/types';

export const mockCurrentUser: UserSession = {
  id: 'usr_8921a',
  name: 'Alex Rivera',
  username: 'alex.rivera',
  email: 'alex.rivera@lmls.ai',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  role: 'Senior Research Architect',
};

// Initial empty session history for clean LMLS start
export const initialHistorySessions: SessionHistoryItem[] = [];

// Initial empty chat messages
export const initialMessages: Record<string, ChatMessage[]> = {};
