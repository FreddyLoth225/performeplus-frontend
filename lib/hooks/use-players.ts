import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  playerService,
  CreatePlayerData,
  UpdatePlayerData,
  ImportPlayersData,
  ArchivePlayerPayload,
  ReactivatePlayerPayload,
  PlayerMutationResponse,
} from '../api/player.service'
import { toast } from 'sonner'

// Liste des joueurs d'une équipe
export function usePlayers(equipeId: string) {
  return useQuery({
    queryKey: ['players', equipeId],
    queryFn: () => playerService.getPlayers(equipeId),
    enabled: !!equipeId,
  })
}

// Détails d'un joueur
export function usePlayer(profilId: string | null) {
  return useQuery({
    queryKey: ['player', profilId],
    queryFn: () => playerService.getPlayer(profilId!),
    enabled: !!profilId,
  })
}

// Statistiques d'un joueur
export function usePlayerStats(profilId: string | null, periode: number = 30) {
  return useQuery({
    queryKey: ['player-stats', profilId, periode],
    queryFn: () => playerService.getPlayerStats(profilId!, periode),
    enabled: !!profilId,
  })
}

// Indicateurs de performance
export function usePlayerIndicators(profilId: string | null) {
  return useQuery({
    queryKey: ['player-indicators', profilId],
    queryFn: () => playerService.getPlayerIndicators(profilId!),
    enabled: !!profilId,
  })
}

// Créer/Inviter un joueur
export function useCreatePlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePlayerData) => playerService.createPlayer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      toast.success('Invitation envoyée au joueur')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erreur lors de l'invitation"
      toast.error(message)
    },
  })
}

// Mettre à jour un joueur
export function useUpdatePlayer() {
  const queryClient = useQueryClient()

  return useMutation<PlayerMutationResponse, unknown, { profilId: string; data: UpdatePlayerData }>({
    mutationFn: ({ profilId, data }: { profilId: string; data: UpdatePlayerData }) =>
      playerService.updatePlayer(profilId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['player', variables.profilId] })
      queryClient.invalidateQueries({ queryKey: ['player-stats', variables.profilId] })
      queryClient.invalidateQueries({ queryKey: ['player-indicators', variables.profilId] })
      toast.success(data?.message ?? 'Profil mis à jour')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour'
      toast.error(message)
    },
  })
}

// Archiver un joueur
export function useArchivePlayer() {
  const queryClient = useQueryClient()

  return useMutation<PlayerMutationResponse, unknown, ArchivePlayerPayload>({
    mutationFn: (payload) => playerService.archivePlayer(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['player', variables.profilId] })
      queryClient.invalidateQueries({ queryKey: ['player-stats', variables.profilId] })
      queryClient.invalidateQueries({ queryKey: ['player-indicators', variables.profilId] })
      toast.success(data?.message ?? 'Joueur archivé')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erreur lors de l'archivage"
      toast.error(message)
    },
  })
}

// Réactiver un joueur
export function useReactivatePlayer() {
  const queryClient = useQueryClient()

  return useMutation<PlayerMutationResponse, unknown, ReactivatePlayerPayload>({
    mutationFn: (payload) => playerService.reactivatePlayer(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['player', variables.profilId] })
      queryClient.invalidateQueries({ queryKey: ['player-stats', variables.profilId] })
      queryClient.invalidateQueries({ queryKey: ['player-indicators', variables.profilId] })
      toast.success(data?.message ?? 'Joueur réactivé')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la réactivation'
      toast.error(message)
    },
  })
}

// Import en masse
export function useImportPlayers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ImportPlayersData) => playerService.importPlayers(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      const { succes, echecs } = data
      toast.success(`${succes} joueur(s) importé(s)${echecs > 0 ? `, ${echecs} échec(s)` : ''}`)
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erreur lors de l'import"
      toast.error(message)
    },
  })
}