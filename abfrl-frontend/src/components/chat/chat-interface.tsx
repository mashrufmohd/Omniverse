'use client'

import { useState, useEffect, useRef } from 'react'
import { ChatMessage } from '@/components/chat/chat-message'
import { ChatInput } from '@/components/chat/chat-input'
import { ChatMessage as ChatMessageType } from '@/types'
import { useChat } from '@/hooks/use-chat'
import { useCart } from '@/hooks/use-cart'

interface ChatInterfaceProps {
  sessionId?: string
}

export function ChatInterface({ sessionId }: ChatInterfaceProps) {
  const { messages, sendMessage, isLoading, isStreaming, streamingMessageId, loadHistory } = useChat(sessionId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { addToCart, refreshCart } = useCart()

  useEffect(() => {
    if (sessionId) {
      loadHistory(sessionId)
    }
  }, [sessionId, loadHistory])

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
    <div className="flex flex-col h-full bg-[#f0f0f0] relative overflow-hidden">
      {/* Retro Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', 
             backgroundSize: '20px 20px' 
           }} 
      />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 scroll-smooth relative z-10">
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            message={msg} 
            onAction={handleAction}
            isStreaming={isStreaming && msg.id === streamingMessageId}
          />
        ))}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 max-w-[120px] bg-white border-2 border-black shadow-retro ml-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-black animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-black animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-black animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>
      <ChatInput onSend={handleSendMessage} isLoading={isLoading || isStreaming} />
    </div>
  )
}