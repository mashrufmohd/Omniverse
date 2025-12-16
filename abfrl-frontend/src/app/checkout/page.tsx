'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import PaymentForm from '@/components/checkout/payment-form'
import api from '@/lib/api'
import { DEFAULT_USER_ID } from '@/lib/constants'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'

// Replace with your publishable key
const stripePromise = loadStripe("pk_test_51QO8q2P9X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6X6");

export default function CheckoutPage() {
  const { cart, summary } = useCart()
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState("")
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment
  const [shippingDetails, setShippingDetails] = useState({
    full_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India'
  })

  useEffect(() => {
    if (cart.length === 0) {
      // router.push('/cart')
    }
  }, [cart, router])

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Create PaymentIntent
    try {
      const response = await api.post('/api/v1/payment/create-payment-intent', {
        user_id: DEFAULT_USER_ID,
        discount_code: summary.discountCode
      })
      setClientSecret(response.data.clientSecret)
      setStep(2)
    } catch (error) {
      console.error("Error creating payment intent:", error)
      alert("Failed to initialize payment. Please try again.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingDetails(prev => ({ ...prev, [name]: value }))
  }

  if (cart.length === 0) {
      return (
        <ProtectedRoute>
          <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
              <div className="text-center">
                  <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                  <Button onClick={() => router.push('/')}>Continue Shopping</Button>
              </div>
          </div>
        </ProtectedRoute>
      )
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-[#FDFBF7] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold font-syne mb-8 text-center">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Forms */}
          <div className="space-y-6">
            {step === 1 && (
              <Card className="p-6 border-2 border-black shadow-retro bg-white">
                <h2 className="text-xl font-bold font-syne mb-4">Shipping Details</h2>
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input 
                      id="full_name" 
                      name="full_name" 
                      required 
                      value={shippingDetails.full_name}
                      onChange={handleInputChange}
                      className="border-2 border-black rounded-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        value={shippingDetails.email}
                        onChange={handleInputChange}
                        className="border-2 border-black rounded-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        required 
                        value={shippingDetails.phone}
                        onChange={handleInputChange}
                        className="border-2 border-black rounded-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_line1">Address Line 1</Label>
                    <Input 
                      id="address_line1" 
                      name="address_line1" 
                      required 
                      value={shippingDetails.address_line1}
                      onChange={handleInputChange}
                      className="border-2 border-black rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                    <Input 
                      id="address_line2" 
                      name="address_line2" 
                      value={shippingDetails.address_line2}
                      onChange={handleInputChange}
                      className="border-2 border-black rounded-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        required 
                        value={shippingDetails.city}
                        onChange={handleInputChange}
                        className="border-2 border-black rounded-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        name="state" 
                        required 
                        value={shippingDetails.state}
                        onChange={handleInputChange}
                        className="border-2 border-black rounded-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zip_code">ZIP Code</Label>
                      <Input 
                        id="zip_code" 
                        name="zip_code" 
                        required 
                        value={shippingDetails.zip_code}
                        onChange={handleInputChange}
                        className="border-2 border-black rounded-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input 
                        id="country" 
                        name="country" 
                        value={shippingDetails.country}
                        disabled
                        className="border-2 border-black rounded-none bg-gray-100"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-retro py-6 text-lg font-mono mt-4">
                    Continue to Payment
                  </Button>
                </form>
              </Card>
            )}

            {step === 2 && clientSecret && (
              <Card className="p-6 border-2 border-black shadow-retro bg-white">
                <h2 className="text-xl font-bold font-syne mb-4">Payment</h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm shippingDetails={shippingDetails} />
                </Elements>
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="mt-4 w-full border-2 border-black"
                >
                  Back to Shipping
                </Button>
              </Card>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <Card className="p-6 border-2 border-black shadow-retro bg-white sticky top-24">
              <h2 className="text-xl font-bold font-syne mb-6">Order Summary</h2>
              <div className="space-y-4 max-h-60 overflow-y-auto mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 text-sm">
                    <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-gray-600">Qty: {item.quantity} | Size: {item.selectedSize || 'M'}</p>
                    </div>
                    <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 border-t-2 border-black pt-4 font-mono text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{summary.subtotal.toFixed(2)}</span>
                </div>
                {summary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{summary.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{summary.shipping === 0 ? 'Free' : `₹${summary.shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{summary.total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}