'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/use-cart'
import { CreditCard, Wallet, Banknote, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card')
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle')

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 5.00
  const total = subtotal + shipping

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate payment processing
    setPaymentStatus('idle')
    setTimeout(() => {
      setPaymentStatus('success')
    }, 1500)
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border-2 border-border shadow-retro p-8 text-center space-y-6">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted-foreground">Your order has been confirmed.</p>
          </div>
          <div className="bg-muted p-4 rounded-none border border-border text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span>Order Number</span>
              <span className="font-mono font-bold">#173459</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery</span>
              <span className="font-bold">Oct 28, 2023</span>
            </div>
          </div>
          <Link href="/orders">
            <Button className="w-full font-bold uppercase tracking-wide">Track Your Order</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b-2 border-border bg-white p-4">
        <div className="container mx-auto">
          <Link href="/" className="text-lg font-bold tracking-tight hover:text-primary transition-colors font-mono uppercase">
            Master Sales Agent
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Cart</Link>
            <span>&gt;</span>
            <span className="font-bold text-foreground">Payment Information</span>
            <span>&gt;</span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Payment Information</h2>
              
              {/* Payment Methods */}
              <div className="flex p-1 bg-muted border-2 border-border">
                {[
                  { id: 'card', label: 'Credit Card', icon: CreditCard },
                  { id: 'upi', label: 'UPI', icon: Banknote },
                  { id: 'wallet', label: 'Wallets', icon: Wallet },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold uppercase transition-all",
                      paymentMethod === method.id 
                        ? "bg-white text-primary shadow-sm border border-border" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <method.icon className="h-4 w-4" />
                    {method.label}
                  </button>
                ))}
              </div>

              {/* Card Form */}
              <form onSubmit={handlePayment} className="space-y-4 p-6 border-2 border-border bg-white shadow-retro">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase">Card Number</label>
                  <div className="relative">
                    <Input placeholder="0000 0000 0000 0000" className="font-mono pl-10" required />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase">Card Holder</label>
                  <Input placeholder="JOHN DOE" className="uppercase" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase">Expiry Date</label>
                    <Input placeholder="MM/YY" className="font-mono" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase">CVV</label>
                    <Input placeholder="123" type="password" maxLength={3} className="font-mono" required />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="save-card" className="h-4 w-4 border-2 border-border rounded-none text-primary focus:ring-primary" />
                  <label htmlFor="save-card" className="text-sm">Save card for future purchases</label>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-border p-6 shadow-retro sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 border border-border bg-muted shrink-0">
                      {item.image_url && (
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-mono font-bold mt-1">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-t-2 border-border pt-4">
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

              <Button 
                onClick={handlePayment}
                className="w-full mt-6 font-bold uppercase tracking-wide h-12"
              >
                Pay ${total.toFixed(2)}
              </Button>
            </div>

            {/* Feedback States (Demo) */}
            {paymentStatus === 'failed' && (
              <div className="bg-red-50 border-2 border-red-200 p-4 flex gap-3 items-start animate-fade-in">
                <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900">Payment Failed</h4>
                  <p className="text-sm text-red-700">Please check your card details and try again.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}