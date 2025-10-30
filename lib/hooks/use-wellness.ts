import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { wellnessService, CreateIndiceFormeData, CreateRPEData } from '@/lib/api/wellness.service'
import { toast } from 'sonner'

export function useIndiceForme(equipeId: string | undefined) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateIndiceFormeData) => wellnessService.createIndiceForme(data),
    onSuccess: () => {
      toast.success('Indice de forme enregistré !')
      queryClient.invalidateQueries({ queryKey: ['indice-forme', equipeId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-player', equipeId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la saisie')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateIndiceFormeData> }) =>
      wellnessService.updateIndiceForme(id, data),
    onSuccess: () => {
      toast.success('Indice de forme modifié !')
      queryClient.invalidateQueries({ queryKey: ['indice-forme', equipeId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la modification')
    },
  })

  const todayQuery = useQuery({
    queryKey: ['indice-forme', equipeId, 'today'],
    queryFn: () => wellnessService.getIndiceFormeToday(equipeId!),
    enabled: !!equipeId,
  })

  const historyQuery = useQuery({
    queryKey: ['indice-forme', equipeId, 'history'],
    queryFn: () => wellnessService.getIndiceFormeHistory(equipeId!, 7),
    enabled: !!equipeId,
  })

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    today: todayQuery.data,
    history: historyQuery.data,
    isLoadingToday: todayQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
  }
}

export function useRPE(equipeId: string | undefined) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CreateRPEData) => wellnessService.createRPE(data),
    onSuccess: () => {
      toast.success('RPE enregistré !')
      queryClient.invalidateQueries({ queryKey: ['rpe-pending', equipeId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-player', equipeId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la saisie')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRPEData> }) =>
      wellnessService.updateRPE(id, data),
    onSuccess: () => {
      toast.success('RPE modifié !')
      queryClient.invalidateQueries({ queryKey: ['rpe-pending', equipeId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la modification')
    },
  })

  const pendingQuery = useQuery({
    queryKey: ['rpe-pending', equipeId],
    queryFn: () => wellnessService.getRPEPending(equipeId!),
    enabled: !!equipeId,
  })

  const historyQuery = useQuery({
    queryKey: ['rpe-history', equipeId],
    queryFn: () => wellnessService.getRPEHistory(equipeId!),
    enabled: !!equipeId,
  })

  return {
    create: createMutation.mutate,
    update: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    pending: pendingQuery.data || [],
    history: historyQuery.data || [],
    isLoadingPending: pendingQuery.isLoading,
    isLoadingHistory: historyQuery.isLoading,
  }
}