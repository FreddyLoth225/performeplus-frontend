'use client'

import { useState } from 'react'
import { useSessions } from '@/lib/hooks/use-sessions'
import { useTeamStore } from '@/lib/store/team-store'
import { SessionsList } from '@/components/sessions/sessions-list'
import { SessionsFilters } from '@/components/sessions/sessions-filters'
import { CreateSessionDialog } from '@/components/sessions/create-session-dialog'
import { SessionDetailsDialog } from '@/components/sessions/session-details-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Loader2 } from 'lucide-react'
import { StatutSeance } from '@/lib/types'

export default function SessionsPage() {
  const { currentTeam } = useTeamStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [filters, setFilters] = useState<{
    date_debut?: string
    date_fin?: string
    statut?: StatutSeance
  }>({})

  const { data: sessions, isLoading } = useSessions(
    currentTeam?.id || '',
    filters
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Séances</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Gérez toutes vos séances d'entraînement et matchs
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle séance
        </Button>
      </div>

      {/* Filtres */}
      <SessionsFilters filters={filters} onFiltersChange={setFilters} />

      {/* Tabs par statut */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 sm:w-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">Toutes</TabsTrigger>
          <TabsTrigger value="PLANIFIEE" className="text-xs sm:text-sm">Planifiées</TabsTrigger>
          <TabsTrigger value="TERMINEE" className="text-xs sm:text-sm">Terminées</TabsTrigger>
          <TabsTrigger value="ANNULEE" className="text-xs sm:text-sm">Annulées</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <SessionsList
              sessions={sessions || []}
              onSelectSession={setSelectedSessionId}
            />
          )}
        </TabsContent>

        <TabsContent value="PLANIFIEE" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <SessionsList
              sessions={sessions?.filter((s) => s.statut === 'PLANIFIEE') || []}
              onSelectSession={setSelectedSessionId}
            />
          )}
        </TabsContent>

        <TabsContent value="TERMINEE" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <SessionsList
              sessions={sessions?.filter((s) => s.statut === 'TERMINEE') || []}
              onSelectSession={setSelectedSessionId}
            />
          )}
        </TabsContent>

        <TabsContent value="ANNULEE" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <SessionsList
              sessions={sessions?.filter((s) => s.statut === 'ANNULEE') || []}
              onSelectSession={setSelectedSessionId}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateSessionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <SessionDetailsDialog
        seanceId={selectedSessionId}
        open={!!selectedSessionId}
        onOpenChange={(open) => !open && setSelectedSessionId(null)}
      />
    </div>
  )
}