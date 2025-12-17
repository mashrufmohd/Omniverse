'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/auth-context'

export function useAdminGuard() {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const isShopkeeper = user?.role === 'shopkeeper'

  useEffect(() => {
    console.log('🔒 Admin Guard Check:', { loading, user: user?.email, role: user?.role })
    
    if (!loading && (!user || user.role !== 'shopkeeper')) {
      console.log('❌ Not authorized, redirecting to login')
      // Redirect non-shopkeepers to shopkeeper login
      router.push('/shopkeeper/login')
    } else if (!loading && user?.role === 'shopkeeper') {
      console.log('✓ Authorized as shopkeeper')
    }
  }, [user, loading, router])

  return { isAdmin: isShopkeeper, loading }
}
