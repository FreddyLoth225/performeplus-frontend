import { apiClient } from './client'
import { Utilisateur } from '@/lib/types'

export interface UpdateProfilePayload {
  nom?: string
  prenoms?: string
  telephone?: string | null
  whatsapp?: string | null
  langue?: string
  fuseau_horaire?: string
  deuxFacteursActif?: boolean
  password?: string
  old_password?: string
  photo?: File | null
  remove_photo?: boolean
}

export interface ProfileUpdateResponse {
  message: string
  profil: Utilisateur
}

export interface EmailChangePayload {
  new_email: string
  password: string
}

function normaliseValue(value: unknown) {
  if (value === null) {
    return ''
  }
  return value
}

export const profileService = {
  async updateProfile(payload: UpdateProfilePayload): Promise<ProfileUpdateResponse> {
    const { photo, remove_photo, ...rest } = payload
    const serialisable: Record<string, any> = {}

    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined) {
        serialisable[key] = normaliseValue(value)
      }
    })

    if (remove_photo !== undefined) {
      serialisable.remove_photo = remove_photo
    }

    if (photo instanceof File) {
      const formData = new FormData()
      formData.append('photo', photo)
      Object.entries(serialisable).forEach(([key, value]) => {
        if (value === undefined) {
          return
        }
        if (value === null) {
          formData.append(key, '')
          return
        }
        formData.append(key, typeof value === 'boolean' ? String(value) : (value as string))
      })

      const response = await apiClient.patch('/profil/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    }

    const response = await apiClient.patch('/profil/', serialisable)
    return response.data
  },

  async requestEmailChange(payload: EmailChangePayload): Promise<{ message: string }> {
    const response = await apiClient.post('/change-email/request/', payload)
    return response.data
  },
}
