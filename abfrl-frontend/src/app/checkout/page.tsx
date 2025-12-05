'use client'

import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Checkout() {
  const { cart, clearCart } = useCart()

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handlePayment = async () => {
    // Mock payment
    alert('Payment successful!')
    clearCart()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cart.map((item) => (
            <Card key={item.id} className="p-4 mb-4">
              <h3>{item.name}</h3>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price}</p>
            </Card>
          ))}
          <p className="text-xl font-bold">Total: ${total}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment</h2>
          <Button onClick={handlePayment} className="w-full">
            Pay Now
          </Button>
        </div>
      </div>
    </div>
  )
}