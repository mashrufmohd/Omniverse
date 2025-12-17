'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Store } from 'lucide-react'

export default function ShopkeeperSignupPage() {
  const router = useRouter()
  const { signup, logout } = useAuthContext()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await signup(email, password, name, 'shopkeeper')
      // Logout after signup (role is still in localStorage)
      // This forces user to login again with their credentials
      await logout()
      // Small delay to ensure logout completes
      await new Promise(resolve => setTimeout(resolve, 300))
      // Redirect to login page
      router.push('/shopkeeper/login')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
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
              <p className="text-sm text-muted-foreground font-medium">Create Account</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Join as Shopkeeper</h2>
          <p className="text-sm text-muted-foreground">Start managing your products today</p>
        </div>

        {/* Form Card */}
        <div className="bg-background border-2 border-border shadow-retro p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 border-2 border-destructive text-destructive p-4 text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors font-medium"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors font-medium"
                placeholder="shopkeeper@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors font-medium"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wide mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border bg-background focus:outline-none focus:border-primary transition-colors font-medium"
                placeholder="Re-enter your password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-4 border-2 border-border shadow-retro hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-wide text-sm"
            >
              {loading ? 'Creating Account...' : 'Create Shopkeeper Account'}
            </Button>

            <div className="border-t-2 border-border pt-4">
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link 
                  href="/shopkeeper/login" 
                  className="text-primary font-bold hover:underline"
                >
                  Login here
                </Link>
              </p>
            </div>

            <div className="border-t-2 border-border pt-4">
              <p className="text-center text-sm text-muted-foreground mb-3">
                Looking for customer login?
              </p>
              <Link
                href="/login"
                className="block w-full text-center py-3 px-4 border-2 border-border bg-background hover:bg-muted transition-colors font-bold uppercase tracking-wide text-sm"
              >
                Customer Login
              </Link>
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-foreground font-medium inline-flex items-center gap-1"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
