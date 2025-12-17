'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthContext } from '@/context/auth-context'
import { useAdminGuard } from '@/hooks/use-admin-guard'
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ShoppingCart, 
  Users, 
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/shopkeeper/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/shopkeeper/dashboard/products', icon: Package },
  { name: 'Inventory', href: '/shopkeeper/dashboard/inventory', icon: Warehouse },
  { name: 'Orders', href: '/shopkeeper/dashboard/orders', icon: ShoppingCart },
  { name: 'Users', href: '/shopkeeper/dashboard/users', icon: Users },
  { name: 'Analytics', href: '/shopkeeper/dashboard/analytics', icon: BarChart3 },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAdminGuard()
  const { user, logout } = useAuthContext()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/shopkeeper/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-primary border-r-transparent rounded-full" />
          <p className="mt-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 flex h-16 items-center gap-4 border-b-2 border-border bg-background px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="border-2 border-border"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden border-2 border-border">
            <Image 
              src="/images/logo.jpg" 
              alt="ABFRL Logo" 
              fill
              className="object-cover"
            />
          </div>
          <span className="font-bold font-mono uppercase text-sm">Shopkeeper Panel</span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 transform border-r-2 border-border bg-background transition-transform lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b-2 border-border px-6 bg-muted/20">
              <div className="relative h-10 w-10 overflow-hidden border-2 border-border shadow-retro">
                <Image 
                  src="/images/logo.jpg" 
                  alt="ABFRL Logo" 
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-sm font-bold font-mono uppercase tracking-wide">
                  Shopkeeper Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Manage Your Store
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/shopkeeper/dashboard' && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all border-2",
                      isActive
                        ? "bg-primary text-primary-foreground border-border shadow-retro"
                        : "bg-background text-foreground border-transparent hover:border-border hover:bg-accent hover:shadow-retro hover:translate-x-[2px] hover:translate-y-[2px]"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User Info & Logout */}
            <div className="border-t-2 border-border p-4 space-y-3 bg-muted/20">
              <div className="px-4 py-2 bg-background border-2 border-border">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Logged in as
                </p>
                <p className="text-sm font-bold truncate">
                  {user?.name || user?.email}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start gap-3"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
