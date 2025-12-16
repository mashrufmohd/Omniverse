'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, ChevronRight, Mic, MicOff } from 'lucide-react'
import { useSpeech } from '@/hooks/use-speech'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { isListening, transcript, startListening, stopListening } = useSpeech()

  useEffect(() => {
    if (transcript) {
      setInput(transcript)
    }
  }, [transcript])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput('')
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="p-4 md:p-6 bg-white border-t-2 border-black sticky bottom-0 z-10">
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center gap-3 max-w-4xl mx-auto"
      >
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 transition-transform group-focus-within:translate-x-0 group-focus-within:translate-y-0"></div>
          <div className="relative flex items-center bg-white border-2 border-black h-14 px-4 transition-transform group-focus-within:translate-x-1 group-focus-within:translate-y-1">
            <ChevronRight className="text-black mr-2 animate-pulse" size={20} />
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "LISTENING..." : "TYPE COMMAND..."}
              className="flex-1 border-0 bg-transparent h-full p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400 text-base font-mono uppercase tracking-wider"
              disabled={isLoading}
            />
            <Button
              type="button"
              onClick={toggleListening}
              variant="ghost"
              size="icon"
              className={`hover:bg-transparent ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-black'}`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="h-14 px-8 bg-blue-600 text-white border-2 border-black shadow-retro hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 disabled:hover:shadow-retro disabled:hover:translate-x-0 disabled:hover:translate-y-0 rounded-none"
        >
          <span className="font-mono font-bold text-lg uppercase tracking-widest">Send</span>
          <Send size={18} className="ml-2" />
        </Button>
      </form>
    </div>
  )
}