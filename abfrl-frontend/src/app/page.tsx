'use client'

import { ChatInterface } from '@/components/chat/chat-interface'
import { Header } from '@/components/layout/header'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Welcome to ABFRL - Your AI Shopping Assistant
          </h1>
          <ChatInterface />
        </div>
      </main>
    </div>
  )
}