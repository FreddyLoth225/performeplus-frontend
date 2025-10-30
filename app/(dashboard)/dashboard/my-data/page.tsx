'use client'

import { useTeamStore } from '@/lib/store/team-store'
import { useIndiceForme, useRPE } from '@/lib/hooks/use-wellness'
import { IndiceFormeForm } from '@/components/player/indice-forme-form'
import { IndiceFormeChart } from '@/components/player/indice-forme-chart'
import { IndiceFormeDetails } from '@/components/player/indice-forme-details'
import { RPEPendingList } from '@/components/player/rpe-pending-list'

export default function MyDataPage() {
  const { currentTeam } = useTeamStore()
  const { history, isLoadingHistory } = useIndiceForme(currentTeam?.id)
  const { pending, isLoadingPending } = useRPE(currentTeam?.id)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Mes Données</h1>
        <p className="text-slate-600 mt-1">
          Saisissez et consultez vos données quotidiennes
        </p>
      </div>

      {/* Saisie RPE en attente (prioritaire) */}
      {pending && pending.length > 0 && (
        <RPEPendingList sessions={pending} isLoading={isLoadingPending} />
      )}

      {/* Saisie Indice de Forme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IndiceFormeForm />
        <IndiceFormeChart data={history || []} isLoading={isLoadingHistory} />
      </div>

      {/* Détails historique */}
      <IndiceFormeDetails data={history || []} isLoading={isLoadingHistory} />
    </div>
  )
}