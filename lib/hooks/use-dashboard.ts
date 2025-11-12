import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../api/dashboard.service'

export function useDashboardJoueur(equipeId: string | undefined, periode: number = 7) {
  return useQuery({
    queryKey: ['dashboard-player', equipeId, periode],
    queryFn: () => dashboardService.getDashboardJoueur(equipeId!, periode),
    enabled: !!equipeId,
    refetchInterval: 60000, // Refresh toutes les minutes
  })
}

export function useDashboardStaff(equipeId: string | undefined, periode: number = 7) {
  return useQuery({
    queryKey: ['dashboard-staff', equipeId, periode],
    queryFn: () => dashboardService.getDashboardStaff(equipeId!, periode),
    enabled: !!equipeId,
    refetchInterval: 30000, // Refresh toutes les 30 secondes
  })
}
