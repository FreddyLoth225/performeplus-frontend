import { apiClient } from './client'
import { Utilisateur } from '@/lib/types'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  nom: string
  prenoms: string
  telephone?: string
  langue?: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: Utilisateur
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔐 Tentative de connexion...', credentials.email)
    const response = await apiClient.post('/token/', credentials)
    console.log('✅ Réponse serveur:', response.data)
    return response.data
  },

  async register(data: RegisterData): Promise<{ message: string; user: Utilisateur }> {
    const response = await apiClient.post('/register/', data)
    return response.data
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.get(`/verify-email/${token}/`)
    return response.data
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/password-reset/request/', { email })
    return response.data
  },

  async confirmPasswordReset(token: string, password: string): Promise<{ message: string }> {
    const response = await apiClient.post('/password-reset/confirm/', { token, password })
    return response.data
  },

  async getCurrentUser(): Promise<Utilisateur> {
    const response = await apiClient.get('/profil/')
    return response.data
  },

  async logout(): Promise<void> {
    // Côté client, on supprime juste les tokens
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}