'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatMessage } from '@/components/chat/chat-message'
import { ChatInput } from '@/components/chat/chat-input'
import { ChatMessage as ChatMessageType } from '@/types'
import { useChat } from '@/hooks/use-chat'
import { useCart } from '@/hooks/use-cart'

export function ChatInterface() {
  const { messages, sendMessage, isLoading } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addToCart } = useCart()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    await sendMessage(content)
  }

  const handleAction = async (action: string, data?: any) => {
    if (action === 'add_to_cart' && data) {
      addToCart(data)
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
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  )
}