import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertService, AlertFilters } from '../api/alert.service'
import { toast } from 'sonner'

export function useAlerts(filters: AlertFilters) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => alertService.getAlerts(filters),
    enabled: !!filters.equipe_id,
    refetchInterval: 30000, // Refresh toutes les 30s
  })
}

export function useAlert(alerteId: string | null) {
  return useQuery({
    queryKey: ['alert', alerteId],
    queryFn: () => alertService.getAlert(alerteId!),
    enabled: !!alerteId,
  })
}

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (alerteId: string) => alertService.markAsRead(alerteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })
}

export function useTreatAlert() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ alerteId, data }: { alerteId: string; data: any }) =>
      alertService.treatAlert(alerteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      toast.success('Alerte traitée')
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Erreur lors du traitement'
      toast.error(message)
    },
  })
}