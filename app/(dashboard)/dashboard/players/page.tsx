'use client'

import { useState } from 'react'
import { usePlayers } from '@/lib/hooks/use-players'
import { useTeamStore } from '@/lib/store/team-store'
import { PlayersGrid } from '@/components/players/players-grid'
import { PlayerDetailsDialog } from '@/components/players/player-details-dialog'
import { InvitePlayerDialog } from '@/components/players/invite-player-dialog'
import { ImportPlayersDialog } from '@/components/players/import-players-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Loader2, Search, Upload, MoreVertical } from 'lucide-react'

export default function PlayersPage() {
  const { currentTeam } = useTeamStore()
  const { data: players, isLoading } = usePlayers(currentTeam?.id || '')
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrer les joueurs par recherche
  const filteredPlayers = players?.filter((player) => {
    const fullName = `${player.utilisateur.prenoms} ${player.utilisateur.nom}`.toLowerCase()
    const dossard = player.profil.dossard.toString()
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      dossard.includes(searchQuery)
    )
  })

  // Séparer actifs et archivés
  const activePlayers = filteredPlayers?.filter((p) => p.profil.statut === 'ACTIF') || []
  const archivedPlayers = filteredPlayers?.filter((p) => p.profil.statut !== 'ACTIF') || []

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Joueurs</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            Gérez vos joueurs et suivez leurs performances
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Ajouter des joueurs</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setInviteDialogOpen(true)}>
                Inviter un joueur
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import en masse (CSV/Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher par nom ou dossard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Actifs/Archivés */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="active" className="flex-1 sm:flex-none">
            Actifs ({activePlayers.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex-1 sm:flex-none">
            Archivés ({archivedPlayers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <PlayersGrid
              players={activePlayers}
              onSelectPlayer={setSelectedPlayerId}
            />
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </CardContent>
            </Card>
          ) : (
            <PlayersGrid
              players={archivedPlayers}
              onSelectPlayer={setSelectedPlayerId}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <InvitePlayerDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      <ImportPlayersDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />

      <PlayerDetailsDialog
        playerId={selectedPlayerId}
        open={!!selectedPlayerId}
        onOpenChange={(open) => !open && setSelectedPlayerId(null)}
      />
    </div>
  )
}