'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreatePlayer } from '@/lib/hooks/use-players'
import { useTeamStore } from '@/lib/store/team-store'
import { Loader2 } from 'lucide-react'

const playerSchema = z.object({
  email: z.string().email('Email invalide'),
  nom: z.string().min(2, 'Nom requis'),
  prenoms: z.string().min(2, 'Prénom requis'),
  dateNaissance: z.string().min(1, 'Date de naissance requise'),
  dossard: z.string().min(1, 'Dossard requis'),
  poste: z.enum(['GARDIEN', 'DEFENSEUR', 'MILIEU', 'ATTAQUANT']),
  piedFort: z.enum(['GAUCHE', 'DROITE', 'AMBIDEXTRE']).optional(),
  poids: z.string().optional(),
  taille: z.string().optional(),
  nationalite: z.string().optional(),
})

type PlayerFormData = z.infer<typeof playerSchema>

interface InvitePlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvitePlayerDialog({ open, onOpenChange }: InvitePlayerDialogProps) {
  const { currentTeam } = useTeamStore()
  const createPlayer = useCreatePlayer()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      poste: 'DEFENSEUR',
    },
  })

  const poste = watch('poste')
  const piedFort = watch('piedFort')

  const onSubmit = async (data: PlayerFormData) => {
    if (!currentTeam) return

    await createPlayer.mutateAsync({
      equipe_id: currentTeam.id,
      email: data.email,
      nom: data.nom,
      prenoms: data.prenoms,
      dateNaissance: data.dateNaissance,
      dossard: parseInt(data.dossard),
      poste: data.poste,
      piedFort: data.piedFort,
      poids: data.poids ? parseFloat(data.poids) : undefined,
      taille: data.taille ? parseInt(data.taille) : undefined,
      nationalite: data.nationalite,
    })

    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inviter un joueur</DialogTitle>
          <DialogDescription>
            Le joueur recevra un email d'invitation pour rejoindre l'équipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Informations de contact */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-slate-700">Informations de contact</h3>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="joueur@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input id="nom" {...register('nom')} />
                {errors.nom && (
                  <p className="text-sm text-red-600">{errors.nom.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prenoms">Prénoms *</Label>
                <Input id="prenoms" {...register('prenoms')} />
                {errors.prenoms && (
                  <p className="text-sm text-red-600">{errors.prenoms.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informations sportives */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-slate-700">Informations sportives</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dossard">Dossard *</Label>
                <Input
                  id="dossard"
                  type="number"
                  min="1"
                  max="99"
                  {...register('dossard')}
                />
                {errors.dossard && (
                  <p className="text-sm text-red-600">{errors.dossard.message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="poste">Poste *</Label>
                <Select value={poste} onValueChange={(value: any) => setValue('poste', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GARDIEN">Gardien</SelectItem>
                    <SelectItem value="DEFENSEUR">Défenseur</SelectItem>
                    <SelectItem value="MILIEU">Milieu</SelectItem>
                    <SelectItem value="ATTAQUANT">Attaquant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateNaissance">Date de naissance *</Label>
              <Input
                id="dateNaissance"
                type="date"
                {...register('dateNaissance')}
              />
              {errors.dateNaissance && (
                <p className="text-sm text-red-600">{errors.dateNaissance.message}</p>
              )}
            </div>
          </div>

          {/* Informations physiques */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-slate-700">Informations physiques (optionnel)</h3>

            <div className="space-y-2">
              <Label htmlFor="piedFort">Pied fort</Label>
              <Select
                value={piedFort}
                onValueChange={(value: any) => setValue('piedFort', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GAUCHE">Gauche</SelectItem>
                  <SelectItem value="DROITE">Droite</SelectItem>
                  <SelectItem value="AMBIDEXTRE">Ambidextre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poids">Poids (kg)</Label>
                <Input
                  id="poids"
                  type="number"
                  step="0.1"
                  {...register('poids')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taille">Taille (cm)</Label>
                <Input
                  id="taille"
                  type="number"
                  {...register('taille')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationalite">Nationalité</Label>
                <Input id="nationalite" {...register('nationalite')} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createPlayer.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={createPlayer.isPending}>
              {createPlayer.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Envoyer l'invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}