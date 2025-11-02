import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  sessionService,
  CreateSeanceData,
  UpdateSeanceData,
  SeanceMutationResponse,
  ForceUpdateError,
  DuplicateSeancePayload,
} from '../api/session.service'
import { toast } from 'sonner'

// ✅ HOOKS POUR RÉCUPÉRER LES DONNÉES (comme avant)

export function useSessions(equipeId: string, params?: {
  date_debut?: string
  date_fin?: string
  statut?: string
  type?: string
  joueur_id?: string
}) {
  return useQuery({
    queryKey: ['sessions', equipeId, params],
    queryFn: async () => {
      const result = await sessionService.getSessions(equipeId, params)
      return result.seances
    },
    enabled: !!equipeId,
  })
}

export function useSession(seanceId: string | null) {
  return useQuery({
    queryKey: ['session', seanceId],
    queryFn: async () => sessionService.getSessionDetails(seanceId!),
    enabled: !!seanceId,
  })
}

export function useCalendar(equipeId: string, dateDebut: string, dateFin: string) {
  return useQuery({
    queryKey: ['calendar', equipeId, dateDebut, dateFin],
    queryFn: () => sessionService.getCalendar(equipeId, dateDebut, dateFin),
    enabled: !!equipeId && !!dateDebut && !!dateFin,
  })
}

// 🆕 HOOKS POUR LES ACTIONS (MUTATIONS)

export function useCreateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSeanceData) => sessionService.createSession(data),
    onSuccess: (response: SeanceMutationResponse) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success(response.message || 'Séance créée avec succès')
      response.warnings?.forEach((warning) => toast.info(warning))
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la duplication'
      toast.error(message)
    },
  })
}

export function useChangeSessionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      seanceId,
      statut,
    }: {
      seanceId: string
      statut: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE'
    }) => sessionService.changeSessionStatus(seanceId, statut),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['session', response.seance.id] })
      toast.success(response.message || 'Statut modifié')
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Erreur lors du changement de statut'
      toast.error(message)
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      seanceId,
      data,
      forceUpdate,
    }: {
      seanceId: string
      data: UpdateSeanceData
      forceUpdate?: boolean
    }) => sessionService.updateSession(seanceId, data, { forceUpdate }),
    onSuccess: (response: SeanceMutationResponse, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['session', variables.seanceId] })
      toast.success(response.message || 'Séance mise à jour')
      response.warnings?.forEach((warning) => toast.info(warning))
    },
    onError: (error: any) => {
      if (error instanceof ForceUpdateError) {
        toast.info(error.message)
      } else {
        const message = error.response?.data?.message || 'Erreur lors de la mise à jour'
        toast.error(message)
      }
    },
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (seanceId: string) => sessionService.deleteSession(seanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('Séance supprimée')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la suppression'
      toast.error(message)
    },
  })
}

export function useDuplicateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      seanceId,
      payload,
    }: {
      seanceId: string
      payload?: DuplicateSeancePayload
    }) => sessionService.duplicateSession(seanceId, payload),
    onSuccess: (response: SeanceMutationResponse) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success(response.message || 'Séance dupliquée')
      response.warnings?.forEach((warning) => toast.info(warning))
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la duplication'
      toast.error(message)
    },
  })
}