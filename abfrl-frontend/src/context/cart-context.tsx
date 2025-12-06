'use client'

import { createContext, useContext, useReducer, ReactNode, useState } from 'react'
import { Product, CartItem } from '@/types'

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
      let newCartAdd: CartItem[]
      const existingItem = state.cart.find(item => item.id === action.payload.id)
      if (existingItem) {
        newCartAdd = state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newCartAdd = [...state.cart, { ...action.payload, quantity: 1 }]
      }
      return {
        ...state,
        cart: newCartAdd,
        summary: calculateSummary(newCartAdd)
      }
    case 'REMOVE_FROM_CART':
      const newCartRemove = state.cart.filter(item => item.id !== action.payload)
      return {
        ...state,
        cart: newCartRemove,
        summary: calculateSummary(newCartRemove)
      }
    case 'UPDATE_QUANTITY':
      const newCartUpdate = state.cart.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      )
      return {
        ...state,
        cart: newCartUpdate,
        summary: calculateSummary(newCartUpdate)
      }
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
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  setCart: (data: { items: CartItem[], summary: CartState['summary'] }) => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { 
    cart: [], 
    summary: { subtotal: 0, shipping: 0, discount: 0, total: 0, discountCode: null } 
  })
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addToCart = (product: Product & { selectedSize?: string, selectedColor?: string }) => {
    dispatch({ type: 'ADD_TO_CART', payload: product })
    setIsCartOpen(true)
  }

  const removeFromCart = (id: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id })
  }

  const updateQuantity = (id: number, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
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
      isCartOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext }