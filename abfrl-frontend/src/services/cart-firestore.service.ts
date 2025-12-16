import { 
  collection, 
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  image_url?: string;
  description?: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  discountCode?: string;
}

export interface UserCart {
  items: CartItem[];
  summary: CartSummary;
  updatedAt: Date;
}

export const cartFirestoreService = {
  // Get user's cart
  async getCart(userId: string): Promise<UserCart | null> {
    try {
      const cartRef = doc(db, 'carts', userId);
      const cartSnap = await getDoc(cartRef);

      if (cartSnap.exists()) {
        return cartSnap.data() as UserCart;
      }
      return null;
    } catch (error) {
      console.error('Error getting cart:', error);
      return null;
    }
  },

  // Save user's cart
  async saveCart(userId: string, cart: UserCart): Promise<void> {
    try {
      const cartRef = doc(db, 'carts', userId);
      
      // Remove undefined values from cart items
      const cleanedItems = cart.items.map(item => {
        const cleaned: any = {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }
        if (item.imageUrl) cleaned.imageUrl = item.imageUrl
        if (item.image_url) cleaned.image_url = item.image_url
        if (item.description) cleaned.description = item.description
        if (item.selectedSize) cleaned.selectedSize = item.selectedSize
        if (item.selectedColor) cleaned.selectedColor = item.selectedColor
        return cleaned
      })
      
      // Remove undefined values from summary
      const cleanedSummary: any = {
        subtotal: cart.summary.subtotal,
        shipping: cart.summary.shipping,
        discount: cart.summary.discount,
        total: cart.summary.total,
      }
      if (cart.summary.discountCode) {
        cleanedSummary.discountCode = cart.summary.discountCode
      }
      
      await setDoc(cartRef, {
        items: cleanedItems,
        summary: cleanedSummary,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving cart:', error);
      throw error;
    }
  },

  // Update cart items
  async updateCartItems(userId: string, items: CartItem[]): Promise<void> {
    try {
      const cartRef = doc(db, 'carts', userId);
      await updateDoc(cartRef, {
        items,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating cart items:', error);
      throw error;
    }
  },

  // Clear user's cart
  async clearCart(userId: string): Promise<void> {
    try {
      const cartRef = doc(db, 'carts', userId);
      await setDoc(cartRef, {
        items: [],
        summary: {
          subtotal: 0,
          shipping: 0,
          discount: 0,
          total: 0
        },
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Listen to cart changes in real-time
  subscribeToCart(userId: string, callback: (cart: UserCart | null) => void) {
    const cartRef = doc(db, 'carts', userId);
    return onSnapshot(cartRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserCart);
      } else {
        callback(null);
      }
    });
  }
};
