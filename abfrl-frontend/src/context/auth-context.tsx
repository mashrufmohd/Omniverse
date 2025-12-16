'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { authService } from '@/services/auth.service'

interface User {
  uid: string
  name: string | null
  email: string | null
  loyaltyPoints: number
}

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChange(async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser)
        setUser({
          uid: fbUser.uid,
          name: fbUser.displayName,
          email: fbUser.email,
          loyaltyPoints: 0, // You can fetch this from Firestore
        })
      } else {
        setFirebaseUser(null)
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    await authService.signIn(email, password)
  }

  const signup = async (email: string, password: string, displayName: string) => {
    await authService.signUp(email, password, displayName)
  }

  const logout = async () => {
    await authService.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}