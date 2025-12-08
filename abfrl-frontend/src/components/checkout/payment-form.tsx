'use client'

import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import api from '@/lib/api'
import { DEFAULT_USER_ID } from '@/lib/constants'
import { useRouter } from 'next/navigation'

interface PaymentFormProps {
  shippingDetails: any
}

export default function PaymentForm({ shippingDetails }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { summary, clearCart } = useCart()
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL where the customer should be redirected after the payment
        return_url: `${window.location.origin}/checkout/success`,
      },
      redirect: 'if_required'
    })

    if (error) {
      setMessage(error.message ?? "An unexpected error occurred.")
      setIsLoading(false)
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment successful, create order in backend
      try {
        await api.post('/api/v1/checkout', {
          user_id: DEFAULT_USER_ID,
          shipping_address: shippingDetails,
          payment_info: {
            method: 'stripe',
            transaction_id: paymentIntent.id,
            amount: summary.total,
            currency: 'inr',
            status: 'completed',
            payment_intent_id: paymentIntent.id
          }
        })
        
        clearCart()
        router.push('/checkout/success')
      } catch (err) {
        console.error("Error creating order:", err)
        setMessage("Payment successful but failed to create order. Please contact support.")
        setIsLoading(false)
      }
    } else {
      setMessage("Payment status: " + paymentIntent?.status)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {message && <div className="text-red-500 text-sm">{message}</div>}
      <Button 
        disabled={isLoading || !stripe || !elements} 
        className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-retro py-6 text-lg font-mono"
      >
        {isLoading ? "Processing..." : `Pay ₹${summary.total.toFixed(2)}`}
      </Button>
    </form>
  )
}
