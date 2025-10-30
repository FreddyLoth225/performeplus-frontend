'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IndiceForme } from '@/lib/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Moon, Zap, Dumbbell, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IndiceFormeDetailsProps {
  data: IndiceForme[]
  isLoading?: boolean
}

export function IndiceFormeDetails({ data, isLoading }: IndiceFormeDetailsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Détails des Saisies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Chargement...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Détails des Saisies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score < 15) return 'text-red-600'
    if (score < 21) return 'text-orange-600'
    return 'text-green-600'
  }

  const getValueColor = (value: number, max: number = 7) => {
    const percentage = (value / max) * 100
    if (percentage < 40) return 'text-red-600'
    if (percentage < 70) return 'text-orange-600'
    return 'text-green-600'
  }

  // Trier par date décroissante (plus récent en premier)
  const sortedData = [...data].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails des Saisies</CardTitle>
        <CardDescription>Historique détaillé de vos indices de forme</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.map((item, index) => (
            <div 
              key={item.id} 
              className={cn(
                "p-4 border rounded-lg",
                index === 0 && "border-primary bg-primary/5"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium capitalize">
                    {format(new Date(item.date), 'EEEE dd MMMM yyyy', { locale: fr })}
                  </p>
                  {index === 0 && (
                    <span className="text-xs text-primary font-medium">Aujourd'hui</span>
                  )}
                </div>
                <div className="text-right">
                  <p className={cn('text-2xl font-bold', getScoreColor(item.scorTotal))}>
                    {item.scorTotal}/28
                  </p>
                  <p className="text-xs text-slate-600">{item.interpretation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Sommeil</p>
                    <p className={cn('font-bold', getValueColor(item.sommeil))}>
                      {item.sommeil}/7
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Énergie</p>
                    <p className={cn('font-bold', getValueColor(item.fatigue))}>
                      {item.fatigue}/7
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-rose-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Courbatures</p>
                    <p className={cn('font-bold', getValueColor(item.courbatures))}>
                      {item.courbatures}/7
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Stress</p>
                    <p className={cn('font-bold', getValueColor(item.stress))}>
                      {item.stress}/7
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}