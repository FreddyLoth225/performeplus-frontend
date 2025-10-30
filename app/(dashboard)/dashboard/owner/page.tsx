'use client'

import { useTeamStore } from '@/lib/store/team-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Bell, Settings, TrendingUp, Plus, Shield } from 'lucide-react'

export default function OwnerDashboard() {
  const { currentTeam } = useTeamStore()

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Tableau de bord Propriétaire
          </h1>
          <p className="text-slate-600 mt-1">{currentTeam?.nom}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Séance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Joueurs
            </CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-slate-600 mt-1">0 staff</p>
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
              Alertes
            </CardTitle>
            <Bell className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">0</div>
            <p className="text-xs text-slate-600 mt-1">En attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Charge Équipe
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 UA</div>
            <p className="text-xs text-slate-600 mt-1">Sur 7 jours</p>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Abonnement
            </CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Gratuit</div>
            <p className="text-xs text-slate-600 mt-1">Actif</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gestion Équipe */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gestion de l'Équipe</CardTitle>
            <CardDescription>Vue d'ensemble et actions rapides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <Users className="h-6 w-6" />
                <span>Inviter Joueurs</span>
              </Button>
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <Shield className="h-6 w-6" />
                <span>Inviter Staff</span>
              </Button>
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <Calendar className="h-6 w-6" />
                <span>Planifier Séance</span>
              </Button>
              <Button className="h-20 flex flex-col gap-2" variant="outline">
                <Settings className="h-6 w-6" />
                <span>Configurer Seuils</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-sm">Aucune activité récente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertes Critiques</CardTitle>
            <CardDescription>Nécessitent votre attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Aucune alerte critique</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prochaines Échéances</CardTitle>
            <CardDescription>Séances et événements à venir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Aucune échéance</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}