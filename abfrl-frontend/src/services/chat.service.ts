import { Message } from '@/types';
import api from '@/lib/api';

export interface ChatMessage {
  id?: string;
  userId: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  products?: any[];
}

export const chatService = {
  // Chat messages are automatically saved by backend, no need for separate save

  // Get user's chat history from MongoDB
  async getChatHistory(userId: string): Promise<Message[]> {
    try {
      const response = await api.get(`/api/v1/chat/history/${userId}`);
      
      if (response.data.success) {
        return response.data.messages.map((msg: any) => ({
          id: msg.timestamp,
          text: msg.content,
          sender: msg.role === 'user' ? 'user' : 'ai',
          timestamp: new Date(msg.timestamp),
          products: [],
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  },

  // Clear user's chat history from MongoDB
  async clearChatHistory(userId: string) {
    try {
      await api.delete(`/api/v1/chat/history/${userId}`);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  },

  // Stream chat response with typing effect
  async streamChatResponse(
    userId: string, 
    message: string,
    sessionId: string | undefined,
    onChunk: (text: string) => void,
    onComplete: (data: any) => void,
    onError: (error: string) => void
  ) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          message: message,
          channel: 'web',
          session_id: sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Stream request failed');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                onError(data.error);
                return;
              }

              if (data.content) {
                onChunk(data.content);
              }

              if (data.done) {
                onComplete(data);
                return;
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error);
      onError(error instanceof Error ? error.message : 'Stream failed');
    }
  },
};
