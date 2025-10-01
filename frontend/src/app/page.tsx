'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function Home() {
  const { isAuthenticated, isHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Wait for hydration before redirecting
    if (!isHydrated) {
      return
    }

    if (isAuthenticated) {
      router.push('/dashboard')
    } else {
      router.push('/signin')
    }
  }, [isAuthenticated, router, isHydrated])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>
  )
}