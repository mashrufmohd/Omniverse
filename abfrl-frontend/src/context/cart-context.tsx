'use client'

import { createContext, useContext, useReducer, ReactNode, useState, useEffect, useCallback } from 'react'
import { Product, CartItem } from '@/types'
import api from '@/lib/api'
import { DEFAULT_USER_ID } from '@/lib/constants'

interface CartState {
  cart: CartItem[]
  summary: {
    subtotal: number
    shipping: number
    discount: number
    total: number
    discountCode?: string | null
  }
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product & { selectedSize?: string, selectedColor?: string } }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: { items: CartItem[], summary: CartState['summary'] } }

const calculateSummary = (cart: CartItem[]) => {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  return {
    subtotal,
    shipping: 0,
    discount: 0,
    total: subtotal,
    discountCode: null
  }
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART':
      // Optimistic update logic (can be kept or removed if we rely solely on API)
      // For now, we'll rely on SET_CART from API response to ensure sync
      return state
    case 'REMOVE_FROM_CART':
      return state
    case 'UPDATE_QUANTITY':
      return state
    case 'CLEAR_CART':
      return { ...state, cart: [], summary: calculateSummary([]) }
    case 'SET_CART':
      return { ...state, cart: action.payload.items, summary: action.payload.summary }
    default:
      return state
  }
}

const CartContext = createContext<{
  cart: CartItem[]
  summary: CartState['summary']
  addToCart: (product: Product & { selectedSize?: string, selectedColor?: string }) => void
  removeFromCart: (id: number, size?: string) => void
  updateQuantity: (id: number, quantity: number, size?: string) => void
  clearCart: () => void
  setCart: (data: { items: CartItem[], summary: CartState['summary'] }) => void
  refreshCart: () => Promise<void>
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
} | null>(null)

const mapBackendCartToFrontend = (data: any) => {
  const backendItems = data.items
  const frontendItems: CartItem[] = backendItems.map((item: any) => ({
    id: item.product_id,
    name: item.product_name,
    price: item.price,
    quantity: item.quantity,
    imageUrl: item.image_url,
    image_url: item.image_url,
    description: '',
    selectedSize: item.size
  }))
  
  const summary = {
    subtotal: data.subtotal,
    shipping: data.shipping,
    discount: data.discount,
    total: data.total,
    discountCode: data.discount_code
  }
  return { items: frontendItems, summary }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { 
    cart: [], 
    summary: { subtotal: 0, shipping: 0, discount: 0, total: 0, discountCode: null } 
  })
  const [isCartOpen, setIsCartOpen] = useState(false)

  const fetchCart = useCallback(async () => {
    try {
      // We don't pass discount code here, the backend should remember it if we persisted it
      // But wait, the backend get_cart endpoint takes discount_code as query param optionally
      // If we persisted it in the Cart model, we don't need to pass it.
      // Let's assume the backend handles it now.
      const response = await api.get(`/api/v1/cart/?user_id=${DEFAULT_USER_ID}`)
      const { items, summary } = mapBackendCartToFrontend(response.data)
      dispatch({ type: 'SET_CART', payload: { items, summary } })
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    }
  }, [])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const addToCart = async (product: Product & { selectedSize?: string, selectedColor?: string }) => {
    try {
        const response = await api.post('/api/v1/cart/add', {
            user_id: DEFAULT_USER_ID,
            product_id: product.id,
            quantity: 1,
            size: product.selectedSize
        })
        const { items, summary } = mapBackendCartToFrontend(response.data)
        dispatch({ type: 'SET_CART', payload: { items, summary } })
        setIsCartOpen(true)
    } catch (error) {
        console.error("Failed to add to cart:", error)
    }
  }

  const removeFromCart = async (id: number, size?: string) => {
    try {
        // If size is not provided, try to find it from current cart state
        let targetSize = size;
        if (!targetSize) {
            const item = state.cart.find(i => i.id === id);
            if (item) targetSize = item.selectedSize;
        }

        const response = await api.post('/api/v1/cart/remove', {
            user_id: DEFAULT_USER_ID,
            product_id: id,
            size: targetSize
        })
        const { items, summary } = mapBackendCartToFrontend(response.data)
        dispatch({ type: 'SET_CART', payload: { items, summary } })
    } catch (error) {
        console.error("Failed to remove from cart:", error)
    }
  }

  const updateQuantity = async (id: number, quantity: number, size?: string) => {
    try {
        let targetSize = size;
        if (!targetSize) {
            const item = state.cart.find(i => i.id === id);
            if (item) targetSize = item.selectedSize;
        }

        const response = await api.post('/api/v1/cart/update', {
            user_id: DEFAULT_USER_ID,
            product_id: id,
            quantity: quantity,
            size: targetSize
        })
        const { items, summary } = mapBackendCartToFrontend(response.data)
        dispatch({ type: 'SET_CART', payload: { items, summary } })
    } catch (error) {
        console.error("Failed to update quantity:", error)
    }
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    // TODO: Call API to clear cart if needed
  }

  const setCart = (data: { items: CartItem[], summary: CartState['summary'] }) => {
    dispatch({ type: 'SET_CART', payload: data })
  }

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  return (
    <CartContext.Provider value={{ 
      ...state, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      setCart,
      refreshCart: fetchCart,
      isCartOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext }