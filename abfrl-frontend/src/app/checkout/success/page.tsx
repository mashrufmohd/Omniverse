'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('order_id')
    setOrderId(id)
  }, [searchParams])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <div className="bg-card border-4 border-border shadow-retro p-12 text-center">
              {/* Success Icon */}
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 bg-secondary border-4 border-border flex items-center justify-center shadow-retro">
                  <CheckCircle className="w-12 h-12 text-secondary-foreground" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent border-2 border-border flex items-center justify-center shadow-retro animate-bounce">
                  <span className="text-2xl">✓</span>
                </div>
              </div>

              {/* Success Message */}
              <h1 className="text-4xl font-bold font-syne uppercase mb-4">Order Placed!</h1>
              <p className="text-xl font-mono text-muted-foreground mb-8">
                Your order has been successfully placed
              </p>

              {/* Order ID */}
              {orderId && (
                <div className="bg-muted border-4 border-border p-6 mb-8">
                  <p className="text-xs font-mono font-bold uppercase text-muted-foreground mb-2">Order ID</p>
                  <p className="text-2xl font-bold font-mono break-all">{orderId.slice(-12).toUpperCase()}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-accent/20 border-4 border-border p-6 mb-8 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary border-2 border-border flex items-center justify-center shadow-retro flex-shrink-0">
                    <Package className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold font-mono uppercase text-sm mb-2">What's Next?</p>
                    <ul className="space-y-2 font-mono text-sm">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary border border-border" />
                        Order confirmation sent to your email
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary border border-border" />
                        Estimated delivery: 3-5 business days
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary border border-border" />
                        Track your order in the Orders section
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => router.push('/orders')}
                  className="flex-1 bg-primary text-primary-foreground border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-mono font-bold uppercase py-6"
                >
                  View Orders
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  onClick={() => router.push('/shop')}
                  variant="outline"
                  className="flex-1 border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-mono font-bold uppercase py-6"
                >
                  <Home className="mr-2 w-5 h-5" />
                  Continue Shopping
                </Button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-sm font-mono text-muted-foreground">
                Need help with your order? <a href="/chat" className="text-primary font-bold underline hover:no-underline">Chat with us</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
