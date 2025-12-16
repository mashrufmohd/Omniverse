import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message } from '@/types';
import api from '@/lib/api';

export interface ChatMessage {
  id?: string;
  userId: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Timestamp;
  products?: any[];
}

export const chatService = {
  // Save message to Firestore
  async saveMessage(userId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const chatRef = collection(db, 'chats');
    const docRef = await addDoc(chatRef, {
      ...message,
      userId,
      timestamp: Timestamp.now(),
    });
    return docRef.id;
  },

  // Get user's chat history
  async getChatHistory(userId: string): Promise<Message[]> {
    const chatRef = collection(db, 'chats');
    const q = query(
      chatRef, 
      where('userId', '==', userId),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        text: data.text,
        sender: data.sender,
        timestamp: data.timestamp.toDate(),
        products: data.products || [],
      });
    });

    return messages;
  },

  // Clear user's chat history
  async clearChatHistory(userId: string) {
    const chatRef = collection(db, 'chats');
    const q = query(chatRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    const deletePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { deleted: true })
    );

    await Promise.all(deletePromises);
  },

  // Stream chat response with typing effect
  async streamChatResponse(
    userId: string, 
    message: string, 
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
          channel: 'web'
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
