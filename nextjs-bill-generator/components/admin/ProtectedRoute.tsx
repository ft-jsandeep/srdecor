'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication (in a real app, this would check with your auth system)
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="text-light-textMuted dark:text-dark-textMuted">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}











