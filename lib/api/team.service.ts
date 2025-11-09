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

export interface TeamSettings {
  nom: string
  sport: string
  pays: string
  logo?: string
  parametres?: Record<string, any>
}

export interface ThresholdSettings {
  rpe_critique?: number
  rpe_warning?: number
  charge_critique?: number
  charge_warning?: number
  acwr_critique?: number
  acwr_warning?: number
  monotonie_critique?: number
  monotonie_warning?: number
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

  async updateTeam(equipeId: string, data: Partial<TeamSettings>): Promise<Equipe> {
    const response = await apiClient.patch(`/equipes/${equipeId}/`, data)
    return response.data
  },

  async getThresholds(equipeId: string): Promise<ThresholdSettings> {
    const response = await apiClient.get(`/seuils-personnalises/?equipe_id=${equipeId}`)
    return response.data
  },

  async updateThresholds(equipeId: string, data: ThresholdSettings): Promise<ThresholdSettings> {
    const response = await apiClient.post('/seuils-personnalises/', {
      equipe_id: equipeId,
      ...data,
    })
    return response.data
  },
}