import { apiClient } from './client'
import { Equipe, MembreEquipe } from '@/lib/types'

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