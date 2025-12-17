'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/admin/table'
import { Modal } from '@/components/admin/modal'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/admin/stat-card'
import { Search, Users as UsersIcon, Eye, Shield, User } from 'lucide-react'
import { getAllUsers, getUserOrders, updateUserRole } from '@/lib/api/admin'
import { AdminUser, AdminOrder } from '@/types/admin'

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [userOrders, setUserOrders] = useState<AdminOrder[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrders = async (user: AdminUser) => {
    setSelectedUser(user)
    setIsOrdersModalOpen(true)
    setLoadingOrders(true)
    
    try {
      const orders = await getUserOrders(user.id)
      setUserOrders(orders)
    } catch (error) {
      console.error('Error loading user orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleToggleRole = async (userId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    const confirmMessage = currentRole === 'admin' 
      ? 'Are you sure you want to remove admin privileges from this user?' 
      : 'Are you sure you want to grant admin privileges to this user?'
    
    if (!confirm(confirmMessage)) return

    try {
      const updated = await updateUserRole(userId, newRole)
      setUsers(users.map(user => user.id === userId ? updated : user))
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Failed to update user role')
    }
  }

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

  const totalUsers = users.length
  const totalAdmins = users.filter(u => u.role === 'admin').length
  const totalRevenue = users.reduce((sum, user) => sum + user.totalSpent, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-primary border-r-transparent rounded-full" />
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Loading Users...
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
          Users
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage registered users and admins
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={UsersIcon}
          description="Registered accounts"
        />
        <StatCard
          title="Admins"
          value={totalAdmins}
          icon={Shield}
          description="Admin accounts"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={UsersIcon}
          description="From all users"
        />
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-border focus-visible:ring-primary"
            />
          </div>
          <div className="text-sm font-bold text-muted-foreground whitespace-nowrap">
            {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="p-6">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-bold">No users found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'No registered users'}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 border-2 border-border bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">{user.name || 'N/A'}</p>
                        <p className="text-xs font-mono text-muted-foreground">
                          {user.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold uppercase border-2 border-border ${
                      user.role === 'admin' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.role === 'admin' && <Shield className="h-3 w-3" />}
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold">
                    {user.totalOrders}
                  </TableCell>
                  <TableCell className="font-bold font-mono">
                    {formatCurrency(user.totalSpent)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrders(user)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Orders
                      </Button>
                      <Button
                        variant={user.role === 'admin' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className="gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        {user.role === 'admin' ? 'Demote' : 'Promote'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* User Orders Modal */}
      <Modal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        title={`Orders for ${selectedUser?.name || selectedUser?.email}`}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border-2 border-border bg-muted/20">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                  Total Orders
                </p>
                <p className="text-2xl font-bold">{selectedUser.totalOrders}</p>
              </div>
              <div className="p-4 border-2 border-border bg-muted/20">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                  Total Spent
                </p>
                <p className="text-2xl font-bold font-mono">
                  {formatCurrency(selectedUser.totalSpent)}
                </p>
              </div>
              <div className="p-4 border-2 border-border bg-muted/20">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">
                  Avg Order Value
                </p>
                <p className="text-2xl font-bold font-mono">
                  {selectedUser.totalOrders > 0 
                    ? formatCurrency(selectedUser.totalSpent / selectedUser.totalOrders)
                    : '₹0'
                  }
                </p>
              </div>
            </div>

            {/* Orders List */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide mb-4">
                Order History
              </h3>
              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="inline-block h-6 w-6 animate-spin border-4 border-solid border-primary border-r-transparent rounded-full" />
                </div>
              ) : userOrders.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No orders found
                </p>
              ) : (
                <div className="space-y-3">
                  {userOrders.map((order) => (
                    <div 
                      key={order.id}
                      className="p-4 border-2 border-border hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-xs font-bold text-muted-foreground">
                            #{order.id.slice(0, 8)}
                          </p>
                          <p className="mt-1 text-sm">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold font-mono">
                            {formatCurrency(order.total)}
                          </p>
                          <span className={`inline-flex mt-2 px-2 py-1 text-xs font-bold uppercase border-2 border-border ${
                            order.status === 'delivered' 
                              ? 'bg-secondary/20 text-secondary' 
                              : order.status === 'shipped'
                              ? 'bg-accent/20 text-accent-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
