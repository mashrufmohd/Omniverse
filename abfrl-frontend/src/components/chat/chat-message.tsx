'use client'

import { Message } from '@/types'
import { cn } from '@/lib/utils'
import { ChatProductCard } from '@/components/chat/chat-product-card'
import { User, Terminal } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface ChatMessageProps {
  message: Message
  onAction?: (action: string, data?: any) => void
  isStreaming?: boolean
}

export function ChatMessage({ message, onAction, isStreaming }: ChatMessageProps) {
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
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
                  strong: ({ children }) => <strong className="font-bold text-black">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => <ul className="my-2 ml-4 list-disc space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  h1: ({ children }) => <h1 className="text-xl font-bold my-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold my-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold my-2">{children}</h3>,
                  code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">{children}</code>,
                }}
              >
                {message.text}
              </ReactMarkdown>
              {isStreaming && <span className="inline-block w-2 h-5 bg-black animate-pulse ml-1 align-middle"></span>}
            </div>
          )}
        </div>

        {message.products && message.products.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 w-full max-w-full mt-2 px-1 scrollbar-hide snap-x">
            {message.products.map((product) => (
              <div key={product.id} className="min-w-[260px] max-w-[260px] snap-center">
                <ChatProductCard product={product} onAction={onAction} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
