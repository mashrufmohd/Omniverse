'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { authService } from '@/services/auth.service'
import { db } from '@/lib/firebase'

interface User {
  uid: string
  name: string | null
  email: string | null
  loyaltyPoints: number
  role?: 'user' | 'admin' | 'shopkeeper'
}

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, displayName: string, role?: 'user' | 'shopkeeper') => Promise<void>
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
      console.log('🔄 Auth state changed:', fbUser?.email || 'logged out')
      
      if (fbUser) {
        setFirebaseUser(fbUser)
        
        // Try to get role from localStorage first (faster and no permission issues)
        let userRole: 'user' | 'shopkeeper' = 'user'
        const storedRole = localStorage.getItem(`user_role_${fbUser.uid}`)
        console.log('📦 localStorage role for', fbUser.uid, ':', storedRole)
        
        if (storedRole === 'shopkeeper' || storedRole === 'user') {
          userRole = storedRole
          console.log('✓ User role from localStorage:', userRole)
        } else {
          // Fallback: try Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              userRole = userData.role || 'user'
              // Save to localStorage for next time
              localStorage.setItem(`user_role_${fbUser.uid}`, userRole)
              console.log('✓ User role from Firestore:', userRole)
            }
          } catch (error) {
            console.warn('Could not fetch user role from Firestore:', error)
          }
        }
        
        const newUser = {
          uid: fbUser.uid,
          name: fbUser.displayName,
          email: fbUser.email,
          loyaltyPoints: 0,
          role: userRole,
        }
        console.log('👤 Setting user:', newUser)
        setUser(newUser)
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

  const signup = async (email: string, password: string, displayName: string, role: 'user' | 'shopkeeper' = 'user') => {
    const userCredential = await authService.signUp(email, password, displayName, role)
    // Save role to localStorage immediately
    if (userCredential.user) {
      localStorage.setItem(`user_role_${userCredential.user.uid}`, role)
      console.log('✓ Role saved to localStorage:', role)
    }
  }

  const logout = async () => {
    // DON'T clear role from localStorage - it should persist
    // This allows users to login again without re-fetching from Firestore
    await authService.signOut()
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, isAdmin, login, signup, logout }}>
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