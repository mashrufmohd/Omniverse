'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, User, HelpCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartDrawer } from '@/components/product/cart-drawer'
import { useCart } from '@/hooks/use-cart'

export function Header() {
  const { cart, isCartOpen, openCart, closeCart } = useCart()

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-border bg-primary text-primary-foreground font-bold shadow-retro">
              <span className="text-lg">💎</span>
            </div>
            <Link href="/" className="text-lg font-bold tracking-tight hover:text-primary transition-colors font-mono uppercase">
              Master Sales Agent
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
              Shop
            </Link>
            <Link href="/orders" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
              Orders
            </Link>
            <Link href="/help" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
              Help
            </Link>
            
            <div className="flex items-center gap-2 ml-2">
              <Link href="/profile">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 rounded-none border-2 border-border p-0 hover:bg-accent hover:text-accent-foreground shadow-retro hover:shadow-retro-hover transition-all"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Button>
              </Link>
              <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 rounded-none border-2 border-border p-0 hover:bg-secondary hover:text-secondary-foreground shadow-retro hover:shadow-retro-hover transition-all relative"
                  onClick={openCart}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold border-2 border-border">
                      {cart.length}
                    </span>
                  )}
                  <span className="sr-only">Cart</span>
                </Button>
            </div>
          </nav>
        </div>
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  )
}