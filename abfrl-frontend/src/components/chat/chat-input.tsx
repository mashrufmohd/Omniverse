'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput('')
    }
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-2 p-4 border-t-2 border-border bg-background sticky bottom-0 z-10"
    >
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products, orders, or offers..."
          className="pr-24 h-14 border-2 border-border rounded-none shadow-retro focus-visible:ring-0 focus-visible:shadow-retro-hover transition-all text-base"
          disabled={isLoading}
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || !input.trim()}
        className="h-14 px-6 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all"
      >
        Send
      </Button>
    </form>
  )
}