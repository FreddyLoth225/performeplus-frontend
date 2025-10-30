'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { Loader2 } from 'lucide-react'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      setHasToken(!!token)
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    if (isChecking) return

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    
    // Si page protégée et pas de token, rediriger vers login
    if (!isPublicRoute && !hasToken) {
      router.push('/login')
    }
    
    // Si page auth et déjà connecté, rediriger vers dashboard
    if ((pathname === '/login' || pathname === '/register') && hasToken && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [pathname, hasToken, isAuthenticated, router, isChecking])

  // Afficher un loader pendant la vérification initiale
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Afficher un loader si on redirige
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  if (!isPublicRoute && !hasToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}