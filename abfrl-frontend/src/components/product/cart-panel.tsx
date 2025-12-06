'use client'

import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'

export function CartPanel() {
  const { cart, removeFromCart } = useCart()

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 5.00
  const total = subtotal + shipping

  return (
    <div className="flex flex-col h-full border-l-2 border-border bg-background">
      <div className="p-6 border-b-2 border-border">
        <h2 className="text-xl font-bold font-mono uppercase">Shopping Cart</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            Your cart is empty
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative h-20 w-20 shrink-0 border-2 border-border bg-muted">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm leading-tight">{item.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono">${item.price.toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 border-t-2 border-border bg-muted/30 space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-mono">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
            <span>Total</span>
            <span className="font-mono">${total.toFixed(2)}</span>
          </div>
        </div>
        
        <Link href="/checkout" className="block">
          <Button className="w-full font-bold uppercase tracking-wide">
            Checkout
          </Button>
        </Link>
      </div>
    </div>
  )
}
