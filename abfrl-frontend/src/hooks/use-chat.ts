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
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
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

    // Create placeholder AI message for streaming
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      text: '',
      sender: 'ai',
      timestamp: new Date(),
      products: [],
    }
    setMessages(prev => [...prev, aiMessage])
    setStreamingMessageId(aiMessageId)
    setIsStreaming(true)
    setIsLoading(false)

    try {
      console.log('Streaming message to backend:', { user_id: user.uid, message: text })
      
      let fullText = ''
      let finalProducts: any[] = []
      let finalCartSummary: any = null

      await chatService.streamChatResponse(
        user.uid,
        text,
        // onChunk - append text as it streams
        (chunk: string) => {
          fullText += chunk
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: fullText }
              : msg
          ))
        },
        // onComplete - handle final data
        (data: any) => {
          console.log('Stream completed with data:', data)
          finalProducts = data.products || []
          finalCartSummary = data.cart_summary
          
          // Update message with products
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, products: finalProducts }
              : msg
          ))

          // Save AI message to Firestore
          chatService.saveMessage(user.uid!, {
            userId: user.uid!,
            text: fullText,
            sender: 'ai',
            products: finalProducts,
          }).catch(error => {
            console.log('Note: AI message not saved to history (offline):', error.message)
          })

          // Update cart if summary is present
          if (finalCartSummary && cartContext) {
            const backendItems = finalCartSummary.items
            const frontendItems: CartItem[] = backendItems.map((item: any) => {
              const cartItem: any = {
                id: item.product_id,
                name: item.product_name,
                price: item.price,
                quantity: item.quantity,
              }
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
              subtotal: finalCartSummary.subtotal,
              shipping: finalCartSummary.shipping,
              discount: finalCartSummary.discount,
              total: finalCartSummary.total,
            }
            if (finalCartSummary.discount_code) {
              summary.discountCode = finalCartSummary.discount_code
            }
            
            cartContext.setCart({ items: frontendItems, summary })
            cartContext.openCart()
          }

          setIsStreaming(false)
          setStreamingMessageId(null)
        },
        // onError
        (error: string) => {
          console.error('Streaming error:', error)
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, text: fullText || 'Sorry, I encountered an error processing your message.' }
              : msg
          ))
          setIsStreaming(false)
          setStreamingMessageId(null)
        }
      )

    } catch (error: any) {
      console.error('Error sending message:', error)
      
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
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, text: errorText }
          : msg
      ))
      setIsStreaming(false)
      setStreamingMessageId(null)
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

  return { 
    messages, 
    sendMessage, 
    isLoading, 
    isStreaming, 
    streamingMessageId,
    clearHistory 
  }
}