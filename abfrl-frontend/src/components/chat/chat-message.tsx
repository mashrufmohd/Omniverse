'use client'

import { ChatMessage as ChatMessageType } from '@/types'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/product/product-card'
import { User, Bot } from 'lucide-react'

interface ChatMessageProps {
  message: ChatMessageType
  onAction?: (action: string, data?: any) => void
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn(
      "flex w-full gap-4 p-4 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center border-2 border-border shadow-retro",
        isUser ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
      )}>
        {isUser ? <User className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </div>

      <div className={cn(
        "flex flex-col gap-2 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "relative px-6 py-4 border-2 border-border shadow-retro text-sm md:text-base",
          isUser 
            ? "bg-white text-foreground rounded-none" 
            : "bg-white text-foreground rounded-none"
        )}>
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          <span 
            className="text-[10px] text-muted-foreground mt-2 block font-mono uppercase opacity-70"
            suppressHydrationWarning
          >
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {message.product_cards && message.product_cards.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4 w-full max-w-full mt-2 px-1">
            {message.product_cards.map((product) => (
              <div key={product.id} className="min-w-[280px] max-w-[280px]">
                <ProductCard product={product} onAction={onAction} />
              </div>
            ))}
          </div>
        )}

        {message.suggested_actions && message.suggested_actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.suggested_actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => onAction?.(action)}
                className="px-4 py-2 bg-white border-2 border-border text-sm font-bold uppercase hover:bg-secondary hover:text-secondary-foreground hover:shadow-retro transition-all active:translate-y-1 active:shadow-none"
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
