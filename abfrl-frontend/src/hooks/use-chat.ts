'use client'

import { useState, useCallback } from 'react'
import api from '@/lib/api'
import { Message } from '@/types'
import { DEFAULT_USER_ID } from '@/lib/constants'

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
  }, [])

  return { messages, sendMessage, isLoading }
}