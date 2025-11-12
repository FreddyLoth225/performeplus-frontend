'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import {
  profileInfoSchema,
  passwordUpdateSchema,
  emailChangeSchema,
  type ProfileInfoFormValues,
  type PasswordUpdateFormValues,
  type EmailChangeFormValues,
} from '@/lib/validators/profile.schemas'
import { profileService, type UpdateProfilePayload } from '@/lib/api/profile.service'
import { useAuthStore } from '@/lib/store/auth-store'
import { RolePlateforme } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Upload, Trash2, ShieldCheck, Mail } from 'lucide-react'

const languageOptions = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
  { value: 'pt', label: 'Portugais' },
  { value: 'ar', label: 'Arabe' },
  { value: 'es', label: 'Espagnol' },
  { value: 'sw', label: 'Swahili' },
]

const roleLabels: Record<RolePlateforme, string> = {
  NORMAL: 'Utilisateur',
  AGENT_PP: 'Agent PP',
  DIRECTEUR_PP: 'Directeur PP',
}

const fallbackTimezones = [
  'UTC',
  'Africa/Abidjan',
  'Africa/Dakar',
  'Africa/Algiers',
  'Europe/Paris',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Asia/Dubai',
  'Asia/Tokyo',
]

function extractErrorMessage(error: unknown): string {
  const err = error as AxiosError<any>
  const data = err?.response?.data
  if (!data) {
    return "Une erreur est survenue"
  }
  if (typeof data === 'string') {
    return data
  }
  if (data.message) {
    return data.message
  }
  if (data.detail) {
    return data.detail
  }
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors[0]
  }
  const firstKey = Object.keys(data)[0]
  if (firstKey && Array.isArray(data[firstKey]) && data[firstKey].length) {
    return data[firstKey][0]
  }
  return "Une erreur est survenue"
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [timezones, setTimezones] = useState<string[]>(fallbackTimezones)

  const infoForm = useForm<ProfileInfoFormValues>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      nom: '',
      prenoms: '',
      telephone: '',
      whatsapp: '',
      langue: 'fr',
      fuseau_horaire: 'UTC',
    },
  })

  const passwordForm = useForm<PasswordUpdateFormValues>({
    resolver: zodResolver(passwordUpdateSchema),
    defaultValues: {
      old_password: '',
      password: '',
      confirm_password: '',
    },
  })

  const emailForm = useForm<EmailChangeFormValues>({
    resolver: zodResolver(emailChangeSchema),
    defaultValues: {
      new_email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (Intl as any).supportedValuesOf === 'function') {
      const supported = ((Intl as any).supportedValuesOf('timeZone') as string[]).slice().sort()
      setTimezones(supported)
    }
  }, [])

  useEffect(() => {
    if (user) {
      const defaultLangue = languageOptions.some((option) => option.value === user.langue)
        ? (user.langue as ProfileInfoFormValues['langue'])
        : 'fr'
      const defaultTimezone = user.fuseau_horaire || 'UTC'
      infoForm.reset({
        nom: user.nom || '',
        prenoms: user.prenoms || '',
        telephone: user.telephone || '',
        whatsapp: user.whatsapp || '',
        langue: defaultLangue,
        fuseau_horaire: defaultTimezone,
      })
      setPhotoPreview(user.photo ?? null)
      setPhotoFile(null)
      setRemovePhoto(false)
    }
  }, [user, infoForm])

  useEffect(() => {
    if (user?.fuseau_horaire) {
      setTimezones((current) =>
        current.includes(user.fuseau_horaire)
          ? current
          : [user.fuseau_horaire, ...current]
      )
    }
  }, [user?.fuseau_horaire])

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview)
      }
    }
  }, [photoPreview])

  const handleProfileSuccess = (data: Awaited<ReturnType<typeof profileService.updateProfile>>) => {
    setUser(data.profil)
    queryClient.setQueryData(['current-user'], data.profil)
    toast.success(data.message)
  }

  const updateInfoMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: (data) => {
      handleProfileSuccess(data)
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview)
      }
      setPhotoFile(null)
      setRemovePhoto(false)
      setPhotoPreview(data.profil.photo ?? null)
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error))
    },
  })

  const passwordMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: (data) => {
      handleProfileSuccess(data)
      passwordForm.reset()
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error))
    },
  })

  const twoFactorMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => profileService.updateProfile(payload),
    onSuccess: (data) => {
      handleProfileSuccess(data)
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error))
    },
  })

  const emailMutation = useMutation({
    mutationFn: profileService.requestEmailChange,
    onSuccess: (data) => {
      toast.success(data.message)
      emailForm.reset()
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error))
    },
  })

  const handlePhotoSelection = (file: File | undefined) => {
    if (!file) {
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Formats acceptés : JPG, PNG ou WEBP')
      return
    }
    setPhotoPreview((prev) => {
      if (prev && prev.startsWith('blob:')) {
        URL.revokeObjectURL(prev)
      }
      return URL.createObjectURL(file)
    })
    setPhotoFile(file)
    setRemovePhoto(false)
  }

  const handleRemovePhoto = () => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview)
    }
    setPhotoPreview(null)
    setPhotoFile(null)
    setRemovePhoto(true)
  }

  const onSubmitInfo = (values: ProfileInfoFormValues) => {
    updateInfoMutation.mutate({
      nom: values.nom?.trim() ?? '',
      prenoms: values.prenoms?.trim() ?? '',
      telephone: values.telephone?.trim() ?? '',
      whatsapp: values.whatsapp?.trim() ?? '',
      langue: values.langue,
      fuseau_horaire: values.fuseau_horaire,
      photo: photoFile ?? undefined,
      remove_photo: removePhoto ? true : undefined,
    })
  }

  const onSubmitPassword = (values: PasswordUpdateFormValues) => {
    passwordMutation.mutate({
      old_password: values.old_password,
      password: values.password,
    })
  }

  const onSubmitEmail = (values: EmailChangeFormValues) => {
    emailMutation.mutate(values)
  }

  const handleTwoFactorToggle = (enabled: boolean) => {
    if (!user) {
      return
    }
    const shouldEnable = enabled
    const twoFactorRequired =
      user.rolePlateforme === RolePlateforme.AGENT_PP ||
      user.rolePlateforme === RolePlateforme.DIRECTEUR_PP
    if (!shouldEnable && twoFactorRequired) {
      toast.info('La double authentification est obligatoire pour votre rôle')
      return
    }
    twoFactorMutation.mutate({ deuxFacteursActif: shouldEnable })
  }

  const initials = useMemo(() => {
    if (!user) {
      return '??'
    }
    const first = (user.prenoms || '').charAt(0)
    const last = (user.nom || '').charAt(0)
    const pair = `${first}${last}`.trim().toUpperCase()
    return pair || '??'
  }, [user])

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const infoErrors = infoForm.formState.errors
  const passwordErrors = passwordForm.formState.errors
  const emailErrors = emailForm.formState.errors

  return (
    <div className="p-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">Mon profil</h1>
          <Badge variant="secondary">{roleLabels[user.rolePlateforme]}</Badge>
        </div>
        <p className="text-slate-600">
          Mettez à jour vos informations personnelles, vos préférences et la sécurité du compte.
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Photo, identité et coordonnées visibles sur la plateforme.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={infoForm.handleSubmit(onSubmitInfo)} className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={photoPreview ?? undefined} alt="Photo de profil" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updateInfoMutation.isPending}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Changer la photo
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleRemovePhoto}
                    disabled={updateInfoMutation.isPending || (!photoPreview && !photoFile)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) => handlePhotoSelection(event.target.files?.[0])}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="prenoms">Prénoms</Label>
                  <Input id="prenoms" {...infoForm.register('prenoms')} />
                  {infoErrors.prenoms && (
                    <p className="text-sm text-danger">{infoErrors.prenoms.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" {...infoForm.register('nom')} />
                  {infoErrors.nom && (
                    <p className="text-sm text-danger">{infoErrors.nom.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    placeholder="Ex: +221770000000"
                    {...infoForm.register('telephone')}
                  />
                  {infoErrors.telephone && (
                    <p className="text-sm text-danger">{infoErrors.telephone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">Numéro WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="Ex: +221770000000"
                    {...infoForm.register('whatsapp')}
                  />
                  {infoErrors.whatsapp && (
                    <p className="text-sm text-danger">{infoErrors.whatsapp.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Langue préférée</Label>
                  <Controller
                    control={infoForm.control}
                    name="langue"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choisir une langue" />
                        </SelectTrigger>
                        <SelectContent>
                          {languageOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {infoErrors.langue && (
                    <p className="text-sm text-danger">{infoErrors.langue.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Fuseau horaire</Label>
                  <Controller
                    control={infoForm.control}
                    name="fuseau_horaire"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choisir un fuseau" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {timezones.map((zone) => (
                            <SelectItem key={zone} value={zone}>
                              {zone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {infoErrors.fuseau_horaire && (
                    <p className="text-sm text-danger">{infoErrors.fuseau_horaire.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={updateInfoMutation.isPending}>
                  {updateInfoMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    'Enregistrer les modifications'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>
              Activez l’authentification à deux facteurs et mettez à jour votre mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <p className="font-medium">Double authentification par email</p>
                </div>
                <p className="text-sm text-slate-600">
                  Recevez un code par email à chaque connexion.
                </p>
              </div>
              <Checkbox
                id="two-factor"
                checked={user.deuxFacteursActif}
                disabled={twoFactorMutation.isPending}
                onCheckedChange={(value) => handleTwoFactorToggle(value === true)}
              />
            </div>

            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="old_password">Ancien mot de passe</Label>
                  <Input
                    id="old_password"
                    type="password"
                    autoComplete="current-password"
                    {...passwordForm.register('old_password')}
                  />
                  {passwordErrors.old_password && (
                    <p className="text-sm text-danger">{passwordErrors.old_password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    {...passwordForm.register('password')}
                  />
                  {passwordErrors.password && (
                    <p className="text-sm text-danger">{passwordErrors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmation</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    {...passwordForm.register('confirm_password')}
                  />
                  {passwordErrors.confirm_password && (
                    <p className="text-sm text-danger">{passwordErrors.confirm_password.message}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={passwordMutation.isPending}>
                  {passwordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Modifier le mot de passe'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changement d’email</CardTitle>
            <CardDescription>
              Un lien de confirmation sera envoyé à votre nouvelle adresse.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_email">Nouvel email</Label>
                <Input
                  id="new_email"
                  type="email"
                  placeholder="nouveau@email.com"
                  {...emailForm.register('new_email')}
                />
                {emailErrors.new_email && (
                  <p className="text-sm text-danger">{emailErrors.new_email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_password">Mot de passe actuel</Label>
                <Input
                  id="email_password"
                  type="password"
                //   autoComplete="current-password"
                  {...emailForm.register('password')}
                />
                {emailErrors.password && (
                  <p className="text-sm text-danger">{emailErrors.password.message}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4" />
                <p>Confirmez le lien reçu pour finaliser le changement.</p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={emailMutation.isPending}>
                  {emailMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Envoyer la demande'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
