'use client'

import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, clearCart } = useCart()

  if (!isOpen) return null

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Cart</h2>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto">
          {cart.map((item) => (
            <Card key={item.id} className="p-4">
              <h3>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </Button>
            </Card>
          ))}
        </div>
        <div className="mt-6">
          <p className="text-xl font-bold">Total: ${total}</p>
          <Button className="w-full mt-4" onClick={clearCart}>
            Checkout
          </Button>
        </div>
      </div>
    </div>
  )
}