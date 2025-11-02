'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { JoueurHistoriqueEntry } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  usePlayer,
  usePlayerStats,
  usePlayerIndicators,
  useUpdatePlayer,
  useArchivePlayer,
  useReactivatePlayer,
} from '@/lib/hooks/use-players'
import { Loader2, Archive, Undo2 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface PlayerDetailsDialogProps {
  playerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const posteLabels = {
  GARDIEN: 'Gardien',
  DEFENSEUR: 'Défenseur',
  MILIEU: 'Milieu',
  ATTAQUANT: 'Attaquant',
}

const piedFortLabels = {
  GAUCHE: 'Gauche',
  DROITE: 'Droite',
  AMBIDEXTRE: 'Ambidextre',
}

const PIED_FORT_NONE_VALUE = 'NONE_SELECTED'

const statutLabels = {
  ACTIF: 'Actif',
  BLESSE: 'Blessé',
  SUSPENDU: 'Suspendu',
  PRET: 'Prêt',
  DEPART: 'Départ',
}

const historyFieldLabels: Record<string, string> = {
  dateNaissance: 'Date de naissance',
  dossard: 'Dossard',
  poste: 'Poste',
  piedFort: 'Pied fort',
  poids: 'Poids',
  taille: 'Taille',
  nationalite: 'Nationalité',
  statut: 'Statut',
  archive: 'Archivage',
}

function formatHistoryTimestamp(value: string | Date | null | undefined): string {
  if (!value) return 'N/A'
  const date = typeof value === 'string' ? new Date(value) : value
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return typeof value === 'string' ? value : 'N/A'
  }
  try {
    return format(date, 'Pp', { locale: fr })
  } catch (error) {
    return typeof value === 'string' ? value : 'N/A'
  }
}

type PlayerFormValues = {
  dateNaissance: string
  dossard: string
  poste: keyof typeof posteLabels
  piedFort: '' | keyof typeof piedFortLabels
  poids: string
  taille: string
  nationalite: string
  statut: keyof typeof statutLabels
  commentaire: string
}

export function PlayerDetailsDialog({ playerId, open, onOpenChange }: PlayerDetailsDialogProps) {
  const { data: player, isLoading } = usePlayer(playerId)
  const { data: stats } = usePlayerStats(playerId, 30)
  const { data: indicators } = usePlayerIndicators(playerId)
  const updatePlayer = useUpdatePlayer()
  const archivePlayer = useArchivePlayer()
  const reactivatePlayer = useReactivatePlayer()
  const [isEditing, setIsEditing] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false)
  const [archiveMotif, setArchiveMotif] = useState('')
  const [reactivateComment, setReactivateComment] = useState('')

  const defaultValues = useMemo<PlayerFormValues>(() => {
    if (!player) {
      return {
        dateNaissance: '',
        dossard: '',
        poste: 'DEFENSEUR',
        piedFort: '',
        poids: '',
        taille: '',
        nationalite: '',
        statut: 'ACTIF',
        commentaire: '',
      }
    }
    return {
      dateNaissance: player.profil.dateNaissance.slice(0, 10),
      dossard: player.profil.dossard.toString(),
      poste: player.profil.poste,
      piedFort: (player.profil.piedFort as PlayerFormValues['piedFort']) || '',
      poids: (player.profil.poids ?? '').toString(),
      taille: (player.profil.taille ?? '').toString(),
      nationalite: player.profil.nationalite ?? '',
      statut: player.profil.statut,
      commentaire: '',
    }
  }, [player])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty, isSubmitting },
  } = useForm<PlayerFormValues>({
    defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const statsData = stats as any
  const indicatorsData = indicators as any
  const playerStats = useMemo(() => {
    if (!player) return null
    if (player.stats) return player.stats
    return {
      nombreSeances: player.statistiques?.seances_effectuees ?? 0,
      indicateurs: {
        rca: player.statistiques?.rca_moyen ?? 0,
        im: player.statistiques?.im_moyen ?? 0,
        ic: player.statistiques?.ic_moyen ?? 0,
      },
      indiceForme: {
        actuel: player.indice_forme_actuel?.score ?? null,
        date: player.indice_forme_actuel?.date ?? null,
        interpretation: player.indice_forme_actuel?.interpretation ?? null,
      },
    }
  }, [player])
  const currentFormScore = playerStats?.indiceForme?.actuel ?? null
  const nombreSeances = playerStats?.nombreSeances ?? 0
  const rca = playerStats?.indicateurs?.rca ?? 0
  const im = playerStats?.indicateurs?.im ?? 0
  const ic = playerStats?.indicateurs?.ic ?? 0
  const formeMoyenne = (() => {
    if (typeof statsData?.indice_forme_moyen === 'number') return statsData.indice_forme_moyen
    if (typeof statsData?.moyenne_indice_forme === 'number') return statsData.moyenne_indice_forme
    if (typeof statsData?.resume?.indice_forme_moyen === 'number') return statsData.resume.indice_forme_moyen
    return null
  })()
  const chargeMoyenne = typeof statsData?.charge_moyenne === 'number' ? statsData.charge_moyenne : null
  const chargeTotale = typeof statsData?.charge_totale === 'number' ? statsData.charge_totale : null
  const chargeAigue = typeof indicatorsData?.ca === 'number' ? indicatorsData.ca : null
  const chargeChronique = typeof indicatorsData?.cc === 'number' ? indicatorsData.cc : null

  const piedFortSelectValue = watch('piedFort') || PIED_FORT_NONE_VALUE

  const canModify = Boolean(player?.permissions?.canModify)
  const canArchive = Boolean(player?.permissions?.canArchive)
  const isArchived = Boolean(player?.membre?.archive)
  const historyEntries: JoueurHistoriqueEntry[] = player?.historique ?? []

  useEffect(() => {
    if (!open) {
      setIsEditing(false)
      setArchiveDialogOpen(false)
      setReactivateDialogOpen(false)
      setArchiveMotif('')
      setReactivateComment('')
    }
  }, [open])

  if (!open || !playerId) return null

  const onSubmit = handleSubmit(async (values) => {
    if (!player) return
    const commentaire = values.commentaire.trim()
    await updatePlayer.mutateAsync({
      profilId: player.id,
      data: {
        dateNaissance: values.dateNaissance,
        dossard: Number(values.dossard),
        poste: values.poste,
        piedFort: values.piedFort || undefined,
        poids: values.poids ? Number(values.poids) : undefined,
        taille: values.taille ? Number(values.taille) : undefined,
        nationalite: values.nationalite || undefined,
        statut: values.statut,
        commentaire: commentaire || undefined,
      },
    })
    setIsEditing(false)
    reset({ ...values, commentaire: '' })
  })

  const handleArchiveConfirm = async () => {
    if (!player) return
    try {
      const motif = archiveMotif.trim()
      await archivePlayer.mutateAsync({
        profilId: player.id,
        motif,
        commentaire: motif || undefined,
      })
      setArchiveMotif('')
      setArchiveDialogOpen(false)
    } catch (error) {
      // Toast handled by mutation onError
    }
  }

  const handleReactivateConfirm = async () => {
    if (!player) return
    try {
      const commentaire = reactivateComment.trim()
      await reactivatePlayer.mutateAsync({
        profilId: player.id,
        commentaire: commentaire || undefined,
      })
      setReactivateComment('')
      setReactivateDialogOpen(false)
    } catch (error) {
      // Toast handled by mutation onError
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <>
            <DialogHeader>
              <DialogTitle>Chargement du joueur</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </>
        ) : player ? (
          <>
            <DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={player.utilisateur.photo ?? undefined} />
                    <AvatarFallback className="bg-primary text-white text-xl">
                      {player.utilisateur.prenoms.charAt(0)}
                      {player.utilisateur.nom.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <DialogTitle className="text-2xl">
                        {player.utilisateur.prenoms} {player.utilisateur.nom}
                      </DialogTitle>
                      <div className="flex items-center gap-2">
                        {isArchived && (
                          <Badge variant="secondary">Archivé</Badge>
                        )}
                        {player.profil.statut !== 'ACTIF' && (
                          <Badge variant="secondary">
                            {statutLabels[player.profil.statut]}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DialogDescription asChild>
                      <div className="mt-2 space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <Badge variant="outline" className="text-base">
                            #{player.profil.dossard}
                          </Badge>
                          <span>{posteLabels[player.profil.poste]}</span>
                          {player.profil.nationalite && (
                            <>
                              <span>•</span>
                              <span>{player.profil.nationalite}</span>
                            </>
                          )}
                          {player.membre?.dateAdhesion && (
                            <>
                              <span>•</span>
                              <span>
                                Membre depuis{' '}
                                {format(new Date(player.membre.dateAdhesion), 'PPP', { locale: fr })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {canArchive && (
                    isArchived ? (
                      <Button
                        variant="outline"
                        onClick={() => setReactivateDialogOpen(true)}
                        disabled={reactivatePlayer.isPending}
                      >
                        {reactivatePlayer.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Undo2 className="mr-2 h-4 w-4" />
                        )}
                        Réactiver
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={() => setArchiveDialogOpen(true)}
                        disabled={archivePlayer.isPending}
                      >
                        {archivePlayer.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Archive className="mr-2 h-4 w-4" />
                        )}
                        Archiver
                      </Button>
                    )
                  )}
                  {canModify && (
                    <Button
                      variant={isEditing ? 'secondary' : 'outline'}
                      onClick={() => {
                        if (isEditing) {
                          reset(defaultValues)
                          setIsEditing(false)
                        } else {
                          setIsEditing(true)
                        }
                      }}
                    >
                      {isEditing ? 'Annuler' : 'Modifier le profil'}
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="stats">Statistiques</TabsTrigger>
                <TabsTrigger value="profile">Profil</TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Indicateurs clés */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Forme actuelle</div>
                      <div className="text-2xl font-bold">
                        {currentFormScore != null ? `${currentFormScore}/28` : '--/28'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Moy: {formeMoyenne != null ? formeMoyenne.toFixed(1) : '--'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">RCA</div>
                      <div className={cn(
                        'text-2xl font-bold',
                        rca > 1.8 ? 'text-red-600' : rca < 0.8 ? 'text-orange-600' : 'text-green-600'
                      )}>
                        {rca.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {rca > 1.8 ? 'Surcharge' :
                         rca < 0.8 ? 'Sous-charge' :
                         'Optimal'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Séances (7j)</div>
                      <div className="text-2xl font-bold">
                        {nombreSeances}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Charge moy: {chargeMoyenne != null ? Math.round(chargeMoyenne) : '--'} UA
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">IM</div>
                      <div className="text-2xl font-bold">
                        {im.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Monotonie
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Graphique d'évolution */}
                {stats && stats.evolution && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Évolution de la charge et de la forme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.evolution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                          />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip
                            labelFormatter={(date) => format(new Date(date), 'PPP', { locale: fr })}
                          />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="charge"
                            stroke="#3B82F6"
                            name="Charge (UA)"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="forme"
                            stroke="#10B981"
                            name="Forme (/28)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Statistiques */}
              <TabsContent value="stats" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Charge Aiguë (CA)</span>
                        <span className="font-medium">{chargeAigue != null ? Math.round(chargeAigue) : '--'} UA</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Charge Chronique (CC)</span>
                        <span className="font-medium">{chargeChronique != null ? Math.round(chargeChronique) : '--'} UA</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Indice de Contrainte (IC)</span>
                        <span className="font-medium">{ic.toFixed(0)} UA</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Charge totale (30j)</span>
                        <span className="font-medium">{chargeTotale != null ? Math.round(chargeTotale) : '--'} UA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profil */}
              <TabsContent value="profile" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {isEditing ? (
                      <form className="space-y-6" onSubmit={onSubmit}>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="dateNaissance">Date de naissance</Label>
                            <Input
                              id="dateNaissance"
                              type="date"
                              required
                              {...register('dateNaissance', { required: true })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dossard">Dossard</Label>
                            <Input
                              id="dossard"
                              type="number"
                              min={1}
                              max={99}
                              required
                              {...register('dossard', { required: true })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="poste">Poste</Label>
                            <Select
                              value={watch('poste')}
                              onValueChange={(value) =>
                                setValue('poste', value as PlayerFormValues['poste'], { shouldDirty: true })
                              }
                            >
                              <SelectTrigger id="poste">
                                <SelectValue placeholder="Sélectionnez un poste" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(posteLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="piedFort">Pied fort</Label>
                            <Select
                              value={piedFortSelectValue}
                              onValueChange={(value) =>
                                setValue(
                                  'piedFort',
                                  value === PIED_FORT_NONE_VALUE
                                    ? ''
                                    : (value as PlayerFormValues['piedFort']),
                                  { shouldDirty: true }
                                )
                              }
                            >
                              <SelectTrigger id="piedFort">
                                <SelectValue placeholder="Non renseigné" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={PIED_FORT_NONE_VALUE}>Non renseigné</SelectItem>
                                {Object.entries(piedFortLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="poids">Poids (kg)</Label>
                            <Input id="poids" type="number" min={30} max={200} {...register('poids')} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="taille">Taille (cm)</Label>
                            <Input id="taille" type="number" min={100} max={230} {...register('taille')} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="nationalite">Nationalité</Label>
                            <Input
                              id="nationalite"
                              placeholder="Pays de nationalité"
                              {...register('nationalite')}
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="statut">Statut</Label>
                            <Select
                              value={watch('statut')}
                              onValueChange={(value) =>
                                setValue('statut', value as PlayerFormValues['statut'], { shouldDirty: true })
                              }
                            >
                              <SelectTrigger id="statut">
                                <SelectValue placeholder="Sélectionnez un statut" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(statutLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
                          <Textarea
                            id="commentaire"
                            placeholder="Ajoutez un commentaire pour l'historique"
                            rows={3}
                            {...register('commentaire')}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              reset(defaultValues)
                              setIsEditing(false)
                            }}
                            disabled={isSubmitting}
                          >
                            Annuler
                          </Button>
                          <Button type="submit" disabled={!isDirty || isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Enregistrer
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase text-slate-500">
                            Date de naissance
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            {format(new Date(player.profil.dateNaissance), 'PPP', { locale: fr })}
                            {typeof player.profil.age === 'number' && (
                              <span className="ml-2 text-slate-500">({player.profil.age} ans)</span>
                            )}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase text-slate-500">Poste</p>
                          <p className="text-sm font-medium text-slate-900">
                            {posteLabels[player.profil.poste]}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase text-slate-500">Pied fort</p>
                          <p className="text-sm font-medium text-slate-900">
                            {player.profil.piedFort ? piedFortLabels[player.profil.piedFort] : 'N/A'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase text-slate-500">Statut</p>
                          <p className="text-sm font-medium text-slate-900">
                            {statutLabels[player.profil.statut]}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase text-slate-500">Poids</p>
                          <p className="text-sm font-medium text-slate-900">
                            {player.profil.poids ? `${player.profil.poids} kg` : 'N/A'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase text-slate-500">Taille</p>
                          <p className="text-sm font-medium text-slate-900">
                            {player.profil.taille ? `${player.profil.taille} cm` : 'N/A'}
                          </p>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <p className="text-xs font-semibold uppercase text-slate-500">Nationalité</p>
                          <p className="text-sm font-medium text-slate-900">
                            {player.profil.nationalite || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Historique des modifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {historyEntries.length > 0 ? (
                      historyEntries.map((entry) => (
                        <div key={entry.id} className="rounded-lg border border-slate-200 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                            <span className="font-medium text-slate-900">
                              {historyFieldLabels[entry.champModifie] || entry.champModifie}
                            </span>
                            <span className="text-slate-500">
                              {formatHistoryTimestamp(entry.dateChangement)}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-slate-600">
                            {entry.utilisateur
                              ? `${entry.utilisateur.prenoms} ${entry.utilisateur.nom}`
                              : 'Système'}
                          </div>
                          <div className="mt-3 grid gap-1 text-sm">
                            <div className="text-slate-600">
                              <span className="font-medium text-slate-700">Avant : </span>
                              {entry.ancienneValeur || 'N/A'}
                            </div>
                            <div className="text-slate-600">
                              <span className="font-medium text-slate-700">Après : </span>
                              {entry.nouvelleValeur || 'N/A'}
                            </div>
                          </div>
                          {entry.commentaire && (
                            <p className="mt-3 text-sm italic text-slate-500">
                              "{entry.commentaire}"
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600">Aucune modification enregistrée pour le moment.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Archiver ce joueur</AlertDialogTitle>
                  <AlertDialogDescription>
                    Le joueur ne pourra plus être sélectionné tant qu'il sera archivé. Un motif est requis et sera conservé dans l'historique.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3">
                  <Label htmlFor="archiveMotifDialog">Motif *</Label>
                  <Textarea
                    id="archiveMotifDialog"
                    value={archiveMotif}
                    onChange={(event) => setArchiveMotif(event.target.value)}
                    placeholder="Expliquez la raison de l'archivage"
                    rows={3}
                    disabled={archivePlayer.isPending}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={archivePlayer.isPending}>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(event) => {
                      event.preventDefault()
                      void handleArchiveConfirm()
                    }}
                    disabled={!archiveMotif.trim() || archivePlayer.isPending}
                  >
                    {archivePlayer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirmer l'archivage
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Réactiver ce joueur</AlertDialogTitle>
                  <AlertDialogDescription>
                    Le joueur réapparaîtra dans les listes actives. Vous pouvez ajouter un commentaire qui sera journalisé.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3">
                  <Label htmlFor="reactivateComment">Commentaire</Label>
                  <Textarea
                    id="reactivateComment"
                    value={reactivateComment}
                    onChange={(event) => setReactivateComment(event.target.value)}
                    placeholder="Ajoutez un commentaire (optionnel)"
                    rows={3}
                    disabled={reactivatePlayer.isPending}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={reactivatePlayer.isPending}>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(event) => {
                      event.preventDefault()
                      void handleReactivateConfirm()
                    }}
                    disabled={reactivatePlayer.isPending}
                  >
                    {reactivatePlayer.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Réactiver le joueur
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Joueur introuvable</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <p className="text-slate-600">Aucun profil disponible pour ce joueur.</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}