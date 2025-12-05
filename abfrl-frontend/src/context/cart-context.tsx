'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Product } from '@/types'

interface CartItem extends Product {
  quantity: number
}

interface CartState {
  cart: CartItem[]
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'CLEAR_CART' }

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.cart.find(item => item.id === action.payload.id)
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      }
    case 'CLEAR_CART':
      return { ...state, cart: [] }
    default:
      return state
  }
}

const CartContext = createContext<{
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (id: number) => void
  clearCart: () => void
} | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { cart: [] })

  const addToCart = (product: Product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product })
  }

  const removeFromCart = (id: number) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  return (
    <CartContext.Provider value={{ ...state, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export { CartContext }