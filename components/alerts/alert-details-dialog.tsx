'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAlert, useMarkAlertAsRead, useTreatAlert } from '@/lib/hooks/use-alerts'
import { Loader2, User, Calendar, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface AlertDetailsDialogProps {
  alerteId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const niveauColors = {
  CRITIQUE: 'bg-red-100 text-red-700 border-red-200',
  ATTENTION: 'bg-orange-100 text-orange-700 border-orange-200',
  INFO: 'bg-blue-100 text-blue-700 border-blue-200',
}

const typeLabels: Record<string, string> = {
  SURCHARGE: 'Surcharge',
  SOUS_CHARGE: 'Sous-charge',
  MONOTONIE: 'Monotonie',
  INDICE_FORME_BAS: 'Forme basse',
  INDICE_FORME_TRES_BAS: 'Forme très basse',
  SAISIE_MANQUANTE_RPE: 'RPE manquant',
  SAISIE_MANQUANTE_FORME: 'Indice de forme manquant',
}

export function AlertDetailsDialog({ alerteId, open, onOpenChange }: AlertDetailsDialogProps) {
  const { data: alert, isLoading } = useAlert(alerteId)
  const markAsRead = useMarkAlertAsRead()
  const treatAlert = useTreatAlert()
  const [actionCorrective, setActionCorrective] = useState('')

  const handleTreat = async () => {
    if (!alerteId) return
    await treatAlert.mutateAsync({
      alerteId,
      data: { action_corrective: actionCorrective },
    })
    onOpenChange(false)
  }

  if (!open || !alerteId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : alert ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl">
                    {typeLabels[alert.type]}
                  </DialogTitle>
                  <DialogDescription className="mt-2">
                    {format(new Date(alert.dateCreation), 'PPP à HH:mm', { locale: fr })}
                  </DialogDescription>
                </div>
                <Badge variant="outline" className={niveauColors[alert.niveau]}>
                  {alert.niveau}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              {/* Message */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-slate-900">{alert.message}</p>
              </div>

              {/* Joueur concerné */}
              {alert.joueur_nom && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">{alert.joueur_nom}</span>
                </div>
              )}

              {/* Interprétation */}
              {alert.interpretation_type && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-2">Détails :</h4>
                    <div className="text-sm text-slate-600 space-y-1">
                      {Object.entries(alert.interpretation_type).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key} :</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Action corrective si alerte traitée */}
              {alert.traitee && alert.actionCorrective && (
                <>
                  <Separator />
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Alerte traitée</span>
                    </div>
                    <p className="text-sm text-green-800">{alert.actionCorrective}</p>
                  </div>
                </>
              )}

              {/* Formulaire de traitement */}
              {!alert.traitee && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="action">Action corrective</Label>
                    <Textarea
                      id="action"
                      value={actionCorrective}
                      onChange={(e) => setActionCorrective(e.target.value)}
                      placeholder="Décrivez l'action mise en place..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>

            <DialogFooter>
              {!alert.traitee ? (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Fermer
                  </Button>
                  <Button
                    onClick={handleTreat}
                    disabled={treatAlert.isPending || !actionCorrective.trim()}
                  >
                    {treatAlert.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Marquer comme traitée
                  </Button>
                </>
              ) : (
                <Button onClick={() => onOpenChange(false)}>Fermer</Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-600">Alerte introuvable</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}