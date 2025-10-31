'use client'

import { useRouter } from 'next/navigation'
import { useTeamStore } from '@/lib/store/team-store'
import { useDashboardJoueur } from '@/lib/hooks/use-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, Calendar, TrendingUp, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PlayerDashboard() {
  const router = useRouter()
  const { currentTeam } = useTeamStore()
  const { data: dashboard, isLoading } = useDashboardJoueur(currentTeam?.id)

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
                ? `Charge moyenne: ${dashboard.statistiques_periode.charge_moyenne.toFixed(0)}`
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
            <div className="text-2xl font-bold">{dashboard?.statistiques_periode.charge_totale.toFixed(0) || 0} UA</div>
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
            <div className="text-2xl font-bold">{dashboard?.seances_sans_rpe || 0}</div>
            <p className="text-xs text-slate-600 mt-1">
              {dashboard?.seances_sans_rpe ? 'Saisies en attente' : 'Aucune saisie en attente'}
            </p>
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
          <Button className="h-24 flex flex-col gap-2" variant="outline" disabled>
            <AlertCircle className="h-6 w-6" />
            <span>Saisir RPE</span>
          </Button>
          <Button className="h-24 flex flex-col gap-2" variant="outline" disabled>
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