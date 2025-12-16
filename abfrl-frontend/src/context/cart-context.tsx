'use client'

import { createContext, useContext, useReducer, ReactNode, useState, useEffect, useCallback } from 'react'
import { Product, CartItem } from '@/types'
import { useAuthContext } from '@/context/auth-context'
import { cartFirestoreService } from '@/services/cart-firestore.service'

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

  useEffect(() => {
    if (!user?.uid) {
      dispatch({ type: 'CLEAR_CART' })
      return
    }

    const loadCart = async () => {
      try {
        const cart = await cartFirestoreService.getCart(user.uid)
        if (cart) {
          dispatch({ type: 'SET_CART', payload: { items: cart.items, summary: cart.summary } })
        } else {
          await cartFirestoreService.saveCart(user.uid, {
            items: [],
            summary: { subtotal: 0, shipping: 0, discount: 0, total: 0 },
            updatedAt: new Date()
          })
        }
      } catch (error) {
        console.error("Failed to load cart:", error)
      }
    }

    loadCart()

    const unsubscribe = cartFirestoreService.subscribeToCart(user.uid, (cart) => {
      if (cart) {
        dispatch({ type: 'SET_CART', payload: { items: cart.items, summary: cart.summary } })
      }
    })

    return () => unsubscribe()
  }, [user?.uid])

  const fetchCart = useCallback(async () => {
    if (!user?.uid) return
    try {
      const cart = await cartFirestoreService.getCart(user.uid)
      if (cart) {
        dispatch({ type: 'SET_CART', payload: { items: cart.items, summary: cart.summary } })
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
    }
  }, [user?.uid])

  const addToCart = async (product: Product & { selectedSize?: string, selectedColor?: string }) => {
    if (!user?.uid) return
    try {
        const existingItem = state.cart.find(
          item => item.id === product.id && item.selectedSize === product.selectedSize
        )
        let newItems: CartItem[]
        if (existingItem) {
          newItems = state.cart.map(item =>
            item.id === product.id && item.selectedSize === product.selectedSize
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        } else {
          newItems = [...state.cart, {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: product.imageUrl || product.image_url,
            image_url: product.image_url || product.imageUrl,
            description: product.description,
            selectedSize: product.selectedSize,
            selectedColor: product.selectedColor
          }]
        }
        const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const newSummary = {
          ...state.summary,
          subtotal,
          total: subtotal + state.summary.shipping - state.summary.discount
        }
        await cartFirestoreService.saveCart(user.uid, {
          items: newItems,
          summary: newSummary,
          updatedAt: new Date()
        })
        dispatch({ type: 'SET_CART', payload: { items: newItems, summary: newSummary } })
        setIsCartOpen(true)
    } catch (error) {
        console.error("Failed to add to cart:", error)
    }
  }

  const removeFromCart = async (id: number, size?: string) => {
    if (!user?.uid) return
    try {
        const newItems = state.cart.filter(item => !(item.id === id && item.selectedSize === size))
        const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const newSummary = {
          ...state.summary,
          subtotal,
          total: subtotal + state.summary.shipping - state.summary.discount
        }
        await cartFirestoreService.saveCart(user.uid, {
          items: newItems,
          summary: newSummary,
          updatedAt: new Date()
        })
        dispatch({ type: 'SET_CART', payload: { items: newItems, summary: newSummary } })
    } catch (error) {
        console.error("Failed to remove from cart:", error)
    }
  }

  const updateQuantity = async (id: number, quantity: number, size?: string) => {
    if (!user?.uid) return
    try {
        const newItems = state.cart.map(item =>
          item.id === id && item.selectedSize === size
            ? { ...item, quantity }
            : item
        )
        const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const newSummary = {
          ...state.summary,
          subtotal,
          total: subtotal + state.summary.shipping - state.summary.discount
        }
        await cartFirestoreService.saveCart(user.uid, {
          items: newItems,
          summary: newSummary,
          updatedAt: new Date()
        })
        dispatch({ type: 'SET_CART', payload: { items: newItems, summary: newSummary } })
    } catch (error) {
        console.error("Failed to update quantity:", error)
    }
  }

  const clearCart = async () => {
    if (!user?.uid) return
    try {
      await cartFirestoreService.clearCart(user.uid)
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
