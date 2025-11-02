'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTeamStore } from '@/lib/store/team-store'
import { useDashboardJoueur } from '@/lib/hooks/use-dashboard'
import { PlayerCharts } from '@/components/player/player-charts'
import { CorrelationChart } from '@/components/player/correlation-chart'
import { PeriodSelector } from '@/components/player/period-selector'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, Calendar, TrendingUp, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PlayerDashboard() {
  const router = useRouter()
  const { currentTeam } = useTeamStore()
  const [selectedPeriod, setSelectedPeriod] = useState(7)
  const { data: dashboard, isLoading } = useDashboardJoueur(currentTeam?.id, selectedPeriod)

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score < 15) return 'text-red-600'
    if (score < 21) return 'text-orange-600'
    return 'text-green-600'
  }

  const getScoreLabel = (score?: number) => {
    if (!score) return 'Non saisi'
    if (score < 12) return 'Très mauvais'
    if (score < 15) return 'Mauvais'
    if (score < 21) return 'Moyen'
    if (score < 25) return 'Bon'
    return 'Excellent'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const chargeTotale =
    typeof dashboard?.statistiques_periode.charge_totale === 'number'
      ? Math.round(dashboard.statistiques_periode.charge_totale)
      : null
  const chargeMoyenne =
    typeof dashboard?.statistiques_periode.charge_moyenne === 'number'
      ? dashboard.statistiques_periode.charge_moyenne
      : null
  const seancesSansRpe =
    typeof dashboard?.seances_sans_rpe === 'number'
      ? dashboard.seances_sans_rpe
      : null
  const upcomingSessions = (dashboard?.prochaines_seances || []).slice(0, 3)
  const indiceFormeMoyen = dashboard?.statistiques_periode.indice_forme_moyen

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-600 mt-1">
          Bienvenue sur votre espace joueur - {currentTeam?.nom}
        </p>
      </div>

      {/* Rappel de saisie */}
      {dashboard?.rappel_saisie_forme && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">
                N'oubliez pas de saisir votre indice de forme du jour
              </p>
              <Button 
                variant="link" 
                className="h-auto p-0 text-orange-700"
                onClick={() => router.push('/dashboard/my-data')}
              >
                Saisir maintenant →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {dashboard?.seances_sans_rpe && dashboard.seances_sans_rpe > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">
                Vous avez {dashboard.seances_sans_rpe} séance(s) en attente de saisie RPE
              </p>
              <Button 
                variant="link" 
                className="h-auto p-0 text-blue-700"
                onClick={() => router.push('/dashboard/my-data')}
              >
                Saisir maintenant →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/dashboard/my-data')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Indice de Forme
            </CardTitle>
            <Activity className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', getScoreColor(dashboard?.indice_forme_jour?.score))}>
              {dashboard?.indice_forme_jour?.score ? `${dashboard.indice_forme_jour.score}/28` : '--/28'}
            </div>
            <p className={cn('text-xs mt-1', getScoreColor(dashboard?.indice_forme_jour?.score))}>
              {dashboard?.indice_forme_jour?.interpretation.message || 'Non saisi'}
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
            <div className="text-2xl font-bold">{dashboard?.statistiques_periode.nombre_seances || 0}</div>
            <p className="text-xs text-slate-600 mt-1">
              {dashboard?.statistiques_periode.nombre_seances 
                ? `Charge moyenne: ${chargeMoyenne != null ? Math.round(chargeMoyenne) : '--'} UA`
                : 'Aucune séance récente'}
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
            <p className="text-xs text-slate-600 mt-1">
              {indiceFormeMoyen ? `Forme moyenne: ${indiceFormeMoyen}/28` : 'Sur 7 derniers jours'}
            </p>
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
            <div className="text-2xl font-bold">
              {seancesSansRpe != null ? seancesSansRpe : '--'}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {dashboard?.seances_sans_rpe ? 'Saisies en attente' : 'Aucune saisie en attente'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dernière Séance + Prochaine Séance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dernière séance effectuée */}
        <Card>
          <CardHeader>
            <CardTitle>Dernière Séance Effectuée</CardTitle>
            <CardDescription>Votre dernier entraînement</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboard?.derniere_seance ? (
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-900">{dashboard.derniere_seance.type}</p>
                  {dashboard.derniere_seance.rpe_saisi ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      RPE: {dashboard.derniere_seance.rpe}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      RPE non saisi
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  {format(new Date(dashboard.derniere_seance.date), 'PPP p', { locale: fr })}
                </p>
                {!dashboard.derniere_seance.rpe_saisi && (
                  <Button 
                    variant="link" 
                    size="sm"
                    className="h-auto p-0 text-primary"
                    onClick={() => router.push('/dashboard/my-data')}
                  >
                    Saisir le RPE maintenant →
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Aucune séance effectuée récemment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prochaine séance */}
        <Card>
          <CardHeader>
            <CardTitle>Prochaine Séance</CardTitle>
            <CardDescription>Votre prochain entraînement</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingSessions.length > 0 ? (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{upcomingSessions[0].type}</p>
                    <p className="text-sm text-slate-600">
                      {format(new Date(upcomingSessions[0].date), 'PPP p', { locale: fr })}
                    </p>
                  </div>
                  <span className="text-sm text-slate-500">
                    {upcomingSessions[0].lieu || 'Lieu à confirmer'}
                  </span>
                </div>
                {upcomingSessions[0].description && (
                  <p className="text-xs text-slate-600 mt-2">
                    {upcomingSessions[0].description}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Aucune séance planifiée</p>
              </div>
            )}
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
          <Button 
            className="h-24 flex flex-col gap-2" 
            variant="outline"
            onClick={() => router.push('/dashboard/my-data')}
          >
            <Activity className="h-6 w-6" />
            <span>Saisir Indice de Forme</span>
            <ArrowRight className="h-4 w-4 absolute bottom-2 right-2 opacity-50" />
          </Button>
          <Button 
            className="h-24 flex flex-col gap-2" 
            variant="outline"
            onClick={() => router.push('/dashboard/my-data')}
          >
            <AlertCircle className="h-6 w-6" />
            <span>Saisir RPE</span>
            <ArrowRight className="h-4 w-4 absolute bottom-2 right-2 opacity-50" />
          </Button>
          <Button 
            className="h-24 flex flex-col gap-2" 
            variant="outline"
            onClick={() => router.push('/dashboard/calendar')}
          >
            <Calendar className="h-6 w-6" />
            <span>Voir Calendrier</span>
            <ArrowRight className="h-4 w-4 absolute bottom-2 right-2 opacity-50" />
          </Button>
        </CardContent>
      </Card>

      {/* Mes Statistiques */}
      {dashboard?.statistiques_periode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes Statistiques</CardTitle>
                <CardDescription>Vue d'ensemble de vos performances</CardDescription>
              </div>
              <PeriodSelector 
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Séances</p>
                <p className="text-2xl font-bold text-slate-900">
                  {dashboard.statistiques_periode.nombre_seances}
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Charge Totale</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(dashboard.statistiques_periode.charge_totale)} <span className="text-sm">UA</span>
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Charge Moyenne</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(dashboard.statistiques_periode.charge_moyenne)} <span className="text-sm">UA</span>
                </p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Forme Moyenne</p>
                <p className="text-2xl font-bold text-slate-900">
                  {indiceFormeMoyen ? `${indiceFormeMoyen}/28` : '--'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Graphiques Évolution */}
      {dashboard?.graphiques && (
        <>
          <PlayerCharts
            chargeData={dashboard.graphiques.evolution_charge || []}
            indiceFormeData={dashboard.graphiques.evolution_indice_forme || []}
            isLoading={isLoading}
          />
          
          {/* Graphique de corrélation */}
          <CorrelationChart
            chargeData={dashboard.graphiques.evolution_charge || []}
            indiceFormeData={dashboard.graphiques.evolution_indice_forme || []}
          />
        </>
      )}
    </div>
  )
}