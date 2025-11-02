'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  usePlayer,
  usePlayerStats,
  usePlayerIndicators,
  useUpdatePlayer,
  useArchivePlayer,
} from '@/lib/hooks/use-players'
import {
  Loader2,
  User,
  Calendar,
  Ruler,
  Weight,
  MapPin,
  Activity,
  TrendingUp,
  TrendingDown,
  Archive,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface PlayerDetailsDialogProps {
  playerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const posteLabels = {
  GARDIEN: 'Gardien',
  DEFENSEUR: 'Défenseur',
  MILIEU: 'Milieu',
  ATTAQUANT: 'Attaquant',
}

const piedFortLabels = {
  GAUCHE: 'Gauche',
  DROITE: 'Droite',
  AMBIDEXTRE: 'Ambidextre',
}

const statutLabels = {
  ACTIF: 'Actif',
  BLESSE: 'Blessé',
  SUSPENDU: 'Suspendu',
  PRET: 'Prêt',
  DEPART: 'Départ',
}

export function PlayerDetailsDialog({ playerId, open, onOpenChange }: PlayerDetailsDialogProps) {
  const { data: player, isLoading } = usePlayer(playerId)
  const { data: stats } = usePlayerStats(playerId, 30)
  const { data: indicators } = usePlayerIndicators(playerId)
  const updatePlayer = useUpdatePlayer()
  const archivePlayer = useArchivePlayer()
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  if (!open || !playerId) return null

  const handleArchive = async () => {
    if (!player) return
    // Trouver le membre_id (à adapter selon votre structure)
    // await archivePlayer.mutateAsync(player.membre_id)
    onOpenChange(false)
  }

  const statsData = stats as any
  const indicatorsData = indicators as any
  const currentFormScore = player?.stats.indiceForme.actuel ?? player?.indice_forme_actuel?.score ?? null
  const formeMoyenne = (() => {
    if (typeof statsData?.indice_forme_moyen === 'number') return statsData.indice_forme_moyen
    if (typeof statsData?.moyenne_indice_forme === 'number') return statsData.moyenne_indice_forme
    if (typeof statsData?.resume?.indice_forme_moyen === 'number') return statsData.resume.indice_forme_moyen
    return null
  })()
  const chargeMoyenne = typeof statsData?.charge_moyenne === 'number' ? statsData.charge_moyenne : null
  const chargeTotale = typeof statsData?.charge_totale === 'number' ? statsData.charge_totale : null
  const chargeAigue = typeof indicatorsData?.ca === 'number' ? indicatorsData.ca : null
  const chargeChronique = typeof indicatorsData?.cc === 'number' ? indicatorsData.cc : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : player ? (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={player.utilisateur.photo ?? undefined} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {player.utilisateur.prenoms.charAt(0)}
                    {player.utilisateur.nom.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <DialogTitle className="text-2xl">
                    {player.utilisateur.prenoms} {player.utilisateur.nom}
                  </DialogTitle>
                  <DialogDescription className="mt-2 space-y-1">
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline" className="text-base">
                        #{player.profil.dossard}
                      </Badge>
                      <span>{posteLabels[player.profil.poste]}</span>
                      {player.profil.nationalite && (
                        <>
                          <span>•</span>
                          <span>{player.profil.nationalite}</span>
                        </>
                      )}
                    </div>
                  </DialogDescription>
                </div>
                <Badge
                  variant={player.profil.statut === 'ACTIF' ? 'default' : 'secondary'}
                >
                  {statutLabels[player.profil.statut]}
                </Badge>
              </div>
            </DialogHeader>

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="stats">Statistiques</TabsTrigger>
                <TabsTrigger value="profile">Profil</TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Indicateurs clés */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Forme actuelle</div>
                      <div className="text-2xl font-bold">
                        {currentFormScore != null ? `${currentFormScore}/28` : '--/28'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Moy: {formeMoyenne != null ? formeMoyenne.toFixed(1) : '--'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">RCA</div>
                      <div className={cn(
                        'text-2xl font-bold',
                        player.stats.indicateurs.rca > 1.8 ? 'text-red-600' :
                        player.stats.indicateurs.rca < 0.8 ? 'text-orange-600' :
                        'text-green-600'
                      )}>
                        {player.stats.indicateurs.rca.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {player.stats.indicateurs.rca > 1.8 ? 'Surcharge' :
                         player.stats.indicateurs.rca < 0.8 ? 'Sous-charge' :
                         'Optimal'}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">Séances (7j)</div>
                      <div className="text-2xl font-bold">
                        {player.stats.nombreSeances}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Charge moy: {chargeMoyenne != null ? Math.round(chargeMoyenne) : '--'} UA
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-slate-600 mb-1">IM</div>
                      <div className="text-2xl font-bold">
                        {player.stats.indicateurs.im.toFixed(2)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Monotonie
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Graphique d'évolution */}
                {stats && stats.evolution && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Évolution de la charge et de la forme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.evolution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                          />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip
                            labelFormatter={(date) => format(new Date(date), 'PPP', { locale: fr })}
                          />
                          <Legend />
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="charge"
                            stroke="#3B82F6"
                            name="Charge (UA)"
                          />
                          <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="forme"
                            stroke="#10B981"
                            name="Forme (/28)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Statistiques */}
              <TabsContent value="stats" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Charge Aiguë (CA)</span>
                        <span className="font-medium">{chargeAigue != null ? Math.round(chargeAigue) : '--'} UA</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Charge Chronique (CC)</span>
                        <span className="font-medium">{chargeChronique != null ? Math.round(chargeChronique) : '--'} UA</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Indice de Contrainte (IC)</span>
                        <span className="font-medium">{player.stats.indicateurs.ic.toFixed(0)} UA</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Charge totale (30j)</span>
                        <span className="font-medium">{chargeTotale != null ? Math.round(chargeTotale) : '--'} UA</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profil */}
              <TabsContent value="profile" className="space-y-4 mt-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-500" />
                      <div>
                        <p className="text-sm text-slate-600">Date de naissance</p>
                        <p className="font-medium">
                          {format(new Date(player.profil.dateNaissance), 'PPP', { locale: fr })}
                        </p>
                      </div>
                    </div>

                    {player.profil.piedFort && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-600">Pied fort</p>
                            <p className="font-medium">{piedFortLabels[player.profil.piedFort]}</p>
                          </div>
                        </div>
                      </>
                    )}

                    {player.profil.poids && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <Weight className="h-5 w-5 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-600">Poids</p>
                            <p className="font-medium">{player.profil.poids} kg</p>
                          </div>
                        </div>
                      </>
                    )}

                    {player.profil.taille && (
                      <>
                        <Separator />
                        <div className="flex items-center gap-3">
                          <Ruler className="h-5 w-5 text-slate-500" />
                          <div>
                            <p className="text-sm text-slate-600">Taille</p>
                            <p className="font-medium">{player.profil.taille} cm</p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-2">
                  {player.profil.statut === 'ACTIF' && (
                    <Button
                      variant="outline"
                      onClick={handleArchive}
                      disabled={archivePlayer.isPending}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archiver
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-600">Joueur introuvable</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}