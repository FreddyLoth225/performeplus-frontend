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
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Séances</h1>
          <p className="text-slate-600 mt-1">
            Gérez toutes vos séances d'entraînement et matchs
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle séance
        </Button>
      </div>

      {/* Filtres */}
      <SessionsFilters filters={filters} onFiltersChange={setFilters} />

      {/* Tabs par statut */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="PLANIFIEE">Planifiées</TabsTrigger>
          <TabsTrigger value="TERMINEE">Terminées</TabsTrigger>
          <TabsTrigger value="ANNULEE">Annulées</TabsTrigger>
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