'use client'

import { useState } from 'react'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { useChat } from '@/hooks/use-chat'
import { Message } from '@/types'

export function ChatInterface() {
  const { messages, sendMessage, isLoading } = useChat()
  const [input, setInput] = useState('')

  const handleSend = async () => {
    if (!input.trim()) return
    await sendMessage(input)
    setInput('')
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white">
      <MessageList messages={messages} />
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isLoading}
      />
    </div>
  )
}