'use client'

import { useState, useEffect, useRef } from 'react'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Header } from '@/components/layout/header'
import { MapPin, Phone, Mail, User, CreditCard, Package, ArrowRight, ArrowLeft, Check, Smartphone, QrCode as QrCodeIcon } from 'lucide-react'
import { useAuthContext } from '@/context/auth-context'
import QRCode from 'qrcode'

export default function CheckoutPage() {
  const { cart, summary, clearCart } = useCart()
  const { user } = useAuthContext()
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Shipping, 2: Review & Payment, 3: QR Code Payment
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [shippingDetails, setShippingDetails] = useState({
    full_name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'India'
  })
  const [notes, setNotes] = useState('')
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Give time for cart to load from Firestore before redirecting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isLoading && cart.length === 0 && step === 1) {
      if (!isProcessing) {
        console.log('Cart is empty, redirecting to cart page')
        router.push('/cart')
      }
    }
  }, [cart, router, step, isProcessing, isLoading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setShippingDetails(prev => ({ ...prev, [name]: value }))
  }

  const validateShippingDetails = () => {
    const required = ['full_name', 'email', 'phone', 'address_line1', 'city', 'state', 'zip_code']
    for (const field of required) {
      if (!shippingDetails[field as keyof typeof shippingDetails]) {
        alert(`Please fill in ${field.replace('_', ' ')}`)
        return false
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shippingDetails.email)) {
      alert('Please enter a valid email address')
      return false
    }
    
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(shippingDetails.phone)) {
      alert('Please enter a valid 10-digit phone number')
      return false
    }
    
    const zipRegex = /^[0-9]{6}$/
    if (!zipRegex.test(shippingDetails.zip_code)) {
      alert('Please enter a valid 6-digit PIN code')
      return false
    }
    
    return true
  }

  const handleContinueToPayment = () => {
    if (validateShippingDetails()) {
      setStep(2)
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      console.log('Creating mock payment for user:', user?.uid)
      
      // Create mock payment session
      const paymentResponse = await api.post('/api/v1/payment/create-mock-payment', {
        user_id: user?.uid,
        discount_code: summary.discountCode
      })

      console.log('Payment response:', paymentResponse.data)
      
      const { payment_id, qr_url } = paymentResponse.data
      setPaymentId(payment_id)
      
      // Generate QR Code URL
      const fullQrUrl = `${window.location.origin}/${qr_url}`
      console.log('QR URL:', fullQrUrl)
      setQrCodeUrl(fullQrUrl)
      
      setStep(3) // Move to QR code step first
      setIsProcessing(false)
      
      // Generate QR code after a small delay to ensure canvas is rendered
      setTimeout(async () => {
        if (canvasRef.current) {
          try {
            await QRCode.toCanvas(canvasRef.current, fullQrUrl, {
              width: 300,
              margin: 2,
              color: {
                dark: '#1A1A1A',
                light: '#FDFBF7'
              }
            })
            console.log('QR code generated successfully on canvas')
          } catch (qrError) {
            console.error('QR generation error:', qrError)
          }
        } else {
          console.error('Canvas ref is null')
        }
      }, 100)
      
      // Start polling for payment status
      startPolling(payment_id)
      
    } catch (error: any) {
      console.error('Payment error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to initialize payment'
      alert(`Payment Error: ${errorMessage}. Please try again.`)
      setIsProcessing(false)
    }
  }

  const startPolling = (pid: string) => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await api.get(`/api/v1/payment/mock-payment-status/${pid}`)
        
        if (statusResponse.data.status === 'SUCCESS') {
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          
          setTransactionId(statusResponse.data.transaction_id)
          
          // Process checkout
          await processCheckout(pid, statusResponse.data.transaction_id)
        } else if (statusResponse.data.status === 'EXPIRED') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
          }
          alert('Payment session expired. Please try again.')
          setStep(2)
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000) // Poll every 2 seconds
  }

  const processCheckout = async (pid: string, txnId: string) => {
    try {
      // Map cart items to backend format
      const cartItems = cart.map(item => ({
        id: String(item.id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize
      }))

      const checkoutResponse = await api.post('/api/v1/checkout/checkout', {
        user_id: user?.uid,
        shipping_address: shippingDetails,
        cart_items: cartItems,
        subtotal: summary.subtotal,
        shipping: summary.shipping,
        discount: summary.discount,
        total: summary.total,
        discount_code: summary.discountCode,
        payment_id: pid,
        transaction_id: txnId,
        notes: notes
      })

      if (checkoutResponse.data.success) {
        clearCart()
        router.push(`/checkout/success?order_id=${checkoutResponse.data.order_id}`)
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      alert('Failed to process order. Please contact support.')
    }
  }

  useEffect(() => {
    // Generate QR code when step changes to 3 and we have the URL
    if (step === 3 && qrCodeUrl && canvasRef.current) {
      console.log('Generating QR code for:', qrCodeUrl)
      QRCode.toCanvas(canvasRef.current, qrCodeUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1A1A1A',
          light: '#FDFBF7'
        }
      }).then(() => {
        console.log('QR code rendered successfully')
      }).catch((err) => {
        console.error('QR code rendering failed:', err)
      })
    }
  }, [step, qrCodeUrl])

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-24 flex items-center justify-center">
            <div className="text-center bg-card border-4 border-border shadow-retro p-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
              <h1 className="text-2xl font-bold mb-4 font-syne uppercase">Loading checkout...</h1>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (cart.length === 0 && !isProcessing) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <div className="container mx-auto px-4 py-24 flex items-center justify-center">
            <div className="text-center bg-card border-4 border-border shadow-retro p-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h1 className="text-2xl font-bold mb-4 font-syne uppercase">Your cart is empty</h1>
              <Button 
                onClick={() => router.push('/shop')}
                className="bg-primary text-primary-foreground border-2 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-mono font-bold uppercase"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <div className="container mx-auto px-4 py-8 mt-16">
          {/* Progress Steps */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 border-4 border-border flex items-center justify-center font-bold font-mono shadow-retro ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  {step > 1 ? <Check className="w-6 h-6" /> : '1'}
                </div>
                <span className="font-bold uppercase font-mono text-sm hidden md:inline">Shipping</span>
              </div>
              
              <div className="w-16 h-1 bg-border" />
              
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 border-4 border-border flex items-center justify-center font-bold font-mono shadow-retro ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                  2
                </div>
                <span className="font-bold uppercase font-mono text-sm hidden md:inline">Payment</span>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold font-syne mb-8 text-center uppercase border-b-4 border-border pb-4">Checkout</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Forms */}
              <div className="lg:col-span-2 space-y-6">
                {step === 1 ? (
                  <div className="bg-card border-4 border-border shadow-retro p-6">
                    <h2 className="text-2xl font-bold font-syne mb-6 uppercase flex items-center border-b-4 border-border pb-4">
                      <MapPin className="w-6 h-6 mr-3" />
                      Shipping Details
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name" className="font-mono font-bold uppercase text-xs">Full Name *</Label>
                          <div className="relative mt-2">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input 
                              id="full_name" 
                              name="full_name" 
                              required 
                              value={shippingDetails.full_name}
                              onChange={handleInputChange}
                              className="pl-10 border-2 border-border font-mono shadow-retro focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email" className="font-mono font-bold uppercase text-xs">Email *</Label>
                          <div className="relative mt-2">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input 
                              id="email" 
                              name="email" 
                              type="email"
                              required 
                              value={shippingDetails.email}
                              onChange={handleInputChange}
                              className="pl-10 border-2 border-border font-mono shadow-retro focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all"
                              placeholder="john@example.com"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone" className="font-mono font-bold uppercase text-xs">Phone Number *</Label>
                        <div className="relative mt-2">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input 
                            id="phone" 
                            name="phone" 
                            required 
                            value={shippingDetails.phone}
                            onChange={handleInputChange}
                            className="pl-10 border-2 border-border font-mono shadow-retro focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all"
                            placeholder="9876543210"
                            maxLength={10}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address_line1" className="font-mono font-bold uppercase text-xs">Address Line 1 *</Label>
                        <Input 
                          id="address_line1" 
                          name="address_line1" 
                          required 
                          value={shippingDetails.address_line1}
                          onChange={handleInputChange}
                          className="mt-2 border-2 border-border font-mono shadow-retro focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all"
                          placeholder="Street address, building number"
                        />
                      </div>

                      <div>
                        <Label htmlFor="address_line2" className="font-mono font-bold uppercase text-xs">Address Line 2</Label>
                        <Input 
                          id="address_line2" 
                          name="address_line2" 
                          value={shippingDetails.address_line2}
                          onChange={handleInputChange}
                          className="mt-2 border-2 border-border font-mono shadow-retro focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all"
                          placeholder="Apartment, suite, etc. (optional)"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city" className="font-mono font-bold uppercase text-xs">City *</Label>
                          <Input 
                            id="city" 
                            name="city" 
                            required 
                            value={shippingDetails.city}
                            onChange={handleInputChange}
                            className="mt-2 border-2 border-border font-mono shadow-retro focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all"
                            placeholder="Mumbai"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="state" className="font-mono font-bold uppercase text-xs">State *</Label>
                          <Input 
                            id="state" 
                            name="state" 
                            required 
                            value={shippingDetails.state}
                            onChange={handleInputChange}
                            className="mt-2 border-2 border-border font-mono shadow-retro focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all"
                            placeholder="Maharashtra"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="zip_code" className="font-mono font-bold uppercase text-xs">PIN Code *</Label>
                          <Input 
                            id="zip_code" 
                            name="zip_code" 
                            required 
                            value={shippingDetails.zip_code}
                            onChange={handleInputChange}
                            className="mt-2 border-2 border-border font-mono shadow-retro focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all"
                            placeholder="400001"
                            maxLength={6}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes" className="font-mono font-bold uppercase text-xs">Order Notes (Optional)</Label>
                        <Textarea 
                          id="notes" 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="mt-2 border-2 border-border font-mono shadow-retro focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all min-h-[100px]"
                          placeholder="Any special instructions for delivery..."
                        />
                      </div>

                      <Button 
                        onClick={handleContinueToPayment}
                        className="w-full bg-primary text-primary-foreground border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-mono font-bold uppercase py-6 text-lg"
                      >
                        Continue to Payment
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                ) : step === 2 ? (
                  <div className="space-y-6">
                    {/* Review Shipping Details */}
                    <div className="bg-card border-4 border-border shadow-retro p-6">
                      <div className="flex items-center justify-between mb-4 border-b-4 border-border pb-4">
                        <h2 className="text-2xl font-bold font-syne uppercase flex items-center">
                          <MapPin className="w-6 h-6 mr-3" />
                          Shipping Address
                        </h2>
                        <Button 
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="border-2 border-border shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all font-mono font-bold uppercase text-xs"
                        >
                          Edit
                        </Button>
                      </div>
                      <div className="bg-muted border-2 border-border p-4 font-mono text-sm">
                        <p className="font-bold">{shippingDetails.full_name}</p>
                        <p>{shippingDetails.email}</p>
                        <p>{shippingDetails.phone}</p>
                        <p className="mt-2">{shippingDetails.address_line1}</p>
                        {shippingDetails.address_line2 && <p>{shippingDetails.address_line2}</p>}
                        <p>{shippingDetails.city}, {shippingDetails.state} {shippingDetails.zip_code}</p>
                        <p>{shippingDetails.country}</p>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-card border-4 border-border shadow-retro p-6">
                      <h2 className="text-2xl font-bold font-syne mb-6 uppercase flex items-center border-b-4 border-border pb-4">
                        <CreditCard className="w-6 h-6 mr-3" />
                        Payment Method
                      </h2>
                      
                      <div className="bg-accent border-4 border-border p-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-primary border-2 border-border flex items-center justify-center shadow-retro">
                            <QrCodeIcon className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-bold font-mono uppercase">Mock UPI Payment</p>
                            <p className="text-xs font-mono text-muted-foreground">Scan QR Code to Pay</p>
                          </div>
                        </div>
                        <p className="text-xs font-mono mt-3">
                          Click Continue to generate a QR code. Scan with your phone to complete the mock payment.
                        </p>
                      </div>

                      <Button 
                        onClick={() => {
                          console.log('Payment button clicked')
                          console.log('User:', user)
                          console.log('Summary:', summary)
                          handlePayment()
                        }}
                        disabled={isProcessing}
                        className="w-full bg-primary text-primary-foreground border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-mono font-bold uppercase py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Generating QR...' : `Continue to Pay ₹${summary.total.toFixed(2)}`}
                      </Button>

                      <Button 
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="w-full mt-3 border-2 border-border shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all font-mono font-bold uppercase"
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Back to Shipping
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* QR Code Payment */}
                    <div className="bg-card border-4 border-border shadow-retro p-8">
                      <h2 className="text-2xl font-bold font-syne mb-6 uppercase flex items-center border-b-4 border-border pb-4">
                        <Smartphone className="w-6 h-6 mr-3" />
                        Scan QR Code to Pay
                      </h2>
                      
                      {/* QR Code Display */}
                      <div className="flex flex-col items-center mb-6">
                        <div className="bg-white border-4 border-border p-6 shadow-retro mb-4">
                          <canvas ref={canvasRef} />
                        </div>
                        
                        <div className="bg-accent/20 border-4 border-border p-6 w-full text-center">
                          <p className="font-bold font-mono uppercase text-sm mb-2">Payment Amount</p>
                          <p className="text-4xl font-bold font-mono text-primary">₹{summary.total.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="bg-muted border-4 border-border p-6 mb-6">
                        <p className="font-bold font-mono uppercase text-sm mb-4">How to Pay:</p>
                        <ol className="space-y-3 font-mono text-sm">
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-primary border-2 border-border flex items-center justify-center flex-shrink-0 font-bold text-primary-foreground">1</span>
                            <span>Open camera on your phone</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-primary border-2 border-border flex items-center justify-center flex-shrink-0 font-bold text-primary-foreground">2</span>
                            <span>Scan the QR code above</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-primary border-2 border-border flex items-center justify-center flex-shrink-0 font-bold text-primary-foreground">3</span>
                            <span>Click &ldquo;Pay&rdquo; button on the payment page</span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 bg-primary border-2 border-border flex items-center justify-center flex-shrink-0 font-bold text-primary-foreground">4</span>
                            <span>Wait for confirmation (automatic)</span>
                          </li>
                        </ol>
                      </div>

                      {/* Waiting Animation */}
                      <div className="bg-accent border-4 border-border p-6 text-center">
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <div className="w-4 h-4 bg-primary border-2 border-border animate-pulse" />
                          <div className="w-4 h-4 bg-primary border-2 border-border animate-pulse delay-100" />
                          <div className="w-4 h-4 bg-primary border-2 border-border animate-pulse delay-200" />
                        </div>
                        <p className="font-bold font-mono uppercase text-sm">Waiting for payment...</p>
                        <p className="text-xs font-mono text-muted-foreground mt-2">Session expires in 15 minutes</p>
                      </div>

                      <Button 
                        variant="outline"
                        onClick={() => {
                          if (pollingIntervalRef.current) {
                            clearInterval(pollingIntervalRef.current)
                          }
                          setStep(2)
                        }}
                        className="w-full mt-6 border-2 border-border shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all font-mono font-bold uppercase"
                      >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Cancel Payment
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border-4 border-border shadow-retro p-6 sticky top-24">
                  <h2 className="text-xl font-bold font-syne mb-4 uppercase border-b-4 border-border pb-4">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={`${item.id}-${item.selectedSize || 'default'}`} className="flex gap-3 bg-muted border-2 border-border p-3">
                        <div className="w-16 h-16 bg-white border-2 border-border flex items-center justify-center flex-shrink-0">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm font-mono truncate">{item.name}</p>
                          <p className="text-xs font-mono text-muted-foreground">
                            Size: {item.selectedSize || 'N/A'} • Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-bold font-mono mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 font-mono text-sm border-t-4 border-border pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold">₹{summary.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span className="font-bold">₹{summary.shipping.toFixed(2)}</span>
                    </div>
                    {summary.discount > 0 && (
                      <div className="flex justify-between text-primary">
                        <span>Discount:</span>
                        <span className="font-bold">-₹{summary.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg pt-2 border-t-2 border-border">
                      <span className="font-bold uppercase">Total:</span>
                      <span className="font-bold">₹{summary.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 bg-accent/20 border-2 border-border p-4">
                    <p className="text-xs font-mono font-bold uppercase mb-2">Estimated Delivery</p>
                    <p className="text-sm font-mono">3-5 Business Days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
