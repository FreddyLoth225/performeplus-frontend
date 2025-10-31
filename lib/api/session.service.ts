import { apiClient } from './client'
import { Seance } from '@/lib/types'

// Types pour les nouvelles fonctionnalités
export interface CreateSeanceData {
  equipe_id: string
  type: 'ENTRAINEMENT' | 'MATCH' | 'RECUPERATION' | 'AUTRE'
  dateDebut: string // ISO format
  dateFin?: string
  lieu?: string
  description?: string
  parametres?: Record<string, any>
}

export interface UpdateSeanceData extends Partial<CreateSeanceData> {
  statut?: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
}

export const sessionService = {
  // ✅ TES MÉTHODES EXISTANTES (INCHANGÉES)
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
    // Le backend retourne { seances: [...], periode: {...} }
    return response.data.seances || []
  },

  // 🆕 NOUVELLES MÉTHODES (POUR STAFF/OWNER)
  async createSession(data: CreateSeanceData): Promise<Seance> {
    const response = await apiClient.post('/seances/create/', data)
    return response.data
  },

  async updateSession(seanceId: string, data: UpdateSeanceData): Promise<Seance> {
    const response = await apiClient.patch(`/seances/${seanceId}/`, data)
    return response.data
  },

  async deleteSession(seanceId: string): Promise<void> {
    await apiClient.delete(`/seances/${seanceId}/`)
  },

  // Dupliquer une séance (utile pour séances récurrentes)
  async duplicateSession(seanceId: string, newDateDebut: string): Promise<Seance> {
    const original = await this.getSessionDetails(seanceId)
    
    const duplicatedData: CreateSeanceData = {
      equipe_id: original.equipe_id,
      type: original.type,
      dateDebut: newDateDebut,
      dateFin: original.dateFin 
        ? new Date(new Date(original.dateFin).getTime() + 
            (new Date(newDateDebut).getTime() - new Date(original.dateDebut).getTime())).toISOString()
        : undefined,
      lieu: original.lieu,
      description: original.description,
      parametres: original.parametres,
    }

    return this.createSession(duplicatedData)
  },
}