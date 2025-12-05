'use client'

import { Spinner } from '@/components/ui/spinner'

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2">
        <Spinner />
        <span>AI is typing...</span>
      </div>
    </div>
  )
}