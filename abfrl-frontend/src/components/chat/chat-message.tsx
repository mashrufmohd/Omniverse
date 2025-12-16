'use client'

import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { ChatProductCard } from '@/components/chat/chat-product-card'
import { User, Terminal } from 'lucide-react'

interface ChatMessageProps {
  message: Message
  onAction?: (action: string, data?: any) => void
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.sender === 'user'

  return (
    <div className={cn(
      "flex w-full gap-4 px-4 group animate-in fade-in slide-in-from-bottom-4 duration-500",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black shadow-retro transition-transform group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none",
        isUser 
          ? "bg-blue-600 text-white" 
          : "bg-white text-black"
      )}>
        {isUser ? <User size={18} strokeWidth={2.5} /> : <Terminal size={18} strokeWidth={2.5} />}
      </div>

      <div className={cn(
        "flex flex-col gap-2 max-w-[85%] lg:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-6 py-4 text-sm md:text-base border-2 border-black shadow-retro relative font-mono",
          isUser 
            ? "bg-blue-600 text-white" 
            : "bg-white text-black"
        )}>
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        </div>

        {message.products && message.products.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 w-full max-w-full mt-2 px-1 scrollbar-hide snap-x">
            {message.products.map((product) => (
              <div key={product.id} className="min-w-[260px] max-w-[260px] snap-center">
                <ChatProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
