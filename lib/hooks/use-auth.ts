import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService, LoginCredentials, RegisterData } from '@/lib/api/auth.service'
import { useAuthStore } from '@/lib/store/auth-store'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

export function useAuth() {
  const router = useRouter()
  const { setUser, logout: logoutStore, user } = useAuthStore()
  const [hasToken, setHasToken] = useState(false)

  // Vérifier le token côté client uniquement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasToken(!!localStorage.getItem('access_token'))
    }
  }, [])

  // Récupérer le profil utilisateur au chargement si token existe
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser(),
    enabled: hasToken && !user,
    retry: false,
  })

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    }
  }, [currentUser, setUser])

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: async (data) => {
      console.log('📦 Données reçues:', data)
      
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      
      // Si pas de user dans la réponse, le récupérer
      if (!data.user) {
        console.log('⚠️ User non présent, récupération...')
        try {
          const user = await authService.getCurrentUser()
          console.log('✅ User récupéré:', user)
          setUser(user)
        } catch (error) {
          console.error('❌ Erreur récupération user:', error)
          toast.error('Erreur lors de la récupération du profil')
          return
        }
      } else {
        console.log('✅ User présent dans la réponse')
        setUser(data.user)
      }
      
      toast.success('Connexion réussie !')
      
      setTimeout(() => {
        console.log('🔄 Redirection vers /dashboard')
        router.push('/dashboard')
      }, 100)
    },
    onError: (error: any) => {
      console.error('❌ Erreur login:', error)
      const message = error.response?.data?.detail || 
                     error.response?.data?.message ||
                     'Erreur de connexion'
      toast.error(message)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: () => {
      toast.success('Inscription réussie ! Vérifiez vos emails.')
      router.push('/login')
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 
                     error.response?.data?.message ||
                     'Erreur lors de l\'inscription'
      toast.error(message)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logoutStore()
      router.push('/login')
      toast.success('Déconnexion réussie')
    },
  })

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  }
}