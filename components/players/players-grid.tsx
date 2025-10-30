'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Activity, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react'
import { JoueurStats } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PlayersGridProps {
  players: JoueurStats[]
  onSelectPlayer: (playerId: string) => void
}

const posteLabels = {
  GARDIEN: 'G',
  DEFENSEUR: 'D',
  MILIEU: 'M',
  ATTAQUANT: 'A',
}

const posteColors = {
  GARDIEN: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  DEFENSEUR: 'bg-blue-100 text-blue-700 border-blue-200',
  MILIEU: 'bg-green-100 text-green-700 border-green-200',
  ATTAQUANT: 'bg-red-100 text-red-700 border-red-200',
}

const statutLabels = {
  ACTIF: 'Actif',
  BLESSE: 'Blessé',
  SUSPENDU: 'Suspendu',
  PRET: 'Prêt',
  DEPART: 'Départ',
}

const getRCAStatus = (rca: number) => {
  if (rca < 0.8) return { label: 'Sous-charge', color: 'text-orange-600', icon: TrendingDown }
  if (rca > 1.8) return { label: 'Surcharge', color: 'text-red-600', icon: TrendingUp }
  return { label: 'Optimal', color: 'text-green-600', icon: Minus }
}

export function PlayersGrid({ players, onSelectPlayer }: PlayersGridProps) {
  if (players.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-96 text-center">
          <Users className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Aucun joueur
          </h3>
          <p className="text-slate-600">
            Commencez par inviter vos premiers joueurs
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {players.map((player) => {
        const initials = `${player.utilisateur.prenoms.charAt(0)}${player.utilisateur.nom.charAt(0)}`.toUpperCase()
        const rcaStatus = getRCAStatus(player.stats.indicateurs.rca)
        const RCAIcon = rcaStatus.icon

        return (
          <Card
            key={player.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelectPlayer(player.id)}
          >
            <CardContent className="p-6 space-y-4">
              {/* Header - Avatar + Infos */}
              <div className="flex items-start gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={player.utilisateur.photo} />
                  <AvatarFallback className="bg-primary text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {player.utilisateur.prenoms} {player.utilisateur.nom}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className={cn('text-xs', posteColors[player.profil.poste])}
                    >
                      {posteLabels[player.profil.poste]}
                    </Badge>
                    <span className="text-sm text-slate-600">
                      #{player.profil.dossard}
                    </span>
                  </div>
                </div>
              </div>

              {/* Indicateurs */}
              <div className="space-y-2">
                {/* Indice de forme */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Forme</span>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-slate-400" />
                    <span className="font-medium">
                      {player.stats.indiceForme.actuel || '-'}/28
                    </span>
                  </div>
                </div>

                {/* RCA */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">RCA</span>
                  <div className={cn('flex items-center gap-1', rcaStatus.color)}>
                    <RCAIcon className="h-3 w-3" />
                    <span className="font-medium">
                      {player.stats.indicateurs.rca.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Nombre de séances */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Séances (7j)</span>
                  <span className="font-medium">
                    {player.stats.nombreSeances}
                  </span>
                </div>
              </div>

              {/* Statut */}
              {player.profil.statut !== 'ACTIF' && (
                <Badge variant="secondary" className="w-full justify-center">
                  {statutLabels[player.profil.statut]}
                </Badge>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}