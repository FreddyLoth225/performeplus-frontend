'use client'

import { useState } from 'react'
import { useAlerts } from '@/lib/hooks/use-alerts'
import { useTeamStore } from '@/lib/store/team-store'
import { AlertsList } from '@/components/alerts/alerts-list'
import { AlertDetailsDialog } from '@/components/alerts/alert-details-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, AlertCircle, Info } from 'lucide-react'

export default function AlertsPage() {
  const { currentTeam } = useTeamStore()
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null)

  const { data: allAlerts, isLoading } = useAlerts({
    equipe_id: currentTeam?.id || '',
    non_traitees: true,
  })

  const criticalAlerts = allAlerts?.filter((a) => a.niveau === 'CRITIQUE') || []
  const warningAlerts = allAlerts?.filter((a) => a.niveau === 'ATTENTION') || []
  const infoAlerts = allAlerts?.filter((a) => a.niveau === 'INFO') || []

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Alertes</h1>
          <p className="text-slate-600 mt-1">
            Surveillez les anomalies et agissez rapidement
          </p>
        </div>
        {allAlerts && allAlerts.length > 0 && (
          <div className="flex gap-2">
            <Badge variant="destructive" className="text-base">
              {allAlerts.length} alerte(s) active(s)
            </Badge>
          </div>
        )}
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{criticalAlerts.length}</p>
              <p className="text-sm text-slate-600">Critiques</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{warningAlerts.length}</p>
              <p className="text-sm text-slate-600">Attention</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{infoAlerts.length}</p>
              <p className="text-sm text-slate-600">Informations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs par niveau */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Toutes ({allAlerts?.length || 0})</TabsTrigger>
          <TabsTrigger value="CRITIQUE">Critiques ({criticalAlerts.length})</TabsTrigger>
          <TabsTrigger value="ATTENTION">Attention ({warningAlerts.length})</TabsTrigger>
          <TabsTrigger value="INFO">Info ({infoAlerts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <AlertsList alerts={allAlerts || []} onSelectAlert={setSelectedAlertId} />
          )}
        </TabsContent>

        <TabsContent value="CRITIQUE">
          <AlertsList alerts={criticalAlerts} onSelectAlert={setSelectedAlertId} />
        </TabsContent>

        <TabsContent value="ATTENTION">
          <AlertsList alerts={warningAlerts} onSelectAlert={setSelectedAlertId} />
        </TabsContent>

        <TabsContent value="INFO">
          <AlertsList alerts={infoAlerts} onSelectAlert={setSelectedAlertId} />
        </TabsContent>
      </Tabs>

      {/* Dialog détails */}
      <AlertDetailsDialog
        alerteId={selectedAlertId}
        open={!!selectedAlertId}
        onOpenChange={(open) => !open && setSelectedAlertId(null)}
      />
    </div>
  )
}