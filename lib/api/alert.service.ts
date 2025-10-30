import { apiClient } from './client'

export interface Alerte {
  id: string
  equipe: string
  membre: string | null
  joueur_nom: string
  type: 'SURCHARGE' | 'SOUS_CHARGE' | 'MONOTONIE' | 'INDICE_FORME_BAS' | 'INDICE_FORME_TRES_BAS' | 'SAISIE_MANQUANTE_RPE' | 'SAISIE_MANQUANTE_FORME'
  niveau: 'INFO' | 'ATTENTION' | 'CRITIQUE'
  message: string
  priorite: number
  dateCreation: string
  lue: boolean
  traitee: boolean
  dateTraitement: string | null
  actionCorrective?: string
  commentaireTraitement?: string
  metadata: Record<string, any>
  interpretation_type: any
}

export interface AlertFilters {
  equipe_id: string
  non_lues?: boolean
  non_traitees?: boolean
  type?: string
  niveau?: string
  joueur_id?: string
}

export const alertService = {
  // Récupérer les alertes
  async getAlerts(filters: AlertFilters): Promise<Alerte[]> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString())
    })

    const response = await apiClient.get(`/alertes/?${params.toString()}`)
    return response.data
  },

  // Récupérer une alerte spécifique
  async getAlert(alerteId: string): Promise<Alerte> {
    const response = await apiClient.get(`/alertes/${alerteId}/`)
    return response.data
  },

  // Marquer comme lue
  async markAsRead(alerteId: string): Promise<Alerte> {
    const response = await apiClient.patch(`/alertes/${alerteId}/`, {
      action: 'marquer_lue',
    })
    return response.data
  },

  // Traiter une alerte
  async treatAlert(alerteId: string, data: {
    action_corrective?: string
    commentaire?: string
  }): Promise<Alerte> {
    const response = await apiClient.patch(`/alertes/${alerteId}/`, {
      action: 'traiter',
      action_corrective: data.action_corrective,
      commentaire: data.commentaire,
    })
    return response.data
  },
}