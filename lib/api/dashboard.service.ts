import { apiClient } from './client'

export interface DashboardJoueur {
  joueur: {
    nom: string
    dossard: number
    poste: string
    equipe: string
  }
  indice_forme_jour: {
    score: number
    interpretation: {
      niveau: string
      couleur: string
      message: string
    }
    sommeil: number
    fatigue: number
    courbatures: number
    stress: number
  } | null
  rappel_saisie_forme: boolean
  seances_sans_rpe: number
  prochaines_seances: Array<{
    id: string
    type: string
    date: string
    lieu: string
    description?: string
  }>
  derniere_seance: {
    date: string
    type: string
    rpe_saisi: boolean
    rpe: number | null
  } | null
  statistiques_periode: {
    periode_jours: number
    nombre_seances: number
    charge_totale: number
    charge_moyenne: number
    indice_forme_moyen: number | null
  }
  indicateurs_actuels: {
    ca: number
    cc: number
    rca: {
      valeur: number
      interpretation: string
    }
    im: {
      valeur: number
      interpretation: string
    }
    ic: {
      valeur: number
      interpretation: string
    }
  }
  graphiques: {
    evolution_charge: Array<{
      date: string
      cej: number
      rpe: number
      duree: number
    }>
    evolution_indice_forme: Array<{
      date: string
      score: number
      sommeil: number
      fatigue: number
      courbatures: number
      stress: number
    }>
  }
}

export interface DashboardStaff {
  equipe: {
    nom: string
    joueurs_actifs: number
  }
  kpis: {
    seances_semaine: number
    charge_totale_periode: number
    taux_saisie_rpe: number
    taux_saisie_indice: number
  }
  alertes: {
    total: number
    critiques: number
    attention: number
    info: number
    alertes_urgentes: Array<{
      id: string
      type: string
      niveau: string
      message: string
      priorite: number
      joueur: string | null
      date: string
    }>
  }
  graphiques: {
    charge_equipe: Array<{
      date: string
      charge: number
    }>
    distribution_rpe: Record<string, number>
    indice_forme_moyen: Array<{
      date: string
      moyenne: number
    }>
  }
  joueurs: Array<{
    id: string
    nom: string
    dossard: number
    poste: string
    indice_forme: number | null
    rca: number
    im: number
    ic: number
    alertes_actives: number
    derniere_saisie: string | null
  }>
}

export const dashboardService = {
  // Dashboard joueur
  async getDashboardJoueur(equipeId: string, periode: number = 7): Promise<DashboardJoueur> {
    const response = await apiClient.get('/dashboard/joueur/', {
      params: { equipe_id: equipeId, periode }
    })
    return response.data
  },

  // Dashboard staff
  async getDashboardStaff(equipeId: string, periode: number = 7): Promise<DashboardStaff> {
    const response = await apiClient.get('/dashboard/staff/', {
      params: { equipe_id: equipeId, periode }
    })
    return response.data
  },
}
