'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Store } from 'lucide-react'

export default function ShopkeeperLoginPage() {
  const router = useRouter()
  const { login } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/shopkeeper/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative h-16 w-16 overflow-hidden border-2 border-black shadow-retro bg-[#FFD166] flex items-center justify-center">
              <Store className="h-8 w-8 text-black" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold tracking-tight font-mono uppercase">Shopkeeper</h1>
              <p className="text-sm text-muted-foreground font-medium">Portal Login</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-sm text-muted-foreground">Login to manage your products</p>
        </div>

        <div className="bg-white p-8 border-2 border-black shadow-retro">
          {error && (
            <div className="mb-4 p-3 bg-[#FF5E5B] border-2 border-black text-white">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-black focus:border-[#FFD166] focus:outline-none shadow-retro transition-all"
                placeholder="shop@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-black focus:border-[#FFD166] focus:outline-none shadow-retro transition-all"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FFD166] hover:bg-[#00CCBF] text-black border-2 border-black shadow-retro hover:shadow-retro-hover transition-all py-6 font-bold uppercase tracking-wide"
            >
              {loading ? 'Logging in...' : 'Login as Shopkeeper'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Don&apos;t have a shopkeeper account?{' '}
            <Link href="/shopkeeper/signup" className="text-[#FFD166] hover:text-[#00CCBF] font-bold transition-colors">
              Sign up →
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-black">
            <div className="text-center text-xs text-muted-foreground mb-2">
              Looking for customer login?
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full border-2 border-black">
                Customer Login
              </Button>
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t-2 border-black text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-black transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
