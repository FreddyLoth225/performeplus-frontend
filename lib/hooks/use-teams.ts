import { useQuery } from '@tanstack/react-query'
import { teamService } from '@/lib/api/team.service'

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