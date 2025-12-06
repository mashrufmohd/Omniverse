'use client'

import { useState, useRef } from 'react'
import { Send, Mic, Paperclip } from 'lucide-react'
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
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-none hover:bg-muted text-muted-foreground"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-none hover:bg-muted text-muted-foreground"
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <Button 
        type="submit" 
        disabled={isLoading || !input.trim()}
        className="h-14 w-14 rounded-none p-0 bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-border shadow-retro active:translate-y-[2px] active:shadow-none transition-all"
      >
        <Send className="h-6 w-6" />
      </Button>
    </form>
  )
}