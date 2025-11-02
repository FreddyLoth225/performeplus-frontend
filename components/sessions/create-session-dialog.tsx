'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { useCreateSession } from '@/lib/hooks/use-sessions'
import { useTeamStore } from '@/lib/store/team-store'
import { CalendarIcon, Loader2 } from 'lucide-react'
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

const sessionSchema = z.object({
  type: z.enum(['ENTRAINEMENT', 'MATCH', 'RECUPERATION', 'AUTRE']),
  dateDebut: z.date(),
  heureDebut: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format HH:MM'),
  duree: z.string().min(1, 'Durée requise'),
  lieu: z.string().optional(),
  description: z.string().optional(),
})

type SessionFormData = z.infer<typeof sessionSchema>

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

  const initialDate = useMemo(() => defaultDate || new Date(), [defaultDate])
  const defaultTime = useMemo(() => getDefaultTime(initialDate), [initialDate])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      type: 'ENTRAINEMENT',
      dateDebut: initialDate,
      heureDebut: defaultTime,
      duree: '90',
    },
  })

  const dateDebut = watch('dateDebut')
  const typeSeance = watch('type')

  const onSubmit = async (data: SessionFormData) => {
    if (!currentTeam) return

    // Combiner date + heure
    const [heures, minutes] = data.heureDebut.split(':').map(Number)
    const dateDebutISO = new Date(data.dateDebut)
    dateDebutISO.setHours(heures, minutes, 0, 0)

    // Calculer dateFin
    const dureeMinutes = parseInt(data.duree)
    if (Number.isNaN(dureeMinutes) || dureeMinutes <= 0) {
      toast.error('Veuillez saisir une durée valide.')
      return
    }
    const dateFinISO = new Date(dateDebutISO.getTime() + dureeMinutes * 60000)

    const now = new Date()
    if (dateDebutISO <= now) {
      toast.error('Merci de choisir une date et une heure futures.')
      return
    }

    await createSession.mutateAsync({
      equipe_id: currentTeam.id,
      type: data.type,
      dateDebut: dateDebutISO.toISOString(),
      dateFin: dateFinISO.toISOString(),
      lieu: data.lieu,
      description: data.description,
    })

    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer une séance</DialogTitle>
          <DialogDescription>
            Planifiez une nouvelle séance d'entraînement ou un match.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type de séance */}
          <div className="space-y-2">
            <Label htmlFor="type">Type de séance *</Label>
            <Select
              value={typeSeance}
              onValueChange={(value: any) => setValue('type', value)}
            >
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
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          {/* Date */}
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
            {errors.dateDebut && (
              <p className="text-sm text-red-600">{errors.dateDebut.message}</p>
            )}
          </div>

          {/* Heure et durée */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heureDebut">Heure de début *</Label>
              <Input
                id="heureDebut"
                type="time"
                {...register('heureDebut')}
                className="w-full"
              />
              {errors.heureDebut && (
                <p className="text-sm text-red-600">{errors.heureDebut.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duree">Durée (minutes) *</Label>
              <Input
                id="duree"
                type="number"
                min="15"
                step="15"
                {...register('duree')}
                placeholder="90"
              />
              {errors.duree && (
                <p className="text-sm text-red-600">{errors.duree.message}</p>
              )}
            </div>
          </div>

          {/* Lieu */}
          <div className="space-y-2">
            <Label htmlFor="lieu">Lieu</Label>
            <Input
              id="lieu"
              {...register('lieu')}
              placeholder="Stade municipal, Salle de sport..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description / Objectifs</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Objectifs de la séance, exercices prévus..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createSession.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createSession.isPending}>
              {createSession.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer la séance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}