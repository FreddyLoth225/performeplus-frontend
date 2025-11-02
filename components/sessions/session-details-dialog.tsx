'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSession, useUpdateSession, useDeleteSession, useDuplicateSession } from '@/lib/hooks/use-sessions'
import { Loader2, Calendar, MapPin, Clock, Trash2, Copy, X, Timer, Gauge, Users, List } from 'lucide-react'
import { useState } from 'react'
import { DuplicateSeancePayload, ForceUpdateError } from '@/lib/api/session.service'

interface SessionDetailsDialogProps {
  seanceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statutConfig = {
  PLANIFIEE: { label: 'Planifiée', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  EN_COURS: { label: 'En cours', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  TERMINEE: { label: 'Terminée', className: 'bg-green-50 text-green-700 border-green-200' },
  ANNULEE: { label: 'Annulée', className: 'bg-red-50 text-red-700 border-red-200' },
}

const typeLabels = {
  ENTRAINEMENT: 'Entraînement',
  MATCH: 'Match',
  RECUPERATION: 'Récupération',
  AUTRE: 'Autre',
}

export function SessionDetailsDialog({ seanceId, open, onOpenChange }: SessionDetailsDialogProps) {
  const { data: session, isLoading } = useSession(seanceId)
  const updateSession = useUpdateSession()
  const deleteSession = useDeleteSession()
  const duplicateSession = useDuplicateSession()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    if (!seanceId) return
    await deleteSession.mutateAsync(seanceId)
    setDeleteDialogOpen(false)
    onOpenChange(false)
  }

  const handleDuplicate = async () => {
    if (!session) return
    // Dupliquer pour demain à la même heure
    const newStart = new Date(session.dateDebut)
    newStart.setDate(newStart.getDate() + 1)
    const payload: DuplicateSeancePayload = {
      dateDebut: newStart.toISOString(),
    }
    if (session.dateFin) {
      const durationMs = new Date(session.dateFin).getTime() - new Date(session.dateDebut).getTime()
      const newEnd = new Date(newStart.getTime() + durationMs)
      payload.dateFin = newEnd.toISOString()
    }
    await duplicateSession.mutateAsync({
      seanceId: session.id,
      payload,
    })
    onOpenChange(false)
  }

  const handleCancel = async () => {
    if (!session) return
    const motif = window.prompt('Motif de l’annulation (optionnel) ?') || undefined

    try {
      await updateSession.mutateAsync({
        seanceId: session.id,
        data: { statut: 'ANNULEE', motifAnnulation: motif },
      })
    } catch (error) {
      if (error instanceof ForceUpdateError) {
        const shouldForce = window.confirm(
          `${error.message}\nSouhaitez-vous forcer la mise à jour malgré les RPE saisis ?`
        )
        if (shouldForce) {
          await updateSession.mutateAsync({
            seanceId: session.id,
            data: { statut: 'ANNULEE', motifAnnulation: motif },
            forceUpdate: true,
          })
        }
      }
    }
  }

  if (!open || !seanceId) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : session ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <DialogTitle className="text-2xl">
                      {typeLabels[session.type]}
                    </DialogTitle>
                    <DialogDescription>
                      {format(new Date(session.dateDebut), 'PPP', { locale: fr })}
                    </DialogDescription>
                  </div>
                  <Badge variant="outline" className={statutConfig[session.statut].className}>
                    {statutConfig[session.statut].label}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Informations principales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium">Horaire</p>
                      <p className="text-slate-600">
                        {format(new Date(session.dateDebut), 'HH:mm')}
                        {session.dateFin && (
                          <> - {format(new Date(session.dateFin), 'HH:mm')}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {session.dureePrevue && (
                    <div className="flex items-center gap-3 text-sm">
                      <Timer className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="font-medium">Durée prévue</p>
                        <p className="text-slate-600">{session.dureePrevue} minutes</p>
                      </div>
                    </div>
                  )}

                  {typeof session.intensitePrevue === 'number' && (
                    <div className="flex items-center gap-3 text-sm">
                      <Gauge className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="font-medium">Intensité prévue</p>
                        <p className="text-slate-600">{session.intensitePrevue} / 10</p>
                      </div>
                    </div>
                  )}

                  {session.lieu && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="font-medium">Lieu</p>
                        <p className="text-slate-600">{session.lieu}</p>
                      </div>
                    </div>
                  )}

                  {session.description && (
                    <>
                      <Separator />
                      <div>
                        <p className="font-medium mb-2">Description</p>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">
                          {session.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <Separator />

                {session.participants && session.participants.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Users className="h-4 w-4" />
                      Participants ({session.participants.length})
                    </div>
                    <div className="space-y-2">
                      {session.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between rounded-md border p-2 text-sm text-slate-600"
                        >
                          <div>
                            <p className="font-medium text-slate-800">
                              {participant.prenoms} {participant.nom}
                            </p>
                            <p className="text-xs text-slate-500">{participant.email}</p>
                          </div>
                          {participant.present && (
                            <span className="text-xs font-medium text-green-600">Présent</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {session.activites && session.activites.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <List className="h-4 w-4" />
                      Activités prévues
                    </div>
                    <div className="space-y-2">
                      {session.activites.map((activite) => (
                        <div key={`${activite.ordre}-${activite.type}`} className="rounded-md border p-3">
                          <div className="flex items-center justify-between text-sm text-slate-700">
                            <span className="font-medium">
                              {activite.ordre ? `${activite.ordre}. ` : ''}
                              {activite.type}
                            </span>
                            <span className="text-xs text-slate-500">
                              {activite.duree ? `${activite.duree} min` : 'Durée N/C'}
                              {typeof activite.intensite === 'number'
                                ? ` • Intensité ${activite.intensite}`
                                : ''}
                            </span>
                          </div>
                          {activite.objectif && (
                            <p className="mt-2 text-sm text-slate-600">{activite.objectif}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(session.participants?.length || session.activites?.length) && <Separator />}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicate}
                    disabled={duplicateSession.isPending}
                  >
                    {duplicateSession.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    Dupliquer
                  </Button>

                  {session.statut === 'PLANIFIEE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      disabled={updateSession.isPending}
                    >
                      {updateSession.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Annuler la séance
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="ml-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-600">Séance introuvable</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette séance ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteSession.isPending}
            >
              {deleteSession.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}