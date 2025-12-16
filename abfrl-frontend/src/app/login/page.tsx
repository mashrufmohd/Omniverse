'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
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
      router.push('/chat')
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
            <div className="relative h-16 w-16 overflow-hidden border-2 border-black shadow-retro">
              <Image 
                src="/images/logo.jpg" 
                alt="ABFRL Logo" 
                fill
                className="object-cover"
              />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold tracking-tight font-mono uppercase">ABFRL</h1>
              <p className="text-sm text-muted-foreground font-medium">Master Sales Agent</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
          <p className="text-sm text-muted-foreground">Login to continue shopping</p>
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
              className="w-full px-4 py-3 border-2 border-black focus:border-[#FF5E5B] focus:outline-none shadow-retro transition-all"
              placeholder="your@email.com"
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
              className="w-full px-4 py-3 border-2 border-black focus:border-[#FF5E5B] focus:outline-none shadow-retro transition-all"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF5E5B] hover:bg-[#00CCBF] text-white border-2 border-black shadow-retro hover:shadow-retro-hover transition-all py-6 font-bold uppercase tracking-wide"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#FF5E5B] hover:text-[#00CCBF] font-bold transition-colors">
            Sign up →
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
