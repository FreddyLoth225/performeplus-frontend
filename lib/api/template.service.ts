import { apiClient } from './client'
import { TemplateSeance } from '@/lib/types'

interface TemplateListParams {
  equipe?: string
  public_only?: boolean
}

export const templateService = {
  async getTemplates(params?: TemplateListParams): Promise<TemplateSeance[]> {
    const response = await apiClient.get('/templates-seances/', { params })
    const data = response.data
    if (Array.isArray(data)) {
      return data
    }
    if (Array.isArray(data?.results)) {
      return data.results
    }
    return []
  },

  async getTemplate(templateId: string): Promise<TemplateSeance> {
    const response = await apiClient.get(`/templates-seances/${templateId}/`)
    return response.data
  },
}
