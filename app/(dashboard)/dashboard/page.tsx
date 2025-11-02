// app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { useTeamStore } from '@/lib/store/team-store'
import { useTeams } from '@/lib/hooks/use-teams'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Users } from 'lucide-react'
import { RoleEquipe } from '@/lib/types'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentTeam, currentMembership, setCurrentTeam, clearTeam, setTeams } = useTeamStore()
  const { data: teams, isLoading, isError } = useTeams()

  // Synchroniser l'état des équipes avec le store et gérer la sélection
  useEffect(() => {
    if (!teams) return

    setTeams(teams.map((team) => team.equipe))

    if (teams.length === 0) {
      clearTeam()
      return
    }

    const matchingEntry = currentTeam
      ? teams.find((team) => team.equipe.id === currentTeam.id)
      : null

    if (!matchingEntry) {
      setCurrentTeam(teams[0].equipe, teams[0].membership)
      return
    }

    const membershipChanged =
      currentMembership?.id !== matchingEntry.membership.id ||
      currentMembership?.role !== matchingEntry.membership.role

    if (membershipChanged) {
      setCurrentTeam(matchingEntry.equipe, matchingEntry.membership)
    }
  }, [teams, currentTeam, currentMembership, setCurrentTeam, setTeams, clearTeam])

  // Rediriger selon le rôle une fois que l'équipe est sélectionnée
  useEffect(() => {
    if (currentMembership && !isLoading) {
      console.log('🔀 Redirection selon le rôle:', currentMembership.role)
      
      const redirectPath = {
        [RoleEquipe.PLAYER]: '/dashboard/player',
        [RoleEquipe.STAFF]: '/dashboard/staff',
        [RoleEquipe.OWNER]: '/dashboard/owner',
      }[currentMembership.role]

      if (redirectPath) {
        router.push(redirectPath)
      }
    }
  }, [currentMembership, router, isLoading])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-slate-600">Chargement de vos équipes...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Erreur</CardTitle>
            <CardDescription>
              Impossible de charger vos équipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Aucune équipe
  if (!teams || teams.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen p-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-slate-600" />
            </div>
            <CardTitle>Bienvenue sur PerformePLUS !</CardTitle>
            <CardDescription>
              Vous n'appartenez à aucune équipe pour le moment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-slate-600">
              <p className="mb-2">Pour commencer :</p>
              <ul className="space-y-2 text-left">
                <li>• Demandez à un administrateur de vous inviter</li>
                <li>• Ou créez votre propre équipe</li>
              </ul>
            </div>
            <Button className="w-full" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Créer une équipe
            </Button>
            <p className="text-xs text-center text-slate-500">
              La création d'équipe nécessite une activation par notre support
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Afficher un loader pendant la redirection
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-slate-600">Redirection vers votre espace...</p>
    </div>
  )
}