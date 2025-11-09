'use client'

import { useState } from 'react'
import { useTeamStore } from '@/lib/store/team-store'
import { useTeamDetails } from '@/lib/hooks/use-teams'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Users,
  AlertTriangle,
  Bell,
  Shield,
  FileText,
  Save,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { currentTeam } = useTeamStore()
  const { data: teamDetails, isLoading } = useTeamDetails(currentTeam?.id)
  const [isSaving, setIsSaving] = useState(false)

  // États pour les différents paramètres
  const [teamInfo, setTeamInfo] = useState({
    nom: currentTeam?.nom || '',
    sport: currentTeam?.sport || '',
    pays: currentTeam?.pays || '',
  })

  const [thresholds, setThresholds] = useState({
    rpe_critique: 9,
    rpe_warning: 7,
    charge_critique: 5000,
    charge_warning: 4000,
    acwr_critique: 1.5,
    acwr_warning: 1.3,
    monotonie_critique: 2.5,
    monotonie_warning: 2.0,
  })

  const [notifications, setNotifications] = useState({
    alertes_email: true,
    alertes_push: false,
    rappels_saisie: true,
    rapports_hebdo: true,
  })

  const handleSaveTeamInfo = async () => {
    setIsSaving(true)
    try {
      // TODO: Implémenter l'appel API pour mettre à jour les infos de l'équipe
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Informations de l\'équipe mises à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveThresholds = async () => {
    setIsSaving(true)
    try {
      // TODO: Implémenter l'appel API pour mettre à jour les seuils
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Seuils personnalisés sauvegardés')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    try {
      // TODO: Implémenter l'appel API pour mettre à jour les notifications
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Préférences de notifications mises à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          Gérez les paramètres de votre équipe
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="general" className="text-xs sm:text-sm">
            <Settings className="h-4 w-4 mr-2 hidden sm:inline" />
            Général
          </TabsTrigger>
          <TabsTrigger value="thresholds" className="text-xs sm:text-sm">
            <AlertTriangle className="h-4 w-4 mr-2 hidden sm:inline" />
            Seuils
          </TabsTrigger>
          <TabsTrigger value="staff" className="text-xs sm:text-sm">
            <Users className="h-4 w-4 mr-2 hidden sm:inline" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs sm:text-sm">
            <Bell className="h-4 w-4 mr-2 hidden sm:inline" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs sm:text-sm">
            <Shield className="h-4 w-4 mr-2 hidden sm:inline" />
            Avancé
          </TabsTrigger>
        </TabsList>

        {/* Onglet Général */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'équipe</CardTitle>
              <CardDescription>
                Gérez les informations générales de votre équipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">Nom de l'équipe</Label>
                <Input
                  id="team-name"
                  value={teamInfo.nom}
                  onChange={(e) => setTeamInfo({ ...teamInfo, nom: e.target.value })}
                  placeholder="Nom de l'équipe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport</Label>
                  <Input
                    id="sport"
                    value={teamInfo.sport}
                    onChange={(e) => setTeamInfo({ ...teamInfo, sport: e.target.value })}
                    placeholder="Football, Basketball, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pays">Pays</Label>
                  <Input
                    id="pays"
                    value={teamInfo.pays}
                    onChange={(e) => setTeamInfo({ ...teamInfo, pays: e.target.value })}
                    placeholder="France, Belgique, etc."
                  />
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveTeamInfo} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiques de l'équipe</CardTitle>
              <CardDescription>Vue d'ensemble de votre équipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Joueurs actifs</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Membres du staff</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Séances ce mois</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-600">Date de création</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Seuils */}
        <TabsContent value="thresholds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seuils personnalisés</CardTitle>
              <CardDescription>
                Configurez les seuils d'alerte pour votre équipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* RPE */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">RPE (Rating of Perceived Exertion)</h3>
                  <Badge variant="outline">0-10</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rpe-warning">Seuil d'avertissement</Label>
                    <Input
                      id="rpe-warning"
                      type="number"
                      min="1"
                      max="10"
                      value={thresholds.rpe_warning}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, rpe_warning: Number(e.target.value) })
                      }
                    />
                    <p className="text-xs text-slate-500">Alerte modérée si RPE ≥ ce seuil</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rpe-critique">Seuil critique</Label>
                    <Input
                      id="rpe-critique"
                      type="number"
                      min="1"
                      max="10"
                      value={thresholds.rpe_critique}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, rpe_critique: Number(e.target.value) })
                      }
                    />
                    <p className="text-xs text-slate-500">Alerte critique si RPE ≥ ce seuil</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Charge d'entraînement */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Charge d'entraînement (UA)</h3>
                  <Badge variant="outline">Unités arbitraires</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="charge-warning">Seuil d'avertissement</Label>
                    <Input
                      id="charge-warning"
                      type="number"
                      min="0"
                      value={thresholds.charge_warning}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, charge_warning: Number(e.target.value) })
                      }
                    />
                    <p className="text-xs text-slate-500">Charge hebdomadaire modérée</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="charge-critique">Seuil critique</Label>
                    <Input
                      id="charge-critique"
                      type="number"
                      min="0"
                      value={thresholds.charge_critique}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, charge_critique: Number(e.target.value) })
                      }
                    />
                    <p className="text-xs text-slate-500">Charge hebdomadaire excessive</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ACWR */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">ACWR (Acute:Chronic Workload Ratio)</h3>
                  <Badge variant="outline">Ratio</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acwr-warning">Seuil d'avertissement</Label>
                    <Input
                      id="acwr-warning"
                      type="number"
                      step="0.1"
                      min="0"
                      value={thresholds.acwr_warning}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, acwr_warning: Number(e.target.value) })
                      }
                    />
                    <p className="text-xs text-slate-500">Recommandé: 0.8 - 1.3</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acwr-critique">Seuil critique</Label>
                    <Input
                      id="acwr-critique"
                      type="number"
                      step="0.1"
                      min="0"
                      value={thresholds.acwr_critique}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, acwr_critique: Number(e.target.value) })
                      }
                    />
                    <p className="text-xs text-slate-500">Risque élevé si &gt; 1.5</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Monotonie */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Monotonie</h3>
                  <Badge variant="outline">Index</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monotonie-warning">Seuil d'avertissement</Label>
                    <Input
                      id="monotonie-warning"
                      type="number"
                      step="0.1"
                      min="0"
                      value={thresholds.monotonie_warning}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, monotonie_warning: Number(e.target.value) })
                      }
                    />
                    <p className="text-xs text-slate-500">Variabilité faible</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monotonie-critique">Seuil critique</Label>
                    <Input
                      id="monotonie-critique"
                      type="number"
                      step="0.1"
                      min="0"
                      value={thresholds.monotonie_critique}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, monotonie_critique: Number(e.target.value) })
                      }
                    />
                    <p className="text-xs text-slate-500">Variabilité très faible - risque</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveThresholds} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer les seuils
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Staff */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion du Staff</CardTitle>
              <CardDescription>
                Gérez les membres du staff et leurs permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p className="mb-4">Gestion du staff à venir</p>
                <p className="text-sm text-slate-400">
                  Vous pourrez bientôt inviter et gérer les membres du staff depuis cette section
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>
                Configurez comment vous souhaitez recevoir les notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="alertes-email">Alertes par email</Label>
                    <p className="text-sm text-slate-500">
                      Recevoir les alertes critiques par email
                    </p>
                  </div>
                  <Button
                    variant={notifications.alertes_email ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setNotifications({ ...notifications, alertes_email: !notifications.alertes_email })
                    }
                  >
                    {notifications.alertes_email ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="alertes-push">Notifications push</Label>
                    <p className="text-sm text-slate-500">
                      Recevoir des notifications push sur votre appareil
                    </p>
                  </div>
                  <Button
                    variant={notifications.alertes_push ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setNotifications({ ...notifications, alertes_push: !notifications.alertes_push })
                    }
                  >
                    {notifications.alertes_push ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="rappels-saisie">Rappels de saisie</Label>
                    <p className="text-sm text-slate-500">
                      Rappeler aux joueurs de saisir leurs données
                    </p>
                  </div>
                  <Button
                    variant={notifications.rappels_saisie ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setNotifications({ ...notifications, rappels_saisie: !notifications.rappels_saisie })
                    }
                  >
                    {notifications.rappels_saisie ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="rapports-hebdo">Rapports hebdomadaires</Label>
                    <p className="text-sm text-slate-500">
                      Recevoir un résumé hebdomadaire par email
                    </p>
                  </div>
                  <Button
                    variant={notifications.rapports_hebdo ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      setNotifications({ ...notifications, rapports_hebdo: !notifications.rapports_hebdo })
                    }
                  >
                    {notifications.rapports_hebdo ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Avancé */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres avancés</CardTitle>
              <CardDescription>
                Gestion avancée de l'équipe et des données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Export de données</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Exportez toutes les données de votre équipe au format CSV ou JSON
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => toast.info('Export CSV à venir')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Exporter CSV
                    </Button>
                    <Button variant="outline" onClick={() => toast.info('Export JSON à venir')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Exporter JSON
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2 text-destructive">Zone de danger</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Actions irréversibles concernant votre équipe
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      toast.error('Cette fonctionnalité nécessite une confirmation supplémentaire')
                    }
                  >
                    Archiver l'équipe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
