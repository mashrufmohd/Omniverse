import { Product, Order, CartItem } from './index'

export interface AdminUser {
  id: string
  name: string | null
  email: string | null
  role: 'user' | 'admin'
  totalOrders: number
  totalSpent: number
  createdAt: string
  lastLoginAt?: string
}

export interface AdminOrder extends Order {
  userId: string
  userName: string
  userEmail: string
  paymentStatus: 'pending' | 'paid' | 'failed'
  stripeTransactionId?: string
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: number
  productId: number
  productName: string
  sku: string
  size: string
  color: string
  quantity: number
  lowStockThreshold: number
  isLowStock: boolean
}

export interface DashboardMetrics {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  lowStockProducts: number
  todaysRevenue: number
  monthlyRevenue: number
}

export interface RevenueData {
  date: string
  revenue: number
  orders: number
}

export interface TopProduct {
  productId: number
  productName: string
  totalSold: number
  revenue: number
}

export interface AnalyticsData {
  revenueByDay: RevenueData[]
  revenueByMonth: RevenueData[]
  topProducts: TopProduct[]
  averageOrderValue: number
  totalRevenue: number
  totalOrders: number
}
