'use client'

import { useTeamStore } from '@/lib/store/team-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, Calendar, TrendingUp, AlertCircle } from 'lucide-react'

export default function PlayerDashboard() {
  const { currentTeam, currentMembership } = useTeamStore()

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-600 mt-1">
          Bienvenue sur votre espace joueur - {currentTeam?.nom}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Indice de Forme
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--/28</div>
            <p className="text-xs text-slate-600 mt-1">
              Saisissez votre indice du jour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Séances (7j)
            </CardTitle>
            <Calendar className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-slate-600 mt-1">Aucune séance récente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Charge Totale
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 UA</div>
            <p className="text-xs text-slate-600 mt-1">Sur 7 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              RPE en attente
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-slate-600 mt-1">Aucune saisie en attente</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Accédez rapidement à vos fonctionnalités principales
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button className="h-24 flex flex-col gap-2" variant="outline">
            <Activity className="h-6 w-6" />
            <span>Saisir Indice de Forme</span>
          </Button>
          <Button className="h-24 flex flex-col gap-2" variant="outline">
            <AlertCircle className="h-6 w-6" />
            <span>Saisir RPE</span>
          </Button>
          <Button className="h-24 flex flex-col gap-2" variant="outline">
            <TrendingUp className="h-6 w-6" />
            <span>Mes Statistiques</span>
          </Button>
        </CardContent>
      </Card>

      {/* Prochaine séance */}
      <Card>
        <CardHeader>
          <CardTitle>Prochaine Séance</CardTitle>
          <CardDescription>Votre prochain entraînement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>Aucune séance planifiée</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}