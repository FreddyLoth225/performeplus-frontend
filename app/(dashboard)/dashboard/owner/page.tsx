'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { addDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTeamStore } from '@/lib/store/team-store'
import { useDashboardStaff } from '@/lib/hooks/use-dashboard'
import { useSessions } from '@/lib/hooks/use-sessions'
import { InvitePlayerDialog } from '@/components/players/invite-player-dialog'
import { CreateSessionDialog } from '@/components/sessions/create-session-dialog'
import { TeamCharts } from '@/components/player/team-charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Bell, Settings, TrendingUp, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function OwnerDashboard() {
  const { currentTeam } = useTeamStore()
  const { data: dashboard } = useDashboardStaff(currentTeam?.id)
  const router = useRouter()
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [createSessionDialogOpen, setCreateSessionDialogOpen] = useState(false)

  const ensureTeamSelected = () => {
    if (!currentTeam?.id) {
      toast.error('Veuillez sélectionner une équipe pour continuer.')
      return false
    }
    return true
  }
  const sessionFilters = useMemo(() => {
    if (!currentTeam?.id) return undefined
    const now = new Date()
    return {
      date_debut: now.toISOString(),
      date_fin: addDays(now, 14).toISOString(),
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
  const alertesTotal =
    typeof dashboard?.alertes.total === 'number'
      ? dashboard.alertes.total
      : null
  const tauxRPE =
    typeof dashboard?.kpis.taux_saisie_rpe === 'number'
      ? Math.round(dashboard.kpis.taux_saisie_rpe)
      : null
  const tauxIndice =
    typeof dashboard?.kpis.taux_saisie_indice === 'number'
      ? Math.round(dashboard.kpis.taux_saisie_indice)
      : null
  const chargeTotale =
    typeof dashboard?.kpis.charge_totale_periode === 'number'
      ? Math.round(dashboard.kpis.charge_totale_periode)
      : null

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
          <Button
            variant="outline"
            onClick={() => {
              if (!ensureTeamSelected()) return
              router.push('/dashboard/settings')
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </Button>
          <Button
            onClick={() => {
              if (!ensureTeamSelected()) return
              setCreateSessionDialogOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Séance
          </Button>
        </div>
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
            <div className="text-2xl font-bold">
              {joueursActifs != null ? joueursActifs : '--'}
            </div>
            <p className="text-xs text-slate-600 mt-1">Dans l'équipe</p>
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
              {typeof dashboard?.kpis.seances_semaine === 'number'
                ? dashboard.kpis.seances_semaine
                : '--'}
            </div>
            <p className="text-xs text-slate-600 mt-1">Activité hebdomadaire</p>
          </CardContent>
        </Card>

        <Card className={alertesTotal ? 'border-warning' : ''}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Alertes
            </CardTitle>
            <Bell className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {alertesTotal != null ? alertesTotal : '--'}
            </div>
            <p className="text-xs text-slate-600 mt-1">Alertes actives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Taux de saisie RPE
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tauxRPE != null ? `${tauxRPE}%` : '--'}
            </div>
            <p className="text-xs text-slate-600 mt-1">Derniers 7 jours</p>
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
              <Button
                className="h-20 flex flex-col gap-2"
                variant="outline"
                onClick={() => {
                  if (!ensureTeamSelected()) return
                  setInviteDialogOpen(true)
                }}
              >
                <Users className="h-6 w-6" />
                <span>Inviter Joueurs</span>
              </Button>
              <Button
                className="h-20 flex flex-col gap-2"
                variant="outline"
                onClick={() => {
                  if (!ensureTeamSelected()) return
                  setCreateSessionDialogOpen(true)
                }}
              >
                <Calendar className="h-6 w-6" />
                <span>Planifier Séance</span>
              </Button>
              <Button
                className="h-20 flex flex-col gap-2"
                variant="outline"
                onClick={() => {
                  if (!ensureTeamSelected()) return
                  router.push('/dashboard/players')
                }}
              >
                <Users className="h-6 w-6" />
                <span>Voir Joueurs</span>
              </Button>
              <Button
                className="h-20 flex flex-col gap-2"
                variant="outline"
                onClick={() => {
                  if (!ensureTeamSelected()) return
                  router.push('/dashboard/settings?tab=thresholds')
                }}
              >
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
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Charge totale (7j)</span>
              <span className="font-medium">
                {chargeTotale != null ? `${chargeTotale} UA` : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Taux saisie indice</span>
              <span className="font-medium">
                {tauxIndice != null ? `${tauxIndice}%` : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Alertes critiques</span>
              <span className="font-medium">
                {typeof dashboard?.alertes.critiques === 'number'
                  ? dashboard.alertes.critiques
                  : '--'}
              </span>
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
            {urgentAlerts.length > 0 ? (
              <div className="space-y-4">
                {urgentAlerts.map((alerte) => (
                  <div key={alerte.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">
                        {alerte.message}
                      </p>
                      <span className="text-xs uppercase text-warning">
                        {alerte.niveau}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center justify-between mt-1">
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
                <p>Aucune alerte critique</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prochaines Échéances</CardTitle>
            <CardDescription>Séances et événements à venir</CardDescription>
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
                          {format(new Date(seance.dateDebut), 'PPP p', {
                            locale: fr,
                          })}
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
                <p>Aucune échéance</p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => {
                    if (!ensureTeamSelected()) return
                    setCreateSessionDialogOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une séance
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Graphiques Équipe */}
      {dashboard?.graphiques && (
        <TeamCharts
          chargeEquipeData={dashboard.graphiques.charge_equipe || []}
          distributionRpe={dashboard.graphiques.distribution_rpe || {}}
          indiceFormeMoyenData={dashboard.graphiques.indice_forme_moyen || []}
        />
      )}

      <InvitePlayerDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <CreateSessionDialog
        open={createSessionDialogOpen}
        onOpenChange={setCreateSessionDialogOpen}
      />
    </div>
  )
}