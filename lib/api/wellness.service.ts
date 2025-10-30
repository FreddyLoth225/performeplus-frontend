import { apiClient } from './client'
import { IndiceForme, SaisieRPE } from '@/lib/types'

export interface CreateIndiceFormeData {
  membre_id: string
  date?: string // Optionnel, par défaut aujourd'hui
  sommeil: number
  fatigue: number
  courbatures: number
  stress: number
}

export interface CreateRPEData {
  participation_id?: string
  seance_id: string
  valeurRPE: number
  dureeReelle: number
  commentaire?: string
}

export const wellnessService = {
  // Indice de forme
  async createIndiceForme(data: CreateIndiceFormeData): Promise<IndiceForme> {
    const response = await apiClient.post('/indice-forme/', data)
    return response.data
  },

  async getIndiceFormeToday(equipeId: string): Promise<IndiceForme | null> {
    try {
      const response = await apiClient.get('/indice-forme/', {
        params: { equipe_id: equipeId }
      })
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  async getIndiceFormeHistory(
    equipeId: string,
    historique: number = 7
  ): Promise<IndiceForme[]> {
    const response = await apiClient.get('/indice-forme/', {
      params: { equipe_id: equipeId, historique }
    })
    return response.data
  },

  async updateIndiceForme(
    indiceId: string,
    data: Partial<CreateIndiceFormeData>
  ): Promise<IndiceForme> {
    const response = await apiClient.patch(`/indice-forme/${indiceId}/`, data)
    return response.data
  },

  // RPE
  async getRPEPending(equipeId: string): Promise<any[]> {
    const response = await apiClient.get('/rpe/', {
      params: { equipe_id: equipeId }
    })
    return response.data
  },

  async createRPE(data: CreateRPEData): Promise<SaisieRPE> {
    const response = await apiClient.post('/rpe/', data)
    return response.data
  },

  async updateRPE(
    rpeId: string,
    data: Partial<CreateRPEData>
  ): Promise<SaisieRPE> {
    const response = await apiClient.patch(`/rpe/${rpeId}/`, data)
    return response.data
  },

  async getRPEHistory(equipeId: string): Promise<SaisieRPE[]> {
    const response = await apiClient.get('/rpe/', {
      params: { equipe_id: equipeId, historique: true }
    })
    return response.data
  },
}