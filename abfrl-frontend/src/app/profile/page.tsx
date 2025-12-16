'use client'

import { useAuthContext } from '@/context/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Header } from '@/components/layout/header'
import { User, Mail, Award, Calendar, TrendingUp, Star, Package, ShoppingBag } from 'lucide-react'
import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function Profile() {
  const { user } = useAuthContext()
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [memberSince, setMemberSince] = useState('2024')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.uid) return
      
      try {
        setLoading(true)
        const response = await api.get(`/orders/user/${user.uid}`)
        
        if (response.data.success) {
          const orders = response.data.orders
          setTotalOrders(orders.length)
          
          // Calculate total spent from all orders
          const spent = orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0)
          setTotalSpent(spent)
          
          // Get member since date from first order or user creation
          if (orders.length > 0) {
            const oldestOrder = orders[orders.length - 1]
            const orderDate = new Date(oldestOrder.created_at)
            setMemberSince(orderDate.getFullYear().toString())
          }
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [user?.uid])

  const stats = [
    { label: 'Total Orders', value: loading ? '...' : totalOrders.toString(), icon: Package, color: 'bg-primary' },
    { label: 'Total Spent', value: loading ? '...' : `₹${totalSpent.toFixed(0)}`, icon: ShoppingBag, color: 'bg-accent' },
    { label: 'Member Since', value: memberSince, icon: Calendar, color: 'bg-secondary' },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section with Profile Header */}
        <div className="relative border-b-4 border-border bg-primary overflow-hidden">
          {/* Retro Pattern Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.1) 10px, rgba(0,0,0,.1) 20px)`
            }} />
          </div>
          
          <div className="relative container mx-auto px-4 py-16">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="relative mb-6">
                <div className="relative w-32 h-32 bg-white border-4 border-border shadow-retro flex items-center justify-center transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  <User className="w-16 h-16 text-foreground" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-accent border-4 border-border flex items-center justify-center shadow-retro">
                  <Star className="w-6 h-6 text-foreground fill-foreground" />
                </div>
              </div>
              
              {/* User Info */}
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2 tracking-tight font-syne uppercase">
                {user.name}
              </h1>
              <div className="flex items-center text-primary-foreground text-lg mb-4 font-mono">
                <Mail className="w-5 h-5 mr-2" />
                {user.email}
              </div>
              <div className="inline-flex items-center px-6 py-3 bg-foreground text-background font-mono font-bold uppercase border-2 border-border shadow-retro">
                <Award className="w-5 h-5 mr-2" />
                Premium Member
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="container mx-auto px-4 -mt-8 mb-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-card border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 border-4 border-border ${stat.color} flex items-center justify-center shadow-retro`}>
                      <stat.icon className="w-7 h-7 text-card-foreground" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-card-foreground mb-2 font-mono">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-bold uppercase tracking-wide font-mono">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="container mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Information */}
            <div className="bg-card border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all p-8">
              <h2 className="text-2xl font-bold text-card-foreground mb-6 flex items-center font-syne uppercase border-b-4 border-border pb-4">
                <div className="w-10 h-10 border-4 border-border bg-secondary flex items-center justify-center mr-3 shadow-retro">
                  <User className="w-6 h-6 text-card-foreground" />
                </div>
                Account Info
              </h2>
              <div className="space-y-4">
                <div className="flex items-start p-4 bg-muted border-2 border-border hover:bg-accent/10 transition-colors">
                  <div className="w-10 h-10 border-2 border-border bg-white flex items-center justify-center mr-4 flex-shrink-0">
                    <User className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-1 font-mono">Full Name</div>
                    <div className="text-lg font-bold text-card-foreground font-mono">{user.name}</div>
                  </div>
                </div>
                
                <div className="flex items-start p-4 bg-muted border-2 border-border hover:bg-accent/10 transition-colors">
                  <div className="w-10 h-10 border-2 border-border bg-white flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground font-bold uppercase tracking-wide mb-1 font-mono">Email Address</div>
                    <div className="text-lg font-bold text-card-foreground font-mono break-all">{user.email}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loyalty Program */}
            <div className="bg-accent border-4 border-border shadow-retro hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all p-8 relative overflow-hidden">
              {/* Retro Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }} />
              </div>
              
              <div className="relative">
                <h2 className="text-2xl font-bold text-accent-foreground mb-6 flex items-center font-syne uppercase border-b-4 border-border pb-4">
                  <div className="w-10 h-10 border-4 border-border bg-primary flex items-center justify-center mr-3 shadow-retro">
                    <Award className="w-6 h-6 text-primary-foreground" />
                  </div>
                  Loyalty Rewards
                </h2>
                
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-accent-foreground font-bold uppercase text-sm font-mono">Current Points</span>
                    <span className="text-6xl font-bold text-accent-foreground font-mono">
                      {loading ? '...' : Math.floor(totalSpent / 100 * 10)}
                    </span>
                  </div>
                  <div className="h-6 bg-white border-4 border-border overflow-hidden">
                    <div 
                      className="h-full bg-primary border-r-4 border-border transition-all duration-500"
                      style={{ width: `${Math.min((Math.floor(totalSpent / 100 * 10)) / 1000 * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-sm text-accent-foreground font-bold mt-2 font-mono">
                    {Math.max(0, 1000 - Math.floor(totalSpent / 100 * 10))} POINTS TO NEXT REWARD
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center p-4 bg-white border-4 border-border shadow-retro">
                    <Star className="w-5 h-5 mr-3 text-primary fill-primary flex-shrink-0" />
                    <span className="font-bold font-mono text-sm uppercase">Earn 10 pts per ₹100</span>
                  </div>
                  <div className="flex items-center p-4 bg-white border-4 border-border shadow-retro">
                    <Star className="w-5 h-5 mr-3 text-primary fill-primary flex-shrink-0" />
                    <span className="font-bold font-mono text-sm uppercase">Redeem for discounts</span>
                  </div>
                  <div className="flex items-center p-4 bg-white border-4 border-border shadow-retro">
                    <Star className="w-5 h-5 mr-3 text-primary fill-primary flex-shrink-0" />
                    <span className="font-bold font-mono text-sm uppercase">Exclusive benefits</span>
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