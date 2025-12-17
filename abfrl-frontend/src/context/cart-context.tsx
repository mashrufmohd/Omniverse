'use client'

import { createContext, useContext, useReducer, ReactNode, useState, useEffect, useCallback } from 'react'
import { Product, CartItem } from '@/types'
import { useAuthContext } from '@/context/auth-context'
import api from '@/lib/api'

interface CartState {
  cart: CartItem[]
  summary: {
    subtotal: number
    shipping: number
    discount: number
    total: number
    discountCode?: string
  }
}

type CartAction =
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: { items: CartItem[], summary: CartState['summary'] } }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'CLEAR_CART':
      return { ...state, cart: [], summary: { subtotal: 0, shipping: 0, discount: 0, total: 0, discountCode: undefined } }
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

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { 
    cart: [], 
    summary: { subtotal: 0, shipping: 0, discount: 0, total: 0, discountCode: undefined } 
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { user } = useAuthContext()

  // Fetch cart from MongoDB via backend API
  const fetchCartFromBackend = useCallback(async () => {
    if (!user?.uid) return
    try {
      const response = await api.get(`/api/v1/cart/?user_id=${user.uid}`)
      const cartData = response.data
      
      // Transform backend cart format to frontend format
      const items: CartItem[] = cartData.items.map((item: any) => ({
        id: parseInt(item.id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.image_url,
        image_url: item.image_url,
        selectedSize: item.size,
      }))
      
      const summary = {
        subtotal: cartData.subtotal,
        shipping: cartData.shipping,
        discount: cartData.discount,
        total: cartData.total,
        discountCode: cartData.discount_code
      }
      
      dispatch({ type: 'SET_CART', payload: { items, summary } })
    } catch (error) {
      console.error("Failed to fetch cart from backend:", error)
    }
  }, [user?.uid])

  useEffect(() => {
    if (!user?.uid) {
      dispatch({ type: 'CLEAR_CART' })
      return
    }

    fetchCartFromBackend()
    // No polling - only fetch on demand when cart operations happen
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  const addToCart = async (product: Product & { selectedSize?: string, selectedColor?: string }) => {
    if (!user?.uid) {
      console.error('User not logged in')
      alert('Please login to add items to cart')
      return
    }
    
    console.log('addToCart called with:', { user_id: user.uid, product_id: product.id, size: product.selectedSize })
    
    try {
        // Add to MongoDB via backend API
        const response = await api.post('/api/v1/cart/add', {
          user_id: user.uid,
          product_id: product.id.toString(),
          quantity: 1,
          size: product.selectedSize
        })
        
        console.log('Cart add response:', response.data)

        // Refresh cart from backend to get updated state
        await fetchCartFromBackend()
        setIsCartOpen(true)
    } catch (error: any) {
        console.error("Failed to add to cart:", error)
        console.error("Error details:", error.response?.data)
        alert(`Failed to add to cart: ${error.response?.data?.detail || error.message}`)
    }
  }

  const removeFromCart = async (id: number, size?: string) => {
    if (!user?.uid) return
    try {
        // Remove from MongoDB via backend API
        await api.post('/api/v1/cart/remove', {
          user_id: user.uid,
          product_id: id.toString(),
          size: size,
          quantity: 0
        })

        // Refresh cart from backend
        await fetchCartFromBackend()
    } catch (error) {
        console.error("Failed to remove from cart:", error)
    }
  }

  const updateQuantity = async (id: number, quantity: number, size?: string) => {
    if (!user?.uid) return
    try {
        // Update in MongoDB via backend API
        await api.post('/api/v1/cart/update', {
          user_id: user.uid,
          product_id: id.toString(),
          quantity: quantity,
          size: size
        })

        // Refresh cart from backend
        await fetchCartFromBackend()
    } catch (error) {
        console.error("Failed to update quantity:", error)
    }
  }

  const clearCart = async () => {
    if (!user?.uid) return
    try {
      await api.post(`/api/v1/cart/clear?user_id=${user.uid}`)
      dispatch({ type: 'CLEAR_CART' })
    } catch (error) {
      console.error("Failed to clear cart:", error)
    }
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
      refreshCart: fetchCartFromBackend,
      isCartOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext }
