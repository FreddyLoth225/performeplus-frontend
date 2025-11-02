'use client'

import { useMemo } from 'react'
import { addDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTeamStore } from '@/lib/store/team-store'
import { useDashboardStaff } from '@/lib/hooks/use-dashboard'
import { useSessions } from '@/lib/hooks/use-sessions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Bell, TrendingUp, Plus, Loader2 } from 'lucide-react'

export default function StaffDashboard() {
  const { currentTeam } = useTeamStore()
  const { data: dashboard, isLoading } = useDashboardStaff(currentTeam?.id)
  const sessionFilters = useMemo(() => {
    if (!currentTeam?.id) return undefined
    const now = new Date()
    return {
      date_debut: now.toISOString(),
      date_fin: addDays(now, 7).toISOString(),
    }
  }, [currentTeam?.id])
  const { data: upcomingSessions, isLoading: isLoadingSessions } = useSessions(
    currentTeam?.id || '',
    sessionFilters
  )

  const sessions = useMemo(() => {
    if (!upcomingSessions) return []
    return [...upcomingSessions]
      .filter((seance) => new Date(seance.dateDebut) >= new Date())
      .sort(
        (a, b) =>
          new Date(a.dateDebut).getTime() - new Date(b.dateDebut).getTime()
      )
      .slice(0, 5)
  }, [upcomingSessions])

  const urgentAlerts = dashboard?.alertes.alertes_urgentes || []
  const joueursActifs =
    typeof dashboard?.equipe.joueurs_actifs === 'number'
      ? dashboard.equipe.joueurs_actifs
      : null
  const seancesSemaine =
    typeof dashboard?.kpis.seances_semaine === 'number'
      ? dashboard.kpis.seances_semaine
      : null
  const chargeTotale =
    typeof dashboard?.kpis.charge_totale_periode === 'number'
      ? Math.round(dashboard.kpis.charge_totale_periode)
      : null
  const alertesTotal =
    typeof dashboard?.alertes.total === 'number'
      ? dashboard.alertes.total
      : null
  const alertesCritiques =
    typeof dashboard?.alertes.critiques === 'number'
      ? dashboard.alertes.critiques
      : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tableau de bord Staff</h1>
          <p className="text-slate-600 mt-1">{currentTeam?.nom}</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Séance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Joueurs Actifs
            </CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {joueursActifs != null ? joueursActifs : '--'}
            </div>
            <p className="text-xs text-success mt-1">Dans l'équipe</p>
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
            <div className="text-2xl font-bold">
              {seancesSemaine != null ? seancesSemaine : '--'}
            </div>
            <p className="text-xs text-slate-600 mt-1">Cette semaine</p>
          </CardContent>
        </Card>

        <Card className={alertesTotal ? 'border-warning' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Alertes Actives
            </CardTitle>
            <Bell className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {alertesTotal != null ? alertesTotal : '--'}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {alertesCritiques
                ? `${alertesCritiques} critique(s)`
                : 'Aucune alerte'}
            </p>
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
            <div className="text-2xl font-bold">
              {chargeTotale != null ? `${chargeTotale} UA` : '--'}
            </div>
            <p className="text-xs text-slate-600 mt-1">Sur la période</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Alertes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Alertes Récentes</CardTitle>
            <CardDescription>Surveillez l'état de vos joueurs</CardDescription>
          </CardHeader>
          <CardContent>
            {urgentAlerts.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {urgentAlerts.map((alerte) => (
                  <div
                    key={alerte.id}
                    className="border rounded-lg p-3 sm:p-4 flex flex-col gap-1"
                  >
                    <div className="flex items-start sm:items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {alerte.message}
                      </span>
                      <span className="text-xs uppercase text-warning">
                        {alerte.niveau}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between">
                      <span>{alerte.joueur || 'Équipe entière'}</span>
                      <span>
                        {format(new Date(alerte.date), 'PPP p', { locale: fr })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Aucune alerte pour le moment</p>
                <p className="text-sm mt-2">
                  Les alertes apparaîtront ici automatiquement
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <Button className="w-full justify-start h-11" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Planifier Séance
            </Button>
            <Button className="w-full justify-start h-11" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Voir Joueurs
            </Button>
            <Button className="w-full justify-start h-11" variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Voir Alertes
            </Button>
            <Button className="w-full justify-start h-11" variant="outline">
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
          {isLoadingSessions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((seance) => (
                <div key={seance.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{seance.type}</p>
                      <p className="text-sm text-slate-600">
                        {format(new Date(seance.dateDebut), 'PPP p', { locale: fr })}
                      </p>
                    </div>
                    <span className="text-sm text-slate-500">
                      {seance.lieu || 'Lieu à confirmer'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p>Aucune séance planifiée</p>
              <Button className="mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Créer une séance
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}