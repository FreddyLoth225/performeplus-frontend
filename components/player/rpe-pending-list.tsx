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
          <CardTitle>Saisies RPE en Attente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Chargement...</p>
        </CardContent>
      </Card>
    )
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Saisies RPE en Attente</CardTitle>
          <CardDescription>Séances nécessitant votre évaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p className="font-medium">Aucune saisie en attente</p>
            <p className="text-sm mt-1">Toutes vos séances sont à jour !</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Saisies RPE en Attente</CardTitle>
              <CardDescription>
                {sessions.length} séance{sessions.length > 1 ? 's' : ''} en attente
              </CardDescription>
            </div>
            <Badge variant="destructive" className="text-base px-3 py-1">
              {sessions.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 border border-orange-200 bg-orange-50 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white">
                        {session.type || 'Entraînement'}
                      </Badge>
                      <h4 className="font-medium">
                        {format(new Date(session.dateDebut), 'EEEE dd MMMM', { locale: fr })}
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(session.dateDebut), 'HH:mm')}</span>
                      </div>
                      {session.lieu && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{session.lieu}</span>
                        </div>
                      )}
                    </div>

                    {session.description && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {session.description}
                      </p>
                    )}
                  </div>

                  <Button 
                    onClick={() => setSelectedSession(session)}
                    className="shrink-0"
                  >
                    Saisir RPE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog pour la saisie RPE */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Saisir votre RPE</DialogTitle>
            <DialogDescription>
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