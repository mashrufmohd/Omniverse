'use client'

import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, HelpCircle, Package, LogOut, Shield, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartDrawer } from '@/components/product/cart-drawer'
import { useCart } from '@/hooks/use-cart'
import { useAuthContext } from '@/context/auth-context'

export function Header() {
  const { cart, isCartOpen, openCart, closeCart } = useCart()
  const { user, isAdmin, logout } = useAuthContext()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 overflow-hidden border-2 border-border shadow-retro">
              <Image 
                src="/images/logo.jpg" 
                alt="ABFRL Logo" 
                fill
                className="object-cover"
              />
            </div>
            <Link href={user ? "/chat" : "/"} className="text-lg font-bold tracking-tight hover:text-primary transition-colors font-mono uppercase">
              Master Sales Agent
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            {!user && (
              <Link href="/" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
                Home
              </Link>
            )}
            {/* Only show customer features if NOT a shopkeeper */}
            {user?.role !== 'shopkeeper' && (
              <>
                <Link href="/shop" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
                  Shop
                </Link>
                <Link href="/orders" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
                  Orders
                </Link>
                <Link href="/documentation" className="text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors">
                  Docs
                </Link>
              </>
            )}
            
            <div className="flex items-center gap-2 ml-2">
              {user ? (
                <>
                  {user.role === 'shopkeeper' && (
                    <Link href="/shopkeeper/dashboard">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-2 border-black shadow-retro hover:shadow-retro-hover"
                      >
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  {user.role !== 'shopkeeper' && (
                    <span className="text-sm font-medium hidden md:inline-flex items-center gap-2">
                      {user.name || user.email}
                    </span>
                  )}
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
                    onClick={handleLogout}
                    className="h-10 w-10 rounded-none border-2 border-border p-0 hover:bg-accent hover:text-accent-foreground shadow-retro hover:shadow-retro-hover transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Logout</span>
                  </Button>
                  {user.role !== 'shopkeeper' && (
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
                  )}
                </>
              ) : (
                <>
                  <Link href="/shopkeeper/signup">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 px-4 rounded-none border-2 border-black bg-[#FFD166] hover:bg-[#00CCBF] text-black shadow-retro hover:shadow-retro-hover transition-all font-bold"
                    >
                      <Store className="h-4 w-4 mr-2" />
                      Become a Shopkeeper
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-10 px-4 rounded-none border-2 border-border hover:bg-accent hover:text-accent-foreground shadow-retro hover:shadow-retro-hover transition-all"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button 
                      size="sm" 
                      className="h-10 px-4 rounded-none border-2 border-black bg-[#FF5E5B] text-white hover:bg-[#00CCBF] shadow-retro hover:shadow-retro-hover transition-all font-bold"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </>
  )
}