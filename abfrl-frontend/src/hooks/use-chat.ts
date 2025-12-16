'use client'

import { useState, useCallback, useContext, useEffect } from 'react'
import api from '@/lib/api'
import { Message, CartItem } from '@/types'
import { CartContext } from '@/context/cart-context'
import { useAuthContext } from '@/context/auth-context'
import { chatService } from '@/services/chat.service'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const cartContext = useContext(CartContext)
  const { user } = useAuthContext()

  // Load chat history when user logs in
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user?.uid) {
        try {
          const history = await chatService.getChatHistory(user.uid)
          setMessages(history)
        } catch (error) {
          console.error('Error loading chat history:', error)
        }
      } else {
        setMessages([])
      }
    }

    loadChatHistory()
  }, [user?.uid])

  const sendMessage = useCallback(async (text: string) => {
    if (!user?.uid) {
      console.error('User must be logged in to send messages')
      return
    }

    setIsLoading(true)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])

    // Save user message to Firestore (non-blocking)
    chatService.saveMessage(user.uid, {
      userId: user.uid,
      text,
      sender: 'user',
    }).catch(error => {
      console.log('Note: Message not saved to history (offline):', error.message)
    })

    try {
      console.log('Sending message to backend:', { user_id: user.uid, message: text })
      const response = await api.post('/api/v1/chat/', {
        user_id: user.uid,
        message: text,
        channel: 'web'
      })
      console.log('Received response:', response.data)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        sender: 'ai',
        timestamp: new Date(),
        products: response.data.products || [],
      }
      setMessages(prev => [...prev, aiMessage])

      // Save AI message to Firestore (non-blocking)
      chatService.saveMessage(user.uid, {
        userId: user.uid,
        text: response.data.response,
        sender: 'ai',
        products: response.data.products || [],
      }).catch(error => {
        console.log('Note: AI message not saved to history (offline):', error.message)
      })

      // Update cart if summary is present
      if (response.data.cart_summary && cartContext) {
        const backendItems = response.data.cart_summary.items
        const frontendItems: CartItem[] = backendItems.map((item: any) => {
          const cartItem: any = {
            id: item.product_id,
            name: item.product_name,
            price: item.price,
            quantity: item.quantity,
          }
          // Only add optional fields if they have values
          if (item.image_url) {
            cartItem.imageUrl = item.image_url
            cartItem.image_url = item.image_url
          }
          if (item.description) {
            cartItem.description = item.description
          }
          if (item.size) {
            cartItem.selectedSize = item.size
          }
          return cartItem
        })
        
        const summary: any = {
          subtotal: response.data.cart_summary.subtotal,
          shipping: response.data.cart_summary.shipping,
          discount: response.data.cart_summary.discount,
          total: response.data.cart_summary.total,
        }
        // Only add discount code if it exists
        if (response.data.cart_summary.discount_code) {
          summary.discountCode = response.data.cart_summary.discount_code
        }
        
        cartContext.setCart({ items: frontendItems, summary })
        
        // Open cart drawer to show updated items
        cartContext.openCart()
      }

    } catch (error: any) {
      console.error('Error sending message:', error)
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        code: error?.code
      })
      
      let errorText = 'Sorry, I encountered an error. '
      if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
        errorText = 'The request timed out. Please check if the backend is running and try again.'
      } else if (error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
        errorText = 'Cannot connect to the backend. Please ensure the backend server is running on http://localhost:8000'
      } else if (error?.response?.data?.detail) {
        errorText = `Error: ${error.response.data.detail}`
      } else if (error?.message) {
        errorText = `Error: ${error.message}`
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [cartContext, user?.uid])

  const clearHistory = useCallback(async () => {
    if (user?.uid) {
      try {
        await chatService.clearChatHistory(user.uid)
        setMessages([])
      } catch (error) {
        console.error('Error clearing chat history:', error)
      }
    }
  }, [user?.uid])

  return { messages, sendMessage, isLoading, clearHistory }
}