'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RPEForm } from './rpe-form'

interface RPEPendingListProps {
  sessions: any[]
  isLoading?: boolean
}

export function RPEPendingList({ sessions, isLoading }: RPEPendingListProps) {
  const [selectedSession, setSelectedSession] = useState<any>(null)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Saisies RPE en Attente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500 text-sm sm:text-base">Chargement...</p>
        </CardContent>
      </Card>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Saisies RPE en Attente</CardTitle>
          <CardDescription className="text-sm">Séances nécessitant votre évaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8 text-slate-500">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-green-500" />
            <p className="font-medium text-sm sm:text-base">Aucune saisie en attente</p>
            <p className="text-xs sm:text-sm mt-1">Toutes vos séances sont à jour !</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">Saisies RPE en Attente</CardTitle>
              <CardDescription className="text-sm">
                {sessions.length} séance{sessions.length > 1 ? 's' : ''} en attente
              </CardDescription>
            </div>
            <Badge variant="destructive" className="text-sm sm:text-base px-2.5 sm:px-3 py-1 w-fit">
              {sessions.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => {
              // Le backend renvoie 'date' pour les RPE pending, 'dateDebut' pour les séances normales
              const sessionDate = session.date || session.dateDebut
              
              if (!sessionDate) {
                console.error('Session sans date:', session)
                return null
              }

              return (
                <div
                  key={session.id || session.seance_id}
                  className="p-3 sm:p-4 border border-orange-200 bg-orange-50 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="bg-white text-xs sm:text-sm">
                          {session.type || 'Entraînement'}
                        </Badge>
                        <h4 className="font-medium text-sm sm:text-base">
                          {format(new Date(sessionDate), 'EEEE dd MMMM', { locale: fr })}
                        </h4>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span>{format(new Date(sessionDate), 'HH:mm')}</span>
                        </div>
                        {session.lieu && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="line-clamp-1">{session.lieu}</span>
                          </div>
                        )}
                      </div>

                      {session.description && (
                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                          {session.description}
                        </p>
                      )}
                    </div>

                    <Button 
                      onClick={() => setSelectedSession(session)}
                      className="shrink-0 h-9 sm:h-10 text-sm sm:text-base px-3 sm:px-4"
                    >
                      Saisir RPE
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour la saisie RPE */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Saisir votre RPE</DialogTitle>
            <DialogDescription className="text-sm">
              Évaluez votre perception de l'effort pour cette séance
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <RPEForm 
              session={selectedSession}
              onSuccess={() => setSelectedSession(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}