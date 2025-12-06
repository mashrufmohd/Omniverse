'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatMessage } from '@/components/chat/chat-message'
import { ChatInput } from '@/components/chat/chat-input'
import { ChatMessage as ChatMessageType } from '@/types'
import { sendChatMessage } from '@/lib/api/chat'
import { useCart } from '@/hooks/use-cart'

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      role: 'ai',
      content: "Hello! I'm your Master Sales Agent. How can I help you find the perfect product today?",
      timestamp: new Date().toISOString()
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    const userMessage: ChatMessageType = {
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await sendChatMessage(content)
      
      const aiMessage: ChatMessageType = {
        role: 'ai',
        content: response.ai_message,
        timestamp: new Date().toISOString(),
        product_cards: response.product_cards,
        suggested_actions: response.suggested_actions
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      // Add error message handling here
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: string, data?: any) => {
    if (action === 'add_to_cart' && data) {
      addToCart(data)
      // Optionally send a message to AI that item was added
      // handleSendMessage(`I added ${data.name} to my cart`)
    } else {
      handleSendMessage(action)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            message={msg} 
            onAction={handleAction}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 p-4 text-muted-foreground animate-pulse">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}