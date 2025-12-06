'use client'

import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/product/product-card'

interface ChatMessageProps {
  message: Message
  onAction?: (action: string, data?: any) => void
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.sender === 'user'

  return (
    <div className={cn(
      "flex w-full gap-4 p-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-semibold",
        isUser ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-700"
      )}>
        {isUser ? "U" : "AI"}
      </div>

      <div className={cn(
        "flex flex-col gap-2 max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-lg text-sm md:text-base",
          isUser 
            ? "bg-blue-600 text-white" 
            : "bg-gray-200 text-gray-900"
        )}>
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>

        {message.products && message.products.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-4 w-full max-w-full mt-2">
            {message.products.map((product) => (
              <div key={product.id} className="min-w-[280px] max-w-[280px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
