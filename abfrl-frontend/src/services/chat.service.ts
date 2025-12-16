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
};
