'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { Loader2 } from 'lucide-react'

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password']

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuthStore()
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('access_token')

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    
    // Si page protégée et pas de token, rediriger vers login
    if (!isPublicRoute && !hasToken) {
      router.push('/login')
    }
    
    // Si page auth et déjà connecté, rediriger vers dashboard
    if ((pathname === '/login' || pathname === '/register') && hasToken && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [pathname, hasToken, isAuthenticated, router])

  // Afficher un loader pendant la vérification
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  if (!isPublicRoute && !hasToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}