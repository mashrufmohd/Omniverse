'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button variant="ghost" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </Button>
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg p-4">
          <nav className="space-y-2">
            <Link href="/profile" className="block text-gray-600 hover:text-gray-900">
              Profile
            </Link>
            <Link href="/checkout" className="block text-gray-600 hover:text-gray-900">
              Checkout
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}