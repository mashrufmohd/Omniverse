'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartDrawer } from '@/components/product/cart-drawer'
import { useCart } from '@/hooks/use-cart'

export function Header() {
  const [cartOpen, setCartOpen] = useState(false)
  const { cart } = useCart()

  return (
    <>
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            ABFRL
          </Link>
          <nav className="space-x-4">
            <Link href="/profile" className="text-gray-600 hover:text-gray-900">
              Profile
            </Link>
            <Button variant="outline" onClick={() => setCartOpen(true)}>
              Cart ({cart.length})
            </Button>
          </nav>
        </div>
      </header>
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}