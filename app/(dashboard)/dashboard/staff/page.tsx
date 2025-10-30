'use client'

import { useTeamStore } from '@/lib/store/team-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Bell, TrendingUp, Plus } from 'lucide-react'

export default function StaffDashboard() {
  const { currentTeam } = useTeamStore()

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de bord Staff</h1>
          <p className="text-slate-600 mt-1">{currentTeam?.nom}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Séance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Joueurs Actifs
            </CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-success mt-1">Tous disponibles</p>
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
            <p className="text-xs text-slate-600 mt-1">Cette semaine</p>
          </CardContent>
        </Card>

        <Card className="border-warning">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Alertes Actives
            </CardTitle>
            <Bell className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">0</div>
            <p className="text-xs text-slate-600 mt-1">Aucune alerte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Charge Moyenne
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 UA</div>
            <p className="text-xs text-slate-600 mt-1">Par joueur (7j)</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alertes Récentes</CardTitle>
            <CardDescription>Surveillez l'état de vos joueurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Aucune alerte pour le moment</p>
              <p className="text-sm mt-2">Les alertes apparaîtront ici automatiquement</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Planifier Séance
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Voir Joueurs
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Voir Alertes
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Générer Rapport
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Prochaines Séances */}
      <Card>
        <CardHeader>
          <CardTitle>Séances à Venir</CardTitle>
          <CardDescription>Planning de la semaine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>Aucune séance planifiée</p>
            <Button className="mt-4" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Créer une séance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}