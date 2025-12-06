'use client'

import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, summary, removeFromCart, clearCart } = useCart()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="h-full w-96 bg-white shadow-lg p-6 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Your Cart ({cart.length})</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        
        <div className="space-y-4 flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              Your cart is empty
            </div>
          ) : (
            cart.map((item) => (
              <Card key={item.id} className="p-4 flex gap-4">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">Size: {item.selectedSize || 'M'}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm font-bold">₹{item.price} x {item.quantity}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 h-auto p-0 hover:bg-transparent hover:text-red-600"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="mt-6 border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{summary.subtotal}</span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount {summary.discountCode && `(${summary.discountCode})`}</span>
                <span>-₹{summary.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{summary.shipping === 0 ? 'Free' : `₹${summary.shipping}`}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total</span>
              <span>₹{summary.total}</span>
            </div>
            <Button className="w-full mt-4" onClick={clearCart}>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}