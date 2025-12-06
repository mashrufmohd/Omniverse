'use client'

import { ChatInterface } from '@/components/chat/chat-interface'
import { Header } from '@/components/layout/header'
import { CartPanel } from '@/components/product/cart-panel'

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface />
        </div>
        <div className="w-[400px] hidden lg:block h-full border-l-2 border-border">
          <CartPanel />
        </div>
      </main>
    </div>
  )
}