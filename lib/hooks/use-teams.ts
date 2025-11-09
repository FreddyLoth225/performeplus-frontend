import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamService, TeamSettings, SeuilPersonnalise } from '@/lib/api/team.service'
import { toast } from 'sonner'

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => teamService.getMyTeams(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useTeamDetails(equipeId: string | undefined) {
  return useQuery({
    queryKey: ['team', equipeId],
    queryFn: () => teamService.getTeamDetails(equipeId!),
    enabled: !!equipeId,
  })
}

export function useTeamMembers(equipeId: string | undefined) {
  return useQuery({
    queryKey: ['team-members', equipeId],
    queryFn: () => teamService.getTeamMembers(equipeId!),
    enabled: !!equipeId,
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ equipeId, data }: { equipeId: string; data: Partial<TeamSettings> }) =>
      teamService.updateTeam(equipeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team', variables.equipeId] })
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      toast.success('Paramètres de l\'équipe mis à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des paramètres')
    },
  })
}

export function useTeamThresholds(equipeId: string | undefined) {
  return useQuery({
    queryKey: ['team-thresholds', equipeId],
    queryFn: () => teamService.getThresholds(equipeId!),
    enabled: !!equipeId,
  })
}

export function useCreateThreshold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<SeuilPersonnalise, 'id' | 'date_creation' | 'date_modification'>) =>
      teamService.createThreshold(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-thresholds', data.equipe] })
      toast.success('Seuil personnalisé créé')
    },
    onError: () => {
      toast.error('Erreur lors de la création du seuil')
    },
  })
}

export function useUpdateThreshold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ seuilId, data }: { seuilId: string; data: Partial<SeuilPersonnalise> }) =>
      teamService.updateThreshold(seuilId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-thresholds', data.equipe] })
      toast.success('Seuil personnalisé mis à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour du seuil')
    },
  })
}

export function useDeleteThreshold() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ seuilId, equipeId }: { seuilId: string; equipeId: string }) =>
      teamService.deleteThreshold(seuilId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-thresholds', variables.equipeId] })
      toast.success('Seuil personnalisé supprimé')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression du seuil')
    },
  })
}
