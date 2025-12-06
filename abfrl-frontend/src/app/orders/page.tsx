'use client'

import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Package, Truck, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
  // Mock orders
  const orders = [
    {
      id: '#173459',
      date: 'Oct 28, 2023',
      status: 'Delivered',
      total: 154.99,
      items: ['AeroStride Pro']
    },
    {
      id: '#173412',
      date: 'Sep 15, 2023',
      status: 'Shipped',
      total: 89.50,
      items: ['Urban Trekker Hoodie', 'Classic Cap']
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 font-mono uppercase">My Orders</h1>
        
        <div className="space-y-6 max-w-3xl">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border-2 border-border shadow-retro p-6 transition-all hover:shadow-retro-hover">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b-2 border-border pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold font-mono">{order.id}</h2>
                    <span className="px-2 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase border border-border">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Placed on {order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-xl font-bold font-mono">${order.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted border border-border flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-4">
                <Button variant="outline" className="flex-1 font-bold uppercase">
                  View Details
                </Button>
                <Button className="flex-1 font-bold uppercase gap-2">
                  <Truck className="h-4 w-4" />
                  Track Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
