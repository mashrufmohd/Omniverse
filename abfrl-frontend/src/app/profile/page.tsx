'use client'

import { useAuth } from '@/hooks/use-auth'

export default function Profile() {
  const { user } = useAuth()

  if (!user) {
    return <div>Please log in</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Loyalty Points: {user.loyaltyPoints}</p>
      </div>
    </div>
  )
}