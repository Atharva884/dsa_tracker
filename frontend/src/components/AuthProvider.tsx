'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, isHydrated, setHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Set hydrated and check auth state on mount
    const handleHydration = () => {
      if (!isHydrated) {
        setHydrated()
      }
      checkAuth()
    }

    // Run immediately
    handleHydration()

    // Also run on next tick to ensure store is fully initialized
    const timer = setTimeout(handleHydration, 0)

    return () => clearTimeout(timer)
  }, [checkAuth, isHydrated, setHydrated])

  useEffect(() => {
    // Listen for unauthorized events from API interceptor
    const handleUnauthorized = () => {
      router.push('/signin')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [router])

  return <>{children}</>
}