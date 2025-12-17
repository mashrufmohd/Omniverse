'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/table'
import { Modal } from '@/components/admin/modal'
import { Card } from '@/components/ui/card'
import { Search, Eye, Filter } from 'lucide-react'
import { getAllOrders, getOrderById, updateOrderStatus } from '@/lib/api/admin'
import { AdminOrder } from '@/types/admin'

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    let filtered = orders

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [searchQuery, statusFilter, orders])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await getAllOrders()
      setOrders(data)
      setFilteredOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await getOrderById(orderId)
      setSelectedOrder(order)
      setIsDetailsModalOpen(true)
    } catch (error) {
      console.error('Error loading order details:', error)
      alert('Failed to load order details')
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(order => order.id === orderId ? updated : order))
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-secondary/20 text-secondary'
      case 'shipped':
        return 'bg-accent/20 text-accent-foreground'
      case 'processing':
        return 'bg-primary/20 text-primary'
      case 'cancelled':
        return 'bg-muted text-muted-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-primary border-r-transparent rounded-full" />
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Loading Orders...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-border pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wide font-mono">
          Orders
        </h1>
        <p className="mt-2 text-muted-foreground">
          View and manage customer orders
        </p>
      </div>

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-border focus-visible:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border-2 border-border bg-background font-bold text-sm uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="all">All Status</option>
              {ORDER_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm font-bold text-muted-foreground whitespace-nowrap">
            {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="p-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="mt-4 text-lg font-bold">No orders found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No orders available'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs font-bold">
                    #{order.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-bold">{order.userName || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{order.userEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(order.date)}
                  </TableCell>
                  <TableCell className="font-bold">
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="font-bold font-mono">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-bold uppercase border-2 border-border ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-secondary/20 text-secondary' 
                        : order.paymentStatus === 'failed'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </TableCell>
                  <TableCell>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-bold uppercase border-2 border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${getStatusColor(order.status)}`}
                    >
                      {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order.id)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Order Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-border bg-muted/20">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                  Order ID
                </p>
                <p className="font-mono font-bold">#{selectedOrder.id}</p>
              </div>
              <div className="p-4 border-2 border-border bg-muted/20">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                  Order Date
                </p>
                <p className="font-bold">{formatDate(selectedOrder.date)}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="p-4 border-2 border-border">
              <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">Name:</span> {selectedOrder.userName || 'N/A'}</p>
                <p><span className="font-bold">Email:</span> {selectedOrder.userEmail}</p>
                <p><span className="font-bold">User ID:</span> <span className="font-mono">{selectedOrder.userId}</span></p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-2 border-border">
              <div className="p-4 border-b-2 border-border bg-muted/20">
                <h3 className="text-sm font-bold uppercase tracking-wide">Order Items</h3>
              </div>
              <div className="p-4 space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start p-3 border-2 border-border bg-muted/10">
                    <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <div className="mt-1 text-xs text-muted-foreground space-y-1">
                        {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                        {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold font-mono">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border-2 border-border">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                  Payment Status
                </p>
                <span className={`inline-flex px-3 py-1 text-sm font-bold uppercase border-2 border-border ${
                  selectedOrder.paymentStatus === 'paid' 
                    ? 'bg-secondary/20 text-secondary' 
                    : selectedOrder.paymentStatus === 'failed'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {selectedOrder.paymentStatus}
                </span>
                {selectedOrder.stripeTransactionId && (
                  <p className="mt-2 text-xs font-mono">
                    Transaction: {selectedOrder.stripeTransactionId}
                  </p>
                )}
              </div>
              <div className="p-4 border-2 border-border">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                  Order Status
                </p>
                <span className={`inline-flex px-3 py-1 text-sm font-bold uppercase border-2 border-border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="p-4 border-2 border-border bg-primary/10">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold uppercase">Total Amount</span>
                <span className="text-2xl font-bold font-mono">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
