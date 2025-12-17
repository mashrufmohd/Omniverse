'use client'

import { useState } from 'react'
import { StatCard } from '@/components/admin/stat-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package, 
  AlertTriangle,
  TrendingUp 
} from 'lucide-react'
import { DashboardMetrics, TopProduct, AdminOrder } from '@/types/admin'

export default function AdminDashboard() {
  // Mock data - no backend calls
  const [metrics] = useState<DashboardMetrics>({
    totalRevenue: 125430,
    totalOrders: 342,
    totalCustomers: 89,
    totalProducts: 156,
    lowStockProducts: 8,
    revenueChange: 12.5
  })

  const [recentOrders] = useState<AdminOrder[]>([
    {
      id: '1',
      customerName: 'John Doe',
      items: 3,
      total: 1250,
      status: 'pending',
      date: new Date().toISOString()
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      items: 2,
      total: 890,
      status: 'delivered',
      date: new Date().toISOString()
    }
  ])

  const [topProducts] = useState<TopProduct[]>([
    { id: '1', name: 'Product A', sales: 145, revenue: 12500 },
    { id: '2', name: 'Product B', sales: 98, revenue: 8900 }
  ])

  const [loading] = useState(false)

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-primary border-r-transparent rounded-full" />
            <p className="mt-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Loading Dashboard...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-border pb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wide font-mono">
          Shopkeeper Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your products and track sales
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          icon={DollarSign}
          description="All time revenue"
        />
        <StatCard
          title="Total Orders"
          value={metrics?.totalOrders || 0}
          icon={ShoppingCart}
          description="Completed orders"
        />
        <StatCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          icon={Users}
          description="Registered customers"
        />
        <StatCard
          title="Total Products"
          value={metrics?.totalProducts || 0}
          icon={Package}
          description="Active products"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(metrics?.todaysRevenue || 0)}
          icon={TrendingUp}
          description="Revenue generated today"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(metrics?.monthlyRevenue || 0)}
          icon={DollarSign}
          description="Current month"
        />
        <StatCard
          title="Low Stock Alerts"
          value={metrics?.lowStockProducts || 0}
          icon={AlertTriangle}
          description="Products need restocking"
          className={metrics?.lowStockProducts ? "border-primary" : ""}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold uppercase tracking-wide">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No recent orders
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.userName || order.userEmail}
                      </TableCell>
                      <TableCell className="font-bold">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-bold uppercase border-2 border-border ${
                          order.status === 'delivered' 
                            ? 'bg-secondary/20 text-secondary' 
                            : order.status === 'shipped'
                            ? 'bg-accent/20 text-accent-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold uppercase tracking-wide">
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No product data available
              </p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div 
                    key={product.productId}
                    className="flex items-center justify-between p-4 border-2 border-border bg-muted/20 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center border-2 border-border bg-primary/10 font-bold font-mono">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-bold">{product.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.totalSold} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-mono">
                        {formatCurrency(product.revenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
