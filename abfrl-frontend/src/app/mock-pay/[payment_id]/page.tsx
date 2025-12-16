  'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Check, Loader2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function MockPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.payment_id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [amount, setAmount] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Extract amount from URL query params if available
    const urlParams = new URLSearchParams(window.location.search)
    const amountParam = urlParams.get('amount')
    if (amountParam) {
      setAmount(parseFloat(amountParam))
    }
  }, [])

  const handlePay = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/payment/confirm-mock-payment/${paymentId}`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Payment confirmation failed')
      }

      const data = await response.json()
      
      setIsSuccess(true)
      
      // Show success for 2 seconds then close
      setTimeout(() => {
        window.close() // Try to close the tab
      }, 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border-4 border-border shadow-retro p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 border-4 border-border mx-auto mb-6 flex items-center justify-center shadow-retro animate-bounce">
            <Check className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold font-syne uppercase mb-3">Payment Successful!</h1>
          <p className="font-mono text-sm text-muted-foreground mb-6">
            Your payment has been confirmed
          </p>
          
          <div className="bg-accent border-4 border-border p-4">
            <p className="font-mono text-xs">This window will close automatically...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border-4 border-border shadow-retro p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8 border-b-4 border-border pb-6">
          <div className="w-16 h-16 bg-primary border-4 border-border mx-auto mb-4 flex items-center justify-center shadow-retro">
            <CreditCard className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-syne uppercase mb-2">Mock UPI Payment</h1>
          <p className="font-mono text-xs text-muted-foreground">Hackathon Demo Payment System</p>
        </div>

        {/* Amount */}
        {amount > 0 && (
          <div className="bg-accent border-4 border-border p-6 mb-6 text-center">
            <p className="font-bold font-mono uppercase text-sm mb-2 text-muted-foreground">Amount to Pay</p>
            <p className="text-5xl font-bold font-mono text-primary">₹{amount.toFixed(2)}</p>
          </div>
        )}

        {/* Payment ID */}
        <div className="bg-muted border-4 border-border p-4 mb-6">
          <p className="font-bold font-mono uppercase text-xs mb-2">Payment ID</p>
          <p className="font-mono text-xs break-all">{paymentId}</p>
        </div>

        {/* Payment Details */}
        <div className="bg-card border-2 border-border p-4 mb-6 space-y-3">
          <div className="flex justify-between items-center font-mono text-sm">
            <span className="text-muted-foreground">To:</span>
            <span className="font-bold">ABFRL Store</span>
          </div>
          <div className="flex justify-between items-center font-mono text-sm">
            <span className="text-muted-foreground">UPI ID:</span>
            <span className="font-bold">abfrl@mockupi</span>
          </div>
          <div className="flex justify-between items-center font-mono text-sm">
            <span className="text-muted-foreground">Mode:</span>
            <span className="font-bold">MOCK PAYMENT</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border-4 border-red-500 p-4 mb-6 text-center">
            <p className="font-mono text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Pay Button */}
        <Button
          onClick={handlePay}
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-mono font-bold uppercase py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Check className="mr-2 w-5 h-5" />
              Confirm Payment
            </>
          )}
        </Button>

        {/* Disclaimer */}
        <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4 text-center">
          <p className="font-mono text-xs font-bold uppercase mb-2">⚠️ Demo Only</p>
          <p className="font-mono text-xs text-muted-foreground">
            This is a mock payment system for hackathon demonstration. No real money is being processed.
          </p>
        </div>
      </div>
    </div>
  )
}
