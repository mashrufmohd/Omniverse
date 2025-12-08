'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Tag } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'
import { DEFAULT_USER_ID } from '@/lib/constants'

export function CartPanel() {
  const { cart, summary, removeFromCart, refreshCart } = useCart()
  const [discountCode, setDiscountCode] = useState('')
  const [discountMessage, setDiscountMessage] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return
    
    setIsApplying(true)
    setDiscountMessage('')
    
    try {
      // We don't have a direct endpoint for just applying discount in the current API structure
      // The chat agent handles it via logic. We should probably add an endpoint or use the cart update endpoint.
      // Looking at CartService, get_cart_summary takes a discount_code.
      // But we need to persist it or validate it.
      // Let's check if there is an endpoint for applying discount.
      // If not, we might need to create one or use a workaround.
      // For now, let's assume we can call an endpoint.
      
      // Wait, the backend CartService.get_cart_summary takes a discount_code param.
      // But the /api/v1/cart/ endpoint (GET) takes user_id.
      // We might need to update the GET endpoint to accept discount_code or add a POST endpoint.
      
      // Let's check the backend cart endpoints again.
      const response = await api.post('/api/v1/cart/apply-discount', {
        user_id: DEFAULT_USER_ID,
        code: discountCode
      })
      
      if (response.data.success) {
        setDiscountMessage(response.data.message)
        refreshCart() // This should fetch the cart with the discount applied if the backend persists it
      } else {
        setDiscountMessage(response.data.message || 'Invalid code')
      }
    } catch (error) {
      console.error('Failed to apply discount:', error)
      setDiscountMessage('Failed to apply discount')
    } finally {
      setIsApplying(false)
    }
  }

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
                  <span className="font-bold font-mono">₹{item.price.toFixed(2)}</span>
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
        
        {/* Discount Code Input */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input 
              placeholder="Discount Code" 
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="bg-white h-9"
            />
            <Button 
              size="sm" 
              onClick={handleApplyDiscount}
              disabled={isApplying || !discountCode}
            >
              {isApplying ? '...' : 'Apply'}
            </Button>
          </div>
          {discountMessage && (
            <p className={`text-xs ${discountMessage.includes('applied') ? 'text-green-600' : 'text-red-500'}`}>
              {discountMessage}
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">₹{summary.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-mono">₹{summary.shipping.toFixed(2)}</span>
          </div>
          {summary.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="text-muted-foreground text-green-600">Discount {summary.discountCode && `(${summary.discountCode})`}</span>
              <span className="font-mono">-₹{summary.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border/50">
            <span>Total</span>
            <span className="font-mono">₹{summary.total.toFixed(2)}</span>
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
