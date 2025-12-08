'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border-2 border-black shadow-retro p-8 text-center space-y-6">
        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto border-2 border-black">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-syne mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Your order has been confirmed and will be shipped soon.</p>
        </div>
        <div className="bg-gray-50 p-4 border-2 border-black text-left text-sm space-y-2">
          <div className="flex justify-between">
            <span>Order Status</span>
            <span className="font-mono font-bold text-green-600">CONFIRMED</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Delivery</span>
            <span className="font-bold">3-5 Business Days</span>
          </div>
        </div>
        <Link href="/" className="block">
          <Button className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black shadow-retro py-6 text-lg font-mono uppercase tracking-wide">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  )
}
