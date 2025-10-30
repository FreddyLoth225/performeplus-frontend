import { apiClient } from './client'
import { Seance } from '@/lib/types'

export const sessionService = {
  async getSessions(equipeId: string, params?: {
    date_debut?: string
    date_fin?: string
    statut?: string
  }): Promise<Seance[]> {
    const response = await apiClient.get('/seances/', {
      params: { equipe_id: equipeId, ...params }
    })
    return response.data
  },

  async getSessionDetails(seanceId: string): Promise<Seance> {
    const response = await apiClient.get(`/seances/${seanceId}/`)
    return response.data
  },

  async getCalendar(equipeId: string, dateDebut: string, dateFin: string): Promise<Seance[]> {
    const response = await apiClient.get('/calendrier/', {
      params: {
        equipe_id: equipeId,
        date_debut: dateDebut,
        date_fin: dateFin,
      }
    })
    return response.data
  },
}