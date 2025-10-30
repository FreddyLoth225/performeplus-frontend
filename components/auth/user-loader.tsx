'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authService } from '@/lib/api/auth.service'
import { useAuthStore } from '@/lib/store/auth-store'

export function UserLoader() {
  const { user, setUser } = useAuthStore()
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token')

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser(),
    enabled: hasToken && !user,
    retry: false,
    staleTime: Infinity, // Ne pas refetch automatiquement
  })

  useEffect(() => {
    if (currentUser && !user) {
      setUser(currentUser)
    }
  }, [currentUser, user, setUser])

  return null // Composant invisible
}