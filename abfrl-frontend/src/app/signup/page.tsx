'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  const router = useRouter()
  const { signup } = useAuthContext()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupComplete, setSignupComplete] = useState(false)

  // Redirect to login after successful signup
  useEffect(() => {
    if (signupComplete) {
      console.log('Signup complete, redirecting to login...')
      // Show success message and redirect to login
      setTimeout(() => {
        router.push('/login')
      }, 1000)
    }
  }, [signupComplete, router])

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
    console.log('Starting signup process...')

    try {
      console.log('Calling signup function...')
      await signup(email, password, name)
      console.log('Signup completed successfully')
      setSignupComplete(true)
      // Will redirect to login via useEffect
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account')
      setLoading(false)
      setSignupComplete(false)
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
          <h2 className="text-2xl font-bold mb-2">Create Account</h2>
          <p className="text-sm text-muted-foreground">Join us for a premium shopping experience</p>
        </div>

        <div className="bg-white p-8 border-2 border-black shadow-retro">
          {error && (
            <div className="mb-4 p-3 bg-[#FF5E5B] border-2 border-black text-white">
              {error}
            </div>
          )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-black focus:border-[#FF5E5B] focus:outline-none shadow-retro transition-all"
              placeholder="John Doe"
            />
          </div>

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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-black focus:border-[#FF5E5B] focus:outline-none shadow-retro transition-all"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || signupComplete}
            className="w-full bg-[#FF5E5B] hover:bg-[#00CCBF] text-white border-2 border-black shadow-retro hover:shadow-retro-hover transition-all py-6 font-bold uppercase tracking-wide"
          >
            {signupComplete ? 'Success! Redirecting...' : loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[#FF5E5B] hover:text-[#00CCBF] font-bold transition-colors">
            Login →
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
