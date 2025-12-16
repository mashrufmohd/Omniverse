import type { Metadata } from 'next'
import { Syne, Space_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/auth-context'
import { CartProvider } from '@/context/cart-context'

const syne = Syne({ 
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ABFRL - Conversational Retail',
  description: 'AI-powered shopping assistant',
  icons: {
    icon: '/images/logo.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${spaceMono.variable} font-sans bg-background text-foreground antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}