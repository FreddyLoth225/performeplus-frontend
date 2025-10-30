import { apiClient } from './client'
import { ProfilJoueur } from '@/lib/types'

export interface CreatePlayerData {
  equipe_id: string
  email: string
  nom: string
  prenoms: string
  dateNaissance: string
  dossard: number
  poste: 'GARDIEN' | 'DEFENSEUR' | 'MILIEU' | 'ATTAQUANT'
  piedFort?: 'GAUCHE' | 'DROITE' | 'AMBIDEXTRE'
  poids?: number
  taille?: number
  nationalite?: string
}

export interface UpdatePlayerData extends Partial<Omit<CreatePlayerData, 'equipe_id' | 'email'>> {
  statut?: 'ACTIF' | 'BLESSE' | 'SUSPENDU' | 'PRET' | 'DEPART'
}

export interface ImportPlayersData {
  file: File
  equipe_id: string
}

export interface PlayerStats {
  id: string
  profil: ProfilJoueur
  stats: {
    nombreSeances: number
    chargeTotal: number
    chargeMoyenne: number
    indiceForme: {
      actuel: number
      moyenne: number
    }
    indicateurs: {
      ca: number
      cc: number
      rca: number
      im: number
      ic: number
    }
  }
}

export const playerService = {
  // Récupérer la liste des joueurs d'une équipe
  async getPlayers(equipeId: string): Promise<PlayerStats[]> {
    const response = await apiClient.get(`/equipes/${equipeId}/joueurs/`)
    return response.data
  },

  // Récupérer un joueur spécifique
  async getPlayer(profilId: string): Promise<PlayerStats> {
    const response = await apiClient.get(`/joueurs/${profilId}/`)
    return response.data
  },

  // Créer/Inviter un joueur
  async createPlayer(data: CreatePlayerData): Promise<void> {
    const response = await apiClient.post('/invitations/create/', {
      equipe_id: data.equipe_id,
      email: data.email,
      roleEquipe: 'PLAYER',
      profil_joueur_prerempli: {
        dateNaissance: data.dateNaissance,
        dossard: data.dossard,
        poste: data.poste,
        piedFort: data.piedFort,
        poids: data.poids,
        taille: data.taille,
        nationalite: data.nationalite,
      },
    })
    return response.data
  },

  // Mettre à jour un profil joueur
  async updatePlayer(profilId: string, data: UpdatePlayerData): Promise<ProfilJoueur> {
    const response = await apiClient.patch(`/joueurs/${profilId}/`, data)
    return response.data
  },

  // Archiver un joueur
  async archivePlayer(membreId: string): Promise<void> {
    await apiClient.patch(`/membres/${membreId}/`, { archive: true })
  },

  // Réactiver un joueur
  async reactivatePlayer(membreId: string): Promise<void> {
    await apiClient.patch(`/membres/${membreId}/`, { archive: false })
  },

  // Import en masse
  async importPlayers(data: ImportPlayersData): Promise<any> {
    const formData = new FormData()
    formData.append('file', data.file)

    const response = await apiClient.post(
      `/equipes/${data.equipe_id}/import-joueurs/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  // Statistiques d'un joueur (détaillées)
  async getPlayerStats(profilId: string, periode: number = 30): Promise<any> {
    const response = await apiClient.get(`/stats/`, {
      params: {
        joueur_id: profilId,
        periode,
      },
    })
    return response.data
  },

  // Indicateurs de performance
  async getPlayerIndicators(profilId: string): Promise<any> {
    const response = await apiClient.get(`/indicateurs/${profilId}/`)
    return response.data
  },
}