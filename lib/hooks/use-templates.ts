import { useQuery } from '@tanstack/react-query'
import { templateService } from '@/lib/api/template.service'

export function useTemplates(equipeId?: string) {
  return useQuery({
    queryKey: ['templates', equipeId || 'all'],
    queryFn: () => templateService.getTemplates(equipeId ? { equipe: equipeId } : undefined),
    enabled: !!equipeId,
    staleTime: 1000 * 60 * 5,
  })
}
