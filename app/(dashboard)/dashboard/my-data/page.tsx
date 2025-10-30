'use client'

import { IndiceFormeForm } from '@/components/player/indice-forme-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

export default function MyDataPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mes Données</h1>
        <p className="text-slate-600 mt-1">
          Saisissez vos données quotidiennes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indice de Forme */}
        <div>
          <IndiceFormeForm />
        </div>

        {/* Historique (à venir) */}
        <Card>
          <CardHeader>
            <CardTitle>Historique (7 derniers jours)</CardTitle>
            <CardDescription>Évolution de votre indice de forme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Graphique à venir</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RPE en attente */}
      <Card>
        <CardHeader>
          <CardTitle>Saisies RPE en Attente</CardTitle>
          <CardDescription>Séances nécessitant votre évaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>Aucune saisie en attente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}