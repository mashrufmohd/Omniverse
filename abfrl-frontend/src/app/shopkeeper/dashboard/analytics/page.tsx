'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/admin/stat-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/table'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3
} from 'lucide-react'
import { getAnalyticsData, getRevenueByPeriod } from '@/lib/api/admin'
import { AnalyticsData, RevenueData } from '@/types/admin'

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [period, setPeriod] = useState<'day' | 'month'>('day')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  useEffect(() => {
    loadRevenueData()
  }, [period])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      const data = await getAnalyticsData()
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRevenueData = async () => {
    try {
      const data = await getRevenueByPeriod(period)
      setRevenueData(data)
    } catch (error) {
      console.error('Error loading revenue data:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return period === 'day' 
      ? date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      : date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  }

  const calculateTrend = (data: RevenueData[]) => {
    if (data.length < 2) return { value: 0, isPositive: true }
    
    const current = data[data.length - 1].revenue
    const previous = data[data.length - 2].revenue
    
    if (previous === 0) return { value: 0, isPositive: true }
    
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0
    }
  }

  const trend = revenueData.length > 0 ? calculateTrend(revenueData) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-primary border-r-transparent rounded-full" />
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Loading Analytics...
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
          Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Revenue insights and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(analytics?.totalRevenue || 0)}
          icon={DollarSign}
          description="All time"
          trend={trend || undefined}
        />
        <StatCard
          title="Total Orders"
          value={analytics?.totalOrders || 0}
          icon={ShoppingCart}
          description="Completed orders"
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(analytics?.averageOrderValue || 0)}
          icon={TrendingUp}
          description="Per order"
        />
        <StatCard
          title="Revenue Growth"
          value={trend ? `${trend.value}%` : '0%'}
          icon={trend?.isPositive ? TrendingUp : TrendingDown}
          description={`${period === 'day' ? 'Daily' : 'Monthly'} change`}
          className={trend?.isPositive ? 'border-secondary' : 'border-primary'}
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold uppercase tracking-wide">
              Revenue Over Time
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={period === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('day')}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Daily
              </Button>
              <Button
                variant={period === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod('month')}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {revenueData.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-bold">No revenue data available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Simple bar chart visualization */}
              <div className="space-y-3">
                {revenueData.slice(-10).map((data, index) => {
                  const maxRevenue = Math.max(...revenueData.map(d => d.revenue))
                  const barWidth = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-bold">{formatDate(data.date)}</span>
                        <span className="font-mono font-bold">
                          {formatCurrency(data.revenue)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-8 bg-muted border-2 border-border relative overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-16 text-right">
                          {data.orders} orders
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
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
          {!analytics || analytics.topProducts.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No product data available
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topProducts.map((product, index) => {
                  const maxRevenue = Math.max(...analytics.topProducts.map(p => p.revenue))
                  const performance = maxRevenue > 0 ? (product.revenue / maxRevenue) * 100 : 0
                  
                  return (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <div className="flex h-8 w-8 items-center justify-center border-2 border-border bg-primary/10 font-bold font-mono">
                          #{index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">
                        {product.productName}
                      </TableCell>
                      <TableCell className="font-bold">
                        {product.totalSold}
                      </TableCell>
                      <TableCell className="font-bold font-mono">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-4 bg-muted border-2 border-border max-w-[200px] overflow-hidden">
                            <div 
                              className="h-full bg-secondary"
                              style={{ width: `${performance}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground">
                            {Math.round(performance)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase tracking-wide">
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border-2 border-border bg-muted/20">
                <span className="font-bold">Total Revenue</span>
                <span className="text-xl font-bold font-mono">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border-2 border-border">
                <span className="font-bold">Average per Order</span>
                <span className="text-lg font-bold font-mono">
                  {formatCurrency(analytics?.averageOrderValue || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border-2 border-border">
                <span className="font-bold">Total Orders</span>
                <span className="text-lg font-bold">
                  {analytics?.totalOrders || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase tracking-wide">
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border-2 border-border bg-muted/20">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                  Top Product
                </p>
                <p className="font-bold">
                  {analytics?.topProducts[0]?.productName || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {analytics?.topProducts[0]?.totalSold || 0} units sold
                </p>
              </div>
              <div className="p-3 border-2 border-border">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                  Growth Trend
                </p>
                <div className="flex items-center gap-2">
                  {trend?.isPositive ? (
                    <TrendingUp className="h-5 w-5 text-secondary" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-primary" />
                  )}
                  <span className={`text-lg font-bold ${
                    trend?.isPositive ? 'text-secondary' : 'text-primary'
                  }`}>
                    {trend?.value || 0}% {trend?.isPositive ? 'increase' : 'decrease'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
