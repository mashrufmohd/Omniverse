import { 
  collection, 
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  size?: string;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  status: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: Timestamp;
}

export const ordersFirestoreService = {
  // Create a new order
  async createOrder(userId: string, orderData: Omit<Order, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      const ordersRef = collection(db, 'orders');
      const docRef = await addDoc(ordersRef, {
        ...orderData,
        userId,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user's orders
  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];

      querySnapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        } as Order);
      });

      return orders;
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  },

  // Get order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('__name__', '==', orderId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Order;
      }
      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }
};
