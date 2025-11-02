import { apiClient } from './client'
import { Equipe, MembreEquipe } from '@/lib/types'

export interface TeamMembersResponse {
  membres: Array<{
    id: string
    utilisateur_id: string
    nom: string
    email: string
    role: string
    dateAdhesion: string
    profil_joueur?: {
      dossard?: number
      poste?: string
      statut?: string
    } | null
  }>
}

export interface EquipeWithRole {
  equipe: Equipe
  membership: MembreEquipe
}

export const teamService = {
  async getMyTeams(): Promise<EquipeWithRole[]> {
    const response = await apiClient.get('/equipes/')
    return response.data
  },

  async getTeamDetails(equipeId: string): Promise<Equipe> {
    const response = await apiClient.get(`/equipes/${equipeId}/details/`)
    return response.data
  },

  async getTeamMembers(equipeId: string): Promise<TeamMembersResponse> {
    const response = await apiClient.get(`/equipes/${equipeId}/membres/`)
    return response.data
  },

  async createTeam(data: {
    nom: string
    pays: string
    sport: string
    logo?: string
  }): Promise<Equipe> {
    const response = await apiClient.post('/equipes/create/', data)
    return response.data
  },
}