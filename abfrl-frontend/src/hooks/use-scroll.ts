'use client'

import { useEffect, useRef } from 'react'

export function useScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  })

  return { scrollRef, scrollToBottom }
}