'use client'

import { useEffect, useMemo, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCreateSession } from '@/lib/hooks/use-sessions'
import { useTeamStore } from '@/lib/store/team-store'
import { useTeamMembers } from '@/lib/hooks/use-teams'
import { useTemplates } from '@/lib/hooks/use-templates'
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon, Loader2, Users, PlusCircle, Trash2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const getDefaultTime = (baseDate: Date) => {
  const date = new Date(baseDate)
  const minutes = date.getMinutes()
  const quarter = Math.ceil(minutes / 15)
  let hour = date.getHours()
  let roundedMinutes = quarter * 15

  if (roundedMinutes >= 60) {
    hour = (hour + 1) % 24
    roundedMinutes = 0
  }

  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${pad(hour)}:${pad(roundedMinutes)}`
}

const activityTypes = [
  { value: 'ECHAUFFEMENT', label: 'Échauffement' },
  { value: 'PHYSIQUE', label: 'Physique' },
  { value: 'TECHNIQUE', label: 'Technique' },
  { value: 'TACTIQUE', label: 'Tactique' },
  { value: 'JEU', label: 'Jeu' },
  { value: 'RETOUR_CALME', label: 'Retour au calme' },
]

const activitySchema = z.object({
  type: z.enum(activityTypes.map((item) => item.value) as [string, ...string[]]),
  duree: z.coerce.number().int().min(1, 'Durée minimale de 1 minute'),
  intensite: z.coerce.number().min(0, 'Intensité minimale 0').max(10, 'Intensité maximale 10'),
  objectif: z.string().optional(),
})

const sessionSchema = z.object({
  type: z.enum(['ENTRAINEMENT', 'MATCH', 'RECUPERATION', 'AUTRE']),
  dateDebut: z.date(),
  heureDebut: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM'),
  duree: z.coerce.number().int().min(15, 'Durée minimale de 15 minutes'),
  intensite: z.coerce.number().min(0, 'Intensité minimale 0').max(10, 'Intensité maximale 10'),
  participants: z.array(z.string()).min(1, 'Sélectionnez au moins un participant'),
  lieu: z.string().optional(),
  description: z.string().optional(),
  activites: z.array(activitySchema).optional(),
})

const tabOrder = ['basics', 'participants', 'activities'] as const
type TabValue = (typeof tabOrder)[number]

type SessionFormData = z.infer<typeof sessionSchema>

const tabValidationFields: Record<TabValue, (keyof SessionFormData)[]> = {
  basics: ['type', 'dateDebut', 'heureDebut', 'duree', 'intensite'],
  participants: ['participants'],
  activities: ['activites'],
}

interface CreateSessionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate?: Date
}

export function CreateSessionDialog({
  open,
  onOpenChange,
  defaultDate,
}: CreateSessionDialogProps) {
  const { currentTeam } = useTeamStore()
  const createSession = useCreateSession()
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const { data: membersResponse, isLoading: isMembersLoading } = useTeamMembers(currentTeam?.id)
  const { data: templatesResponse = [], isLoading: isTemplatesLoading } = useTemplates(currentTeam?.id)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabValue>('basics')

  const members = membersResponse?.membres ?? []
  const membersCount = members.length
  const templates = useMemo(
    () => templatesResponse.filter((template) => template.equipe === currentTeam?.id || template.public),
    [templatesResponse, currentTeam?.id]
  )

  const initialDate = useMemo(() => defaultDate || new Date(), [defaultDate])
  const defaultTime = useMemo(() => getDefaultTime(initialDate), [initialDate])
  const defaultValues = useMemo(
    () => ({
      type: 'ENTRAINEMENT' as const,
      dateDebut: initialDate,
      heureDebut: defaultTime,
      duree: 90,
      intensite: 4,
      participants: [] as string[],
      lieu: '',
      description: '',
      activites: [] as z.infer<typeof activitySchema>[],
    }),
    [initialDate, defaultTime]
  )

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema) as Resolver<SessionFormData>,
    defaultValues,
  })

  const { fields: activityFields, append: appendActivity, remove: removeActivity, replace: replaceActivities } =
    useFieldArray({
      control,
      name: 'activites',
    })

  const dateDebut = watch('dateDebut')
  const typeSeance = watch('type')
  const participants = watch('participants') ?? []
  const participantsCount = participants.length
  const dureeMinutes = watch('duree')
  const intensitePrevue = watch('intensite')
  const activitesValues = watch('activites') ?? []
  const chargePrevue = useMemo(() => {
    if (!Number.isFinite(dureeMinutes) || !Number.isFinite(intensitePrevue)) {
      return null
    }
    return Math.round((Number(dureeMinutes) * Number(intensitePrevue)) * 10) / 10
  }, [dureeMinutes, intensitePrevue])
  const totalActivitesDuration = useMemo(
    () =>
      activitesValues.reduce((total, activite) => {
        if (!activite) return total
        return total + (Number(activite.duree) || 0)
      }, 0),
    [activitesValues]
  )
  const remainingDuration = useMemo(() => {
    if (!Number.isFinite(dureeMinutes)) {
      return null
    }
    return Math.max(0, Number(dureeMinutes) - totalActivitesDuration)
  }, [dureeMinutes, totalActivitesDuration])
  const currentTabIndex = tabOrder.indexOf(activeTab)
  const isFirstTab = currentTabIndex === 0
  const isLastTab = currentTabIndex === tabOrder.length - 1

  const goToPreviousTab = () => {
    if (isFirstTab) return
    setActiveTab(tabOrder[currentTabIndex - 1])
  }

  const goToNextTab = async () => {
    if (isLastTab) return
    const fields = tabValidationFields[activeTab]
    if (fields.length) {
      const isValid = await trigger(fields, { shouldFocus: true })
      if (!isValid) {
        return
      }
    }
    setActiveTab(tabOrder[currentTabIndex + 1])
  }

  useEffect(() => {
    if (!open) return

    if (!selectedTemplateId) {
      replaceActivities(defaultValues.activites ?? [])
      setValue('activites', defaultValues.activites ?? [])
      return
    }

    const template = templates.find((item) => item.id === selectedTemplateId)
    if (!template) return

    const orderedActivities = [...template.activites]
      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
      .map((activite) => ({
        type: activite.type,
        duree: activite.duree,
        intensite: activite.intensite,
        objectif: activite.objectif ?? undefined,
      }))

    replaceActivities(orderedActivities)
    setValue('activites', orderedActivities, { shouldDirty: true })
    setValue('duree', template.duree_prevue, { shouldDirty: true })
    setValue('intensite', template.intensite_prevue, { shouldDirty: true })
    if (template.description) {
      setValue('description', template.description, { shouldDirty: true })
    }
  }, [selectedTemplateId, templates, replaceActivities, setValue, defaultValues.activites, open])

  const onSubmit = async (data: SessionFormData) => {
    if (!currentTeam) return

    if (!data.participants || data.participants.length === 0) {
      toast.error('Merci de sélectionner au moins un participant.')
      return
    }

    // Combiner date + heure
    const [heures, minutes] = data.heureDebut.split(':').map(Number)
    const dateDebutISO = new Date(data.dateDebut)
    dateDebutISO.setHours(heures, minutes, 0, 0)

    // Calculer dateFin
    if (!Number.isFinite(data.duree) || data.duree <= 0) {
      toast.error('Veuillez saisir une durée valide.')
      return
    }
    const dateFinISO = new Date(dateDebutISO.getTime() + data.duree * 60000)

    const now = new Date()
    if (dateDebutISO <= now) {
      toast.error('Merci de choisir une date et une heure futures.')
      return
    }

    try {
      await createSession.mutateAsync({
        equipe_id: currentTeam.id,
        type: data.type,
        dateDebut: dateDebutISO.toISOString(),
        dateFin: dateFinISO.toISOString(),
        dureePrevue: data.duree,
        intensitePrevue: data.intensite,
        lieu: data.lieu || undefined,
        description: data.description || undefined,
        participants_ids: data.participants,
        activites: data.activites?.map((activite, index) => ({
          type: activite.type,
          duree: activite.duree,
          intensite: activite.intensite,
          objectif: activite.objectif || undefined,
          ordre: index + 1,
        })),
      })

      setSelectedTemplateId(null)
      replaceActivities([])
      reset(defaultValues)
      setActiveTab('basics')
      onOpenChange(false)
    } catch (error) {
      // Les toasts sont gérés par le hook
    }
  }

  const handleParticipantToggle = (memberId: string, checked: boolean | 'indeterminate') => {
    const safeChecked = checked === 'indeterminate' ? false : checked
    const currentSelection = new Set(participants)
    if (safeChecked) {
      currentSelection.add(memberId)
    } else {
      currentSelection.delete(memberId)
    }
    setValue('participants', Array.from(currentSelection))
  }

  const handleSelectAllParticipants = () => {
    if (!members.length) return
    setValue(
      'participants',
      members.map((member) => member.id),
      { shouldDirty: true }
    )
  }

  const handleSelectPlayersOnly = () => {
    if (!members.length) return
    const playerIds = members.filter((member) => member.role === 'PLAYER').map((member) => member.id)
    setValue('participants', playerIds.length ? playerIds : members.map((member) => member.id), {
      shouldDirty: true,
    })
  }

  const handleClearParticipants = () => {
    setValue('participants', [], { shouldDirty: true })
  }

  useEffect(() => {
    if (open && membersCount > 0 && participantsCount === 0) {
      let defaultParticipants = members
        .filter((member) => member.role === 'PLAYER')
        .map((member) => member.id)

      if (!defaultParticipants.length) {
        defaultParticipants = members.map((member) => member.id)
      }

      if (defaultParticipants.length) {
        setValue('participants', defaultParticipants)
      }
    }
  }, [open, members, membersCount, participantsCount, setValue])

  useEffect(() => {
    if (!open) {
      replaceActivities(defaultValues.activites ?? [])
      reset(defaultValues)
      setSelectedTemplateId(null)
      setActiveTab('basics')
    }
  }, [open, reset, defaultValues, replaceActivities])

  const handleClose = () => {
    onOpenChange(false)
    replaceActivities(defaultValues.activites ?? [])
    reset(defaultValues)
    setSelectedTemplateId(null)
    setActiveTab('basics')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-4">
          <DialogTitle>Créer une séance</DialogTitle>
          <DialogDescription>
            Planifiez une nouvelle séance d'entraînement ou un match.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabValue)}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-3 sticky top-0 z-10 bg-white">
                <TabsTrigger value="basics" className="text-xs sm:text-sm">
                  Informations
                </TabsTrigger>
                <TabsTrigger value="participants" className="text-xs sm:text-sm">
                  Participants
                </TabsTrigger>
                <TabsTrigger value="activities" className="text-xs sm:text-sm">
                  Activités
                </TabsTrigger>
              </TabsList>

            <TabsContent value="basics" className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-slate-500" /> Modèle de séance
                </Label>
                {isTemplatesLoading ? (
                  <p className="text-sm text-slate-500">Chargement des modèles...</p>
                ) : templates.length ? (
                  <Select
                    value={selectedTemplateId ?? '__none'}
                    onValueChange={(value) => {
                      if (value === '__none') {
                        setSelectedTemplateId(null)
                        return
                      }
                      setSelectedTemplateId(value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un modèle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Aucun modèle</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-slate-500">Aucun modèle disponible pour cette équipe.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type de séance *</Label>
                <Select value={typeSeance} onValueChange={(value: any) => setValue('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENTRAINEMENT">Entraînement</SelectItem>
                    <SelectItem value="MATCH">Match</SelectItem>
                    <SelectItem value="RECUPERATION">Récupération</SelectItem>
                    <SelectItem value="AUTRE">Autre</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateDebut && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateDebut ? (
                        format(dateDebut, 'PPP', { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateDebut}
                      onSelect={(date) => {
                        setValue('dateDebut', date || new Date())
                        setDatePickerOpen(false)
                      }}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dateDebut && <p className="text-sm text-red-600">{errors.dateDebut.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="heureDebut">Heure de début *</Label>
                  <Input id="heureDebut" type="time" {...register('heureDebut')} className="w-full" />
                  {errors.heureDebut && <p className="text-sm text-red-600">{errors.heureDebut.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duree">Durée (minutes) *</Label>
                  <Input id="duree" type="number" min="15" step="15" {...register('duree')} placeholder="90" />
                  {errors.duree && <p className="text-sm text-red-600">{errors.duree.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intensite">Intensité prévue (0-10)</Label>
                <Input id="intensite" type="number" step="0.5" min="0" max="10" {...register('intensite')} placeholder="4" />
                {errors.intensite && <p className="text-sm text-red-600">{errors.intensite.message}</p>}
                {chargePrevue !== null && (
                  <p className="text-xs text-slate-500">Charge prévue estimée : {chargePrevue}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lieu">Lieu</Label>
                  <Input
                    id="lieu"
                    {...register('lieu')}
                    placeholder="Stade municipal, Salle de sport..."
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Description / Objectifs</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Objectifs de la séance, exercices prévus..."
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" /> Participants *
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllParticipants}
                    disabled={!members.length}
                  >
                    Tout sélectionner
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectPlayersOnly}
                    disabled={!members.length}
                  >
                    Joueurs uniquement
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearParticipants}
                    disabled={!participantsCount}
                  >
                    Effacer
                  </Button>
                </div>
              </div>

              <div className="rounded-md border p-3 max-h-64 overflow-y-auto space-y-2">
                {isMembersLoading ? (
                  <p className="text-sm text-slate-500">Chargement des membres...</p>
                ) : members.length ? (
                  members.map((member) => {
                    const checked = participants?.includes(member.id) ?? false
                    return (
                      <label
                        key={member.id}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => handleParticipantToggle(member.id, value)}
                          />
                          <div>
                            <p className="font-medium text-slate-800">{member.nom}</p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        {member.profil_joueur?.dossard !== undefined && (
                          <span className="text-xs text-slate-500">#{member.profil_joueur.dossard}</span>
                        )}
                      </label>
                    )
                  })
                ) : (
                  <p className="text-sm text-slate-500">Aucun membre actif à proposer.</p>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>
                  {participantsCount}/{membersCount} sélectionnés
                </span>
                {!!participantsCount && (
                  <span>
                    {participantsCount === membersCount
                      ? 'Toute l’équipe est conviée.'
                      : 'Pensez à prévenir les absents.'}
                  </span>
                )}
              </div>
              {errors.participants && (
                <p className="text-sm text-red-600">{errors.participants.message}</p>
              )}
            </TabsContent>

            <TabsContent value="activities" className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Label className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-slate-500" /> Activités prévues
                </Label>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Durée cumulée : {totalActivitesDuration} min</span>
                  {Number.isFinite(dureeMinutes) && (
                    <span>Durée séance : {dureeMinutes} min</span>
                  )}
                  {remainingDuration !== null && (
                    <span>
                      {remainingDuration > 0
                        ? `Il reste ${remainingDuration} min à planifier`
                        : 'Planification complétée'}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendActivity({
                      type: 'ECHAUFFEMENT',
                      duree: 15,
                      intensite: 4,
                      objectif: '',
                    })
                  }
                >
                  Ajouter une activité
                </Button>
              </div>

              {activityFields.length ? (
                <div className="space-y-3">
                  {activityFields.map((field, index) => {
                    const activityError = errors.activites?.[index] as
                      | {
                          type?: { message?: string }
                          duree?: { message?: string }
                          intensite?: { message?: string }
                          objectif?: { message?: string }
                        }
                      | undefined

                    return (
                      <div key={field.id} className="rounded-md border p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-700">Activité {index + 1}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeActivity(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Controller
                            control={control}
                            name={`activites.${index}.type` as const}
                            render={({ field }) => (
                              <div className="space-y-2">
                                <Label>Type</Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {activityTypes.map((activity) => (
                                      <SelectItem key={activity.value} value={activity.value}>
                                        {activity.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          />
                          <div className="space-y-2">
                            <Label>Durée (min)</Label>
                            <Input
                              type="number"
                              min={1}
                              {...register(`activites.${index}.duree` as const, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Intensité (0-10)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={10}
                              step={0.5}
                              {...register(`activites.${index}.intensite` as const, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Objectif</Label>
                          <Textarea
                            rows={2}
                            {...register(`activites.${index}.objectif` as const)}
                            placeholder="Objectif ou consignes de l'activité"
                          />
                        </div>
                        {activityError && (
                          <div className="space-y-1 text-sm text-red-600">
                            {activityError.type?.message && <p>{activityError.type.message}</p>}
                            {activityError.duree?.message && <p>{activityError.duree.message}</p>}
                            {activityError.intensite?.message && <p>{activityError.intensite.message}</p>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Ajoutez des activités pour structurer la séance ou choisissez un modèle existant.
                </p>
              )}
            </TabsContent>
          </Tabs>
          </div>

          <DialogFooter className="border-t px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white">
            <div className="flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:gap-3">
              <span>
                Étape {currentTabIndex + 1} / {tabOrder.length}
              </span>
              <span>
                Participants : {participantsCount}/{membersCount}
              </span>
              <span>Activités : {activityFields.length}</span>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createSession.isPending}
                className="w-full sm:w-auto"
              >
                Annuler
              </Button>
              {!isFirstTab && (
                <Button type="button" variant="ghost" onClick={goToPreviousTab} className="w-full sm:w-auto">
                  Étape précédente
                </Button>
              )}
              {!isLastTab ? (
                <Button type="button" onClick={() => void goToNextTab()} className="w-full sm:w-auto">
                  Continuer
                </Button>
              ) : (
                <Button type="submit" disabled={createSession.isPending} className="w-full sm:w-auto">
                  {createSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer la séance
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}