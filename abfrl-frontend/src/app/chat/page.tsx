'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChatInterface } from '@/components/chat/chat-interface'
import { Header } from '@/components/layout/header'
import { CartPanel } from '@/components/product/cart-panel'
import { useAuthContext } from '@/context/auth-context'

export default function ChatPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  // Redirect shopkeepers to login page - they need to login as user
  useEffect(() => {
    if (!loading && user && user.role === 'shopkeeper') {
      router.push('/login')
    }
  }, [user, loading, router])

  // Don't render page content if shopkeeper - show loading instead
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-lg font-mono">Loading...</div>
      </div>
    )
  }

  if (user && user.role === 'shopkeeper') {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-lg font-mono">Redirecting...</div>
      </div>
    )
  }

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
