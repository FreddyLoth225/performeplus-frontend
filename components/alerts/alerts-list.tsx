'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Info, ChevronRight, User } from 'lucide-react'
import { Alerte } from '@/lib/api/alert.service'
import { cn } from '@/lib/utils'

interface AlertsListProps {
  alerts: Alerte[]
  onSelectAlert: (alerteId: string) => void
}

const niveauConfig = {
  CRITIQUE: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
  },
  ATTENTION: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  INFO: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
  },
}

const typeLabels: Record<string, string> = {
  SURCHARGE: 'Surcharge',
  SOUS_CHARGE: 'Sous-charge',
  MONOTONIE: 'Monotonie',
  INDICE_FORME_BAS: 'Forme basse',
  INDICE_FORME_TRES_BAS: 'Forme très basse',
  SAISIE_MANQUANTE_RPE: 'RPE manquant',
  SAISIE_MANQUANTE_FORME: 'Indice de forme manquant',
}

export function AlertsList({ alerts, onSelectAlert }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-96 text-center">
          <Info className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Aucune alerte
          </h3>
          <p className="text-slate-600">
            Tout va bien ! Aucune anomalie détectée.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const config = niveauConfig[alert.niveau]
        const Icon = config.icon

        return (
          <Card
            key={alert.id}
            className={cn(
              'hover:shadow-md transition-shadow cursor-pointer border-l-4',
              config.borderColor,
              !alert.lue && 'bg-slate-50'
            )}
            onClick={() => onSelectAlert(alert.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bgColor)}>
                  <Icon className={cn('h-5 w-5', config.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className={config.badgeClass}>
                      {typeLabels[alert.type]}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(alert.dateCreation), 'PPp', { locale: fr })}
                    </span>
                    {!alert.lue && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>

                  <p className="text-sm text-slate-900 font-medium mb-1">
                    {alert.message}
                  </p>

                  {alert.joueur_nom && (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <User className="h-3 w-3" />
                      {alert.joueur_nom}
                    </div>
                  )}
                </div>

                <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}