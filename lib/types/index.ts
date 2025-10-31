// Enums
export enum RolePlateforme {
  NORMAL = 'NORMAL',
  AGENT_PP = 'AGENT_PP',
  DIRECTEUR_PP = 'DIRECTEUR_PP'
}

export enum RoleEquipe {
  OWNER = 'OWNER',
  STAFF = 'STAFF',
  PLAYER = 'PLAYER'
}

export enum Sport {
  FOOTBALL = 'FOOTBALL',
  BASKETBALL = 'BASKETBALL',
  RUGBY = 'RUGBY',
  HANDBALL = 'HANDBALL',
  VOLLEYBALL = 'VOLLEYBALL',
  AUTRE = 'AUTRE'
}

export enum Poste {
  GARDIEN = 'GARDIEN',
  DEFENSEUR = 'DEFENSEUR',
  MILIEU = 'MILIEU',
  ATTAQUANT = 'ATTAQUANT'
}

export enum StatutSeance {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE'
}

// Interfaces principales
export interface Utilisateur {
  id: string
  email: string
  nom: string
  prenoms: string
  photo?: string
  telephone?: string
  whatsapp?: string
  langue: string
  fuseau_horaire: string
  rolePlateforme: RolePlateforme
  deuxFacteursActif: boolean
}

export interface Equipe {
  id: string
  nom: string
  pays: string
  sport: Sport
  logo?: string
  dateCreation: string
  actif: boolean
}

export interface MembreEquipe {
  id: string
  utilisateur: Utilisateur
  equipe: Equipe
  role: RoleEquipe
  permissions?: Record<string, boolean>
  dateAdhesion: string
  actif: boolean
}

export interface ProfilJoueur {
  id: string
  dateNaissance: string
  dossard: number
  poste: Poste
  piedFort?: 'GAUCHE' | 'DROITE' | 'AMBIDEXTRE'
  poids?: number
  taille?: number
  nationalite?: string
  statut: 'ACTIF' | 'BLESSE' | 'SUSPENDU' | 'PRET' | 'DEPART'
}

export interface Seance {
  id: string
  equipe_id: string
  type: 'ENTRAINEMENT' | 'MATCH' | 'RECUPERATION' | 'AUTRE'
  dateDebut: string
  dateFin?: string
  lieu?: string
  description?: string
  statut: StatutSeance
  createur?: string
  parametres?: Record<string, any>
}

export interface InterpretationIndiceForme {
  niveau: 'TRES_MAUVAIS' | 'MAUVAIS' | 'MOYEN' | 'BON' | 'EXCELLENT'
  couleur: 'red' | 'orange' | 'green'
  message: string
}

export interface IndiceForme {
  id: string
  date: string
  sommeil: number
  fatigue: number
  courbatures: number
  stress: number
  scorTotal: number
  interpretation: InterpretationIndiceForme
  peut_modifier: boolean
}

export interface SaisieRPE {
  id: string
  seance_id: string
  valeurRPE: number
  dureeReelle: number
  commentaire?: string
  cej: number
  peut_modifier: boolean
  verrouille: boolean
}

// Interface pour les statistiques joueur
export interface JoueurStats {
  id: string
  membre_id: string
  utilisateur: {
    id: string
    nom: string
    prenoms: string
    email: string
    photo?: string
  }
  profil: {
    dossard: number
    poste: 'GARDIEN' | 'DEFENSEUR' | 'MILIEU' | 'ATTAQUANT'
    piedFort?: 'GAUCHE' | 'DROITE' | 'AMBIDEXTRE'
    dateNaissance: string
    age: number
    poids?: number
    taille?: number
    nationalite?: string
    statut: 'ACTIF' | 'BLESSE' | 'SUSPENDU' | 'PRET' | 'DEPART'
  }
  statistiques: {
    seances_effectuees: number
    rca_moyen: number
    im_moyen: number
    ic_moyen: number
    alertes_actives: number
  }
  indice_forme_actuel?: {
    score: number
    date: string
    interpretation: InterpretationIndiceForme
  } | null
  dateAdhesion: string
  // Propriétés calculées pour compatibilité avec l'ancien format
  stats: {
    nombreSeances: number
    indiceForme: {
      actuel: number | null
    }
    indicateurs: {
      rca: number
      im: number
      ic: number
    }
  }
}