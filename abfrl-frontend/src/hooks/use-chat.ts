'use client'

import { useState, useCallback, useContext } from 'react'
import api from '@/lib/api'
import { Message, CartItem } from '@/types'
import { DEFAULT_USER_ID } from '@/lib/constants'
import { CartContext } from '@/context/cart-context'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const cartContext = useContext(CartContext)

  const sendMessage = useCallback(async (text: string) => {
    setIsLoading(true)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await api.post('/api/v1/chat/', {
        user_id: DEFAULT_USER_ID,
        message: text,
      })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date(),
        products: response.data.products || [],
      }
      setMessages(prev => [...prev, aiMessage])

      // Update cart if summary is present
      if (response.data.cart_summary && cartContext) {
        const backendItems = response.data.cart_summary.items
        const frontendItems: CartItem[] = backendItems.map((item: any) => ({
          id: item.product_id,
          name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.image_url,
          image_url: item.image_url,
          description: '', // Backend doesn't return description in summary
          selectedSize: item.size
        }))
        
        const summary = {
          subtotal: response.data.cart_summary.subtotal,
          shipping: response.data.cart_summary.shipping,
          discount: response.data.cart_summary.discount,
          total: response.data.cart_summary.total,
          discountCode: response.data.cart_summary.discount_code
        }
        
        cartContext.setCart({ items: frontendItems, summary })
        
        // Open cart drawer to show updated items
        cartContext.openCart()
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [cartContext])

  return { messages, sendMessage, isLoading }
}