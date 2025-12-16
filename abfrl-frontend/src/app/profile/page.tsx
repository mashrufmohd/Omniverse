'use client'

import { useAuthContext } from '@/context/auth-context'
import { ProtectedRoute } from '@/components/auth/protected-route'

export default function Profile() {
  const { user } = useAuthContext()

  return (
    <ProtectedRoute>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Loyalty Points: {user.loyaltyPoints}</p>
      </div>
    </div>
    </ProtectedRoute>
  )
}