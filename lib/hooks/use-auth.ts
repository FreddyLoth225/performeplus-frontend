import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { authService, LoginCredentials, RegisterData } from '@/lib/api/auth.service'
import { useAuthStore } from '@/lib/store/auth-store'
import { toast } from 'sonner'
import { useEffect } from 'react'

export function useAuth() {
  const router = useRouter()
  const { setUser, logout: logoutStore, user } = useAuthStore()

  // Récupérer le profil utilisateur au chargement si token existe
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => authService.getCurrentUser(),
    enabled: !!localStorage.getItem('access_token') && !user,
    retry: false,
  })

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    }
  }, [currentUser, setUser])

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      setUser(data.user)
      toast.success('Connexion réussie !')
      
      // Petit délai pour s'assurer que le store est mis à jour
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh() // Force le rechargement du middleware
      }, 100)
    },
    onError: (error: any) => {
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