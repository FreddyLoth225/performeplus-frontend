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

export interface SeuilPersonnalise {
  id?: string
  equipe: string
  type: 'RCA_SURCHARGE' | 'RCA_SOUS_CHARGE' | 'MONOTONIE_IM' | 'INDICE_CONTRAINTE_IC' | 'INDICE_FORME_BAS' | 'INDICE_FORME_ELEVE'
  valeur_min?: number | null
  valeur_max?: number | null
  valeur_critique?: number | null
  actif: boolean
  commentaire?: string
  date_creation?: string
  date_modification?: string
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

  async getThresholds(equipeId: string): Promise<SeuilPersonnalise[]> {
    const response = await apiClient.get(`/seuils/`, {
      params: { equipe: equipeId }
    })
    // DRF peut retourner un objet paginé ou directement un tableau
    const data = response.data
    console.log('Thresholds response:', data)
    
    // Si c'est un objet paginé (avec results, count, etc.)
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results
    }
    
    // Si c'est directement un tableau
    if (Array.isArray(data)) {
      return data
    }
    
    // Sinon retourner un tableau vide
    return []
  },

  async createThreshold(data: Omit<SeuilPersonnalise, 'id' | 'date_creation' | 'date_modification'>): Promise<SeuilPersonnalise> {
    const response = await apiClient.post('/seuils/', data)
    return response.data
  },

  async updateThreshold(seuilId: string, data: Partial<SeuilPersonnalise>): Promise<SeuilPersonnalise> {
    const response = await apiClient.patch(`/seuils/${seuilId}/`, data)
    return response.data
  },

  async deleteThreshold(seuilId: string): Promise<void> {
    await apiClient.delete(`/seuils/${seuilId}/`)
  },
}