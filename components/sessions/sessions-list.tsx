'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Clock, ChevronRight, Activity } from 'lucide-react'
import { Seance, StatutSeance } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SessionsListProps {
  sessions: Seance[]
  onSelectSession: (seanceId: string) => void
}

const statutConfig = {
  PLANIFIEE: {
    label: 'Planifiée',
    variant: 'default' as const,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  EN_COURS: {
    label: 'En cours',
    variant: 'secondary' as const,
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  TERMINEE: {
    label: 'Terminée',
    variant: 'outline' as const,
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  ANNULEE: {
    label: 'Annulée',
    variant: 'destructive' as const,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
}

const typeConfig = {
  ENTRAINEMENT: { label: 'Entraînement', icon: Activity },
  MATCH: { label: 'Match', icon: Activity },
  RECUPERATION: { label: 'Récupération', icon: Activity },
  AUTRE: { label: 'Autre', icon: Activity },
}

export function SessionsList({ sessions, onSelectSession }: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-96 text-center">
          <Calendar className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Aucune séance
          </h3>
          <p className="text-slate-600">
            Créez votre première séance pour commencer
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const statutInfo = statutConfig[session.statut]
        const typeInfo = typeConfig[session.type]
        const TypeIcon = typeInfo.icon

        return (
          <Card
            key={session.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectSession(session.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TypeIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {typeInfo.label}
                        </h3>
                        <Badge
                          variant="outline"
                          className={statutInfo.className}
                        >
                          {statutInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {format(new Date(session.dateDebut), 'PPP', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {format(new Date(session.dateDebut), 'HH:mm')}
                      {session.dateFin && (
                        <span> - {format(new Date(session.dateFin), 'HH:mm')}</span>
                      )}
                    </div>
                    {session.lieu && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {session.lieu}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {session.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {session.description}
                    </p>
                  )}
                </div>

                {/* Action */}
                <Button variant="ghost" size="icon" className="ml-4">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}