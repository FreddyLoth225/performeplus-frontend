'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTeamStore } from '@/lib/store/team-store'
import { 
  useTeamDetails, 
  useUpdateTeam, 
  useTeamThresholds,
  useCreateThreshold,
  useUpdateThreshold,
  useDeleteThreshold
} from '@/lib/hooks/use-teams'
import { SeuilPersonnalise } from '@/lib/api/team.service'
import { ThresholdCard } from '@/components/settings/threshold-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
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

type TabValue = 'general' | 'thresholds' | 'staff' | 'notifications' | 'advanced'

export default function SettingsPage() {
  const { currentTeam } = useTeamStore()
  const { data: teamDetails, isLoading } = useTeamDetails(currentTeam?.id)
  const { data: thresholdsList, isLoading: isLoadingThresholds } = useTeamThresholds(currentTeam?.id)
  const updateTeam = useUpdateTeam()
  const createThreshold = useCreateThreshold()
  const updateThreshold = useUpdateThreshold()
  const deleteThreshold = useDeleteThreshold()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabValue>('general')

  // Gérer l'onglet depuis l'URL
  useEffect(() => {
    const tab = searchParams.get('tab') as TabValue
    if (tab && ['general', 'thresholds', 'staff', 'notifications', 'advanced'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // États pour les paramètres généraux
  const [teamInfo, setTeamInfo] = useState({
    nom: currentTeam?.nom || '',
    sport: currentTeam?.sport || '',
    pays: currentTeam?.pays || '',
  })

  useEffect(() => {
    if (currentTeam) {
      setTeamInfo({
        nom: currentTeam.nom,
        sport: currentTeam.sport,
        pays: currentTeam.pays,
      })
    }
  }, [currentTeam])

  const [notifications, setNotifications] = useState({
    alertes_email: true,
    alertes_push: false,
    rappels_saisie: true,
    rapports_hebdo: true,
  })

  const handleSaveTeamInfo = async () => {
    if (!currentTeam?.id) return
    updateTeam.mutate({
      equipeId: currentTeam.id,
      data: teamInfo,
    })
  }

  const handleSaveNotifications = async () => {
    toast.info('Fonctionnalité à venir')
  }

  const handleSaveThreshold = (data: Partial<SeuilPersonnalise>) => {
    if (!currentTeam?.id) return
    
    const existingThreshold = Array.isArray(thresholdsList) 
      ? thresholdsList.find(t => t.type === data.type)
      : null
    
    if (existingThreshold) {
      // Mise à jour
      updateThreshold.mutate({
        seuilId: existingThreshold.id!,
        data,
      })
    } else {
      // Création
      createThreshold.mutate({
        equipe: currentTeam.id,
        type: data.type!,
        valeur_min: data.valeur_min ?? null,
        valeur_max: data.valeur_max ?? null,
        valeur_critique: data.valeur_critique ?? null,
        actif: data.actif ?? true,
        commentaire: data.commentaire ?? '',
      })
    }
  }

  const handleDeleteThreshold = (type: SeuilPersonnalise['type']) => {
    if (!currentTeam?.id || !Array.isArray(thresholdsList)) return
    
    const threshold = thresholdsList.find(t => t.type === type)
    if (threshold) {
      deleteThreshold.mutate({
        seuilId: threshold.id!,
        equipeId: currentTeam.id,
      })
    }
  }

  const getThreshold = (type: SeuilPersonnalise['type']) => {
    if (!thresholdsList || !Array.isArray(thresholdsList)) return null
    return thresholdsList.find(t => t.type === type) || null
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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="space-y-6">
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
                <Button onClick={handleSaveTeamInfo} disabled={updateTeam.isPending}>
                  {updateTeam.isPending ? (
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

        {/* Onglet Seuils */}
        <TabsContent value="thresholds" className="space-y-6">
          {isLoadingThresholds ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              <ThresholdCard
                threshold={getThreshold('RCA_SURCHARGE')}
                type="RCA_SURCHARGE"
                label="RCA - Ratio de Charge Aiguë (Surcharge)"
                description="Indicateur de surcharge d'entraînement basé sur le ratio entre la charge aiguë (7j) et chronique (28j)"
                unit="Ratio"
                defaultMax={1.5}
                defaultCritical={1.8}
                onSave={handleSaveThreshold}
                onDelete={() => handleDeleteThreshold('RCA_SURCHARGE')}
                isSaving={createThreshold.isPending || updateThreshold.isPending}
                isDeleting={deleteThreshold.isPending}
              />

              <ThresholdCard
                threshold={getThreshold('RCA_SOUS_CHARGE')}
                type="RCA_SOUS_CHARGE"
                label="RCA - Ratio de Charge Aiguë (Sous-charge)"
                description="Indicateur de sous-charge d'entraînement - risque de déconditionnement"
                unit="Ratio"
                defaultMin={0.8}
                defaultCritical={0.5}
                onSave={handleSaveThreshold}
                onDelete={() => handleDeleteThreshold('RCA_SOUS_CHARGE')}
                isSaving={createThreshold.isPending || updateThreshold.isPending}
                isDeleting={deleteThreshold.isPending}
              />

              <ThresholdCard
                threshold={getThreshold('MONOTONIE_IM')}
                type="MONOTONIE_IM"
                label="Indice de Monotonie (IM)"
                description="Mesure de la variabilité de l'entraînement - une monotonie élevée augmente le risque de blessure"
                unit="Index"
                defaultMax={2.0}
                defaultCritical={2.5}
                onSave={handleSaveThreshold}
                onDelete={() => handleDeleteThreshold('MONOTONIE_IM')}
                isSaving={createThreshold.isPending || updateThreshold.isPending}
                isDeleting={deleteThreshold.isPending}
              />

              <ThresholdCard
                threshold={getThreshold('INDICE_CONTRAINTE_IC')}
                type="INDICE_CONTRAINTE_IC"
                label="Indice de Contrainte (IC)"
                description="Produit de la charge totale et de la monotonie - indicateur global de stress"
                unit="UA"
                defaultMax={8000}
                defaultCritical={10000}
                onSave={handleSaveThreshold}
                onDelete={() => handleDeleteThreshold('INDICE_CONTRAINTE_IC')}
                isSaving={createThreshold.isPending || updateThreshold.isPending}
                isDeleting={deleteThreshold.isPending}
              />

              <ThresholdCard
                threshold={getThreshold('INDICE_FORME_BAS')}
                type="INDICE_FORME_BAS"
                label="Indice de Forme (Bas)"
                description="Seuil bas de l'indice de forme quotidien - indicateur de fatigue ou maladie"
                unit="0-10"
                defaultMin={5}
                defaultCritical={3}
                onSave={handleSaveThreshold}
                onDelete={() => handleDeleteThreshold('INDICE_FORME_BAS')}
                isSaving={createThreshold.isPending || updateThreshold.isPending}
                isDeleting={deleteThreshold.isPending}
              />

              <ThresholdCard
                threshold={getThreshold('INDICE_FORME_ELEVE')}
                type="INDICE_FORME_ELEVE"
                label="Indice de Forme (Élevé)"
                description="Seuil haut de l'indice de forme - peut indiquer une sur-évaluation ou masquage de fatigue"
                unit="0-10"
                defaultMax={9}
                defaultCritical={10}
                onSave={handleSaveThreshold}
                onDelete={() => handleDeleteThreshold('INDICE_FORME_ELEVE')}
                isSaving={createThreshold.isPending || updateThreshold.isPending}
                isDeleting={deleteThreshold.isPending}
              />
            </div>
          )}
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
                <Button onClick={handleSaveNotifications}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
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
