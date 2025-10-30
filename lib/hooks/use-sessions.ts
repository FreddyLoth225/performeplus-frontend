import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sessionService, CreateSeanceData, UpdateSeanceData } from '../api/session.service'
import { toast } from 'sonner'

// ✅ HOOKS POUR RÉCUPÉRER LES DONNÉES (comme avant)

export function useSessions(equipeId: string, params?: {
  date_debut?: string
  date_fin?: string
  statut?: string
}) {
  return useQuery({
    queryKey: ['sessions', equipeId, params],
    queryFn: () => sessionService.getSessions(equipeId, params),
    enabled: !!equipeId,
  })
}

export function useSession(seanceId: string | null) {
  return useQuery({
    queryKey: ['session', seanceId],
    queryFn: () => sessionService.getSessionDetails(seanceId!),
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('Séance créée avec succès')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la création'
      toast.error(message)
    },
  })
}

export function useUpdateSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ seanceId, data }: { seanceId: string; data: UpdateSeanceData }) =>
      sessionService.updateSession(seanceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      queryClient.invalidateQueries({ queryKey: ['session', variables.seanceId] })
      toast.success('Séance mise à jour')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la mise à jour'
      toast.error(message)
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
    mutationFn: ({ seanceId, newDate }: { seanceId: string; newDate: string }) =>
      sessionService.duplicateSession(seanceId, newDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      queryClient.invalidateQueries({ queryKey: ['calendar'] })
      toast.success('Séance dupliquée')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors de la duplication'
      toast.error(message)
    },
  })
}