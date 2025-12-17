'use client'

import { useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuthContext } from '@/context/auth-context'

export default function CartPage() {
  const { user, loading: authLoading } = useAuthContext()
  const { cart, summary, removeFromCart, updateQuantity } = useCart()
  const router = useRouter()

  // Redirect shopkeepers to login page - they need to login as user
  useEffect(() => {
    if (!authLoading && user && user.role === 'shopkeeper') {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Don't render page content if shopkeeper - show loading instead
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-lg font-mono">Loading...</div>
      </div>
    )
  }

  if (user && user.role === 'shopkeeper') {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-lg font-mono">Redirecting...</div>
      </div>
    )
  }

  return (
    <ProtectedRoute>

  // Use summary from context if available, otherwise fallback (though context should always have summary now)
  const subtotal = summary?.subtotal ?? cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = summary?.shipping ?? 0
  const discount = summary?.discount ?? 0
  const total = summary?.total ?? (subtotal + shipping)

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 bg-white border-2 border-black shadow-retro rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold font-syne">Your cart is empty</h1>
          <p className="text-gray-600 font-mono max-w-md mx-auto">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Link href="/chat">
            <Button className="bg-black text-white hover:bg-gray-800 border-2 border-black shadow-retro px-8 py-6 text-lg font-mono">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold font-syne mb-8">Your Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <Card key={item.id} className="p-6 border-2 border-black shadow-retro bg-white">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 border-2 border-black rounded-lg overflow-hidden">
                    <Image
                      src={item.image_url || 'https://placehold.co/600x400/png?text=Product'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold font-syne">{item.name}</h3>
                        <p className="text-sm text-gray-600 font-mono mt-1">
                          {item.selectedColor && `Color: ${item.selectedColor}`}
                          {item.selectedColor && item.selectedSize && ', '}
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border-2 border-black rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-2 hover:bg-gray-100 border-r-2 border-black transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-mono font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 border-l-2 border-black transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xl font-bold font-mono">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <Card className="p-6 border-2 border-black shadow-retro bg-white sticky top-24">
              <h2 className="text-xl font-bold font-syne mb-6">Order Summary</h2>
              
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {summary?.discountCode && `(${summary.discountCode})`}</span>
                    <span className="font-bold">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-bold">{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t-2 border-black pt-4 mt-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold font-mono">Discount Code</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter code" 
                      className="border-2 border-black rounded-none focus:ring-0 font-mono"
                    />
                    <Button 
                      variant="outline" 
                      className="border-2 border-black bg-gray-100 hover:bg-gray-200 text-black font-mono"
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">You can also ask the chatbot to apply a code!</p>
                </div>

                <Button 
                  className="w-full bg-[#0099FF] hover:bg-[#007ACC] text-white border-2 border-black shadow-retro py-6 text-lg font-bold font-syne"
                  onClick={() => router.push('/checkout')}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
