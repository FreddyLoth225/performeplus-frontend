import { apiClient } from './client'
import { Seance, SeanceActivite } from '@/lib/types'

export interface SeanceListResponse {
  seances: Seance[]
  filters?: Record<string, unknown>
}

export interface SeanceMutationResponse {
  message: string
  seance: Seance
  warnings?: string[]
}

export interface ActivitePayload extends Partial<Omit<SeanceActivite, 'id'>> {
  type: string
}

export interface CreateSeanceData {
  equipe_id: string
  type: 'ENTRAINEMENT' | 'MATCH' | 'RECUPERATION' | 'AUTRE'
  dateDebut: string
  dateFin?: string | null
  dureePrevue?: number | null
  intensitePrevue?: number | null
  lieu?: string | null
  description?: string | null
  statut?: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
  parametres?: Record<string, any>
  template_id?: string | null
  participants_ids: string[]
  activites?: ActivitePayload[]
}

export interface UpdateSeanceData extends Partial<CreateSeanceData> {
  motifAnnulation?: string
}

export interface DuplicateSeancePayload extends Partial<Omit<CreateSeanceData, 'equipe_id'>> {}

export class ForceUpdateError extends Error {
  constructor(
    message: string,
    public readonly seanceId: string,
    public readonly data: UpdateSeanceData
  ) {
    super(message)
    this.name = 'ForceUpdateError'
  }
}

export const sessionService = {
  async getSessions(
    equipeId: string,
    params?: { date_debut?: string; date_fin?: string; statut?: string; type?: string; joueur_id?: string }
  ): Promise<SeanceListResponse> {
    const response = await apiClient.get('/seances/', {
      params: { equipe_id: equipeId, ...params },
    })
    return {
      seances: response.data?.seances ?? [],
      filters: response.data?.filters ?? {},
    }
  },

  async getSessionDetails(seanceId: string): Promise<Seance> {
    const response = await apiClient.get(`/seances/${seanceId}/`)
    return response.data?.seance ?? response.data
  },

  async getCalendar(equipeId: string, dateDebut: string, dateFin: string): Promise<Seance[]> {
    const response = await apiClient.get('/calendrier/', {
      params: {
        equipe_id: equipeId,
        date_debut: dateDebut,
        date_fin: dateFin,
      },
    })
    return response.data?.seances ?? []
  },

  async createSession(data: CreateSeanceData): Promise<SeanceMutationResponse> {
    const response = await apiClient.post('/seances/create/', data)
    return response.data
  },

  async updateSession(
    seanceId: string,
    data: UpdateSeanceData,
    options?: { forceUpdate?: boolean }
  ): Promise<SeanceMutationResponse> {
    const payload: Record<string, any> = { ...data }
    if (options?.forceUpdate) {
      payload.force_update = true
    }

    try {
      const response = await apiClient.patch(`/seances/${seanceId}/`, payload)
      return response.data
    } catch (error: any) {
      if (error?.response?.status === 409 && error.response.data?.requiresConfirmation) {
        const message: string = error.response.data?.message ??
          'Des RPE ont été saisis pour cette séance. Confirmez la modification pour continuer.'
        throw new ForceUpdateError(message, seanceId, data)
      }
      throw error
    }
  },

  async deleteSession(seanceId: string): Promise<void> {
    await apiClient.delete(`/seances/${seanceId}/`)
  },

  async duplicateSession(
    seanceId: string,
    payload: DuplicateSeancePayload = {}
  ): Promise<SeanceMutationResponse> {
    const response = await apiClient.post(`/seances/${seanceId}/duplicate/`, payload)
    return response.data
  },

  async convertSessionToTemplate(
    seanceId: string,
    payload: { nom?: string; description?: string; categorie?: string; public?: boolean }
  ): Promise<any> {
    const response = await apiClient.post(`/seances/${seanceId}/convert-to-template/`, payload)
    return response.data
  },

  async changeSessionStatus(
    seanceId: string,
    statut: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
  ): Promise<{ message: string; ancien_statut: string; nouveau_statut: string; seance: Seance }> {
    const response = await apiClient.patch(`/seances/${seanceId}/statut/`, { statut })
    return response.data
  },
}