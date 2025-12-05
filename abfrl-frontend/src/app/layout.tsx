import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { CartProvider } from '@/context/cart-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ABFRL - Conversational Retail',
  description: 'AI-powered shopping assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}