import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Utilisateur } from '@/lib/types'

interface AuthState {
  user: Utilisateur | null
  isAuthenticated: boolean
  setUser: (user: Utilisateur | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)