'use client'

import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Package, Clock, CheckCircle, XCircle, Truck, Calendar, MapPin, CreditCard } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuthContext } from '@/context/auth-context'
import { useRouter } from 'next/navigation'

interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price: number
  size?: string
}

interface Order {
  _id: string
  user_id: string
  total_amount: number
  subtotal: number
  shipping_cost: number
  discount_amount: number
  discount_code?: string
  status: string
  payment_status: string
  payment_method: string
  razorpay_order_id?: string
  razorpay_payment_id?: string
  shipping_name: string
  shipping_email: string
  shipping_phone: string
  shipping_address_line1: string
  shipping_address_line2?: string
  shipping_city: string
  shipping_state: string
  shipping_zip: string
  shipping_country: string
  items: OrderItem[]
  created_at: string
  notes?: string
}

const statusConfig = {
  pending: { icon: Clock, color: 'bg-accent', textColor: 'text-accent-foreground', label: 'PENDING' },
  confirmed: { icon: CheckCircle, color: 'bg-secondary', textColor: 'text-secondary-foreground', label: 'CONFIRMED' },
  processing: { icon: Package, color: 'bg-primary', textColor: 'text-primary-foreground', label: 'PROCESSING' },
  shipped: { icon: Truck, color: 'bg-secondary', textColor: 'text-secondary-foreground', label: 'SHIPPED' },
  delivered: { icon: CheckCircle, color: 'bg-secondary', textColor: 'text-secondary-foreground', label: 'DELIVERED' },
  cancelled: { icon: XCircle, color: 'bg-muted', textColor: 'text-muted-foreground', label: 'CANCELLED' }
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Redirect shopkeepers to login page - they need to login as user
  useEffect(() => {
    if (!authLoading && user && user.role === 'shopkeeper') {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return
      
      try {
        const response = await api.get(`/api/v1/orders/user/${user.uid}`)
        setOrders(response.data.orders || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
      <div className="min-h-screen bg-background">
        <Header />
      
        <main className="container mx-auto px-4 py-8 mt-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 border-b-4 border-border pb-4">
              <h1 className="text-4xl font-bold font-syne uppercase">Your Orders</h1>
              <p className="text-muted-foreground font-mono mt-2">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="bg-card border-4 border-border shadow-retro p-8">
                  <Package className="w-12 h-12 animate-pulse text-primary mx-auto mb-4" />
                  <p className="font-mono font-bold uppercase text-center">Loading orders...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card border-4 border-border shadow-retro">
                <Package className="w-24 h-24 text-muted-foreground mb-6" />
                <h2 className="text-2xl font-bold font-syne uppercase mb-2">No Orders Yet</h2>
                <p className="text-muted-foreground font-mono mb-6">Start shopping to see your orders here</p>
                <Button 
                  onClick={() => router.push('/shop')}
                  className="bg-primary text-primary-foreground border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-mono font-bold uppercase"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
                  const StatusIcon = status.icon

                  return (
                    <div 
                      key={order._id} 
                      className="bg-card border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      {/* Order Header */}
                      <div className="bg-muted border-b-4 border-border p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 border-4 border-border ${status.color} flex items-center justify-center shadow-retro`}>
                              <StatusIcon className={`w-6 h-6 ${status.textColor}`} />
                            </div>
                            <div>
                              <p className="font-bold font-mono uppercase text-xs text-muted-foreground">Order #{order._id.slice(-8).toUpperCase()}</p>
                              <p className="font-bold font-mono text-lg">₹{order.total_amount.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs font-mono font-bold uppercase text-muted-foreground">Status</p>
                              <p className="font-bold font-mono uppercase text-sm">{status.label}</p>
                            </div>
                            <div className={`px-4 py-2 border-2 border-border ${status.color} font-mono font-bold uppercase text-xs ${status.textColor}`}>
                              {status.label}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="p-6 space-y-6">
                        {/* Order Items */}
                        <div>
                          <h3 className="font-bold font-mono uppercase text-sm mb-3 flex items-center border-b-2 border-border pb-2">
                            <Package className="w-4 h-4 mr-2" />
                            Items ({order.items.length})
                          </h3>
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex gap-3 bg-muted border-2 border-border p-3">
                                <div className="w-16 h-16 bg-white border-2 border-border flex items-center justify-center flex-shrink-0">
                                  <Package className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-sm font-mono">{item.product_name}</p>
                                  <p className="text-xs font-mono text-muted-foreground">
                                    {item.size && `Size: ${item.size} • `}Qty: {item.quantity}
                                  </p>
                                  <p className="text-sm font-bold font-mono mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Shipping Address */}
                          <div className="bg-muted border-2 border-border p-4">
                            <h3 className="font-bold font-mono uppercase text-xs mb-3 flex items-center border-b-2 border-border pb-2">
                              <MapPin className="w-4 h-4 mr-2" />
                              Shipping Address
                            </h3>
                            <div className="font-mono text-sm space-y-1">
                              <p className="font-bold">{order.shipping_name}</p>
                              <p>{order.shipping_phone}</p>
                              <p className="mt-2">{order.shipping_address_line1}</p>
                              {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                              <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
                            </div>
                          </div>

                          {/* Payment & Order Info */}
                          <div className="bg-muted border-2 border-border p-4">
                            <h3 className="font-bold font-mono uppercase text-xs mb-3 flex items-center border-b-2 border-border pb-2">
                              <CreditCard className="w-4 h-4 mr-2" />
                              Payment Details
                            </h3>
                            <div className="font-mono text-sm space-y-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-bold uppercase">{order.payment_method}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-bold uppercase text-secondary">{order.payment_status}</span>
                              </div>
                              {order.razorpay_payment_id && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Payment ID:</span>
                                  <span className="font-bold text-xs">{order.razorpay_payment_id.slice(-12)}</span>
                                </div>
                              )}
                              <div className="flex justify-between pt-2 border-t border-border">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-bold">₹{order.subtotal.toFixed(2)}</span>
                              </div>
                              {order.discount_amount > 0 && (
                                <div className="flex justify-between text-primary">
                                  <span>Discount:</span>
                                  <span className="font-bold">-₹{order.discount_amount.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping:</span>
                                <span className="font-bold">₹{order.shipping_cost.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-lg font-bold pt-2 border-t-2 border-border">
                                <span className="uppercase">Total:</span>
                                <span>₹{order.total_amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Date */}
                        <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground border-t-2 border-border pt-4">
                          <Calendar className="w-4 h-4" />
                          <span>Placed on {formatDate(order.created_at)} at {formatTime(order.created_at)}</span>
                        </div>

                        {order.notes && (
                          <div className="bg-accent/20 border-2 border-border p-4">
                            <p className="font-bold font-mono uppercase text-xs mb-2">Order Notes</p>
                            <p className="font-mono text-sm">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
