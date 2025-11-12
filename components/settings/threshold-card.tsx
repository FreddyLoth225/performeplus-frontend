'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { SeuilPersonnalise } from '@/lib/api/team.service'
import { Save, Trash2, Info } from 'lucide-react'

interface ThresholdCardProps {
  threshold: SeuilPersonnalise | null
  type: SeuilPersonnalise['type']
  label: string
  description: string
  unit?: string
  defaultMin?: number
  defaultMax?: number
  defaultCritical?: number
  onSave: (data: Partial<SeuilPersonnalise>) => void
  onDelete?: () => void
  isSaving?: boolean
  isDeleting?: boolean
}

export function ThresholdCard({
  threshold,
  type,
  label,
  description,
  unit,
  defaultMin,
  defaultMax,
  defaultCritical,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: ThresholdCardProps) {
  const [values, setValues] = useState({
    valeur_min: threshold?.valeur_min ?? defaultMin ?? null,
    valeur_max: threshold?.valeur_max ?? defaultMax ?? null,
    valeur_critique: threshold?.valeur_critique ?? defaultCritical ?? null,
    commentaire: threshold?.commentaire ?? '',
    actif: threshold?.actif ?? true,
  })

  const handleSave = () => {
    onSave({
      type,
      ...values,
    })
  }

  const hasChanges = 
    values.valeur_min !== (threshold?.valeur_min ?? defaultMin ?? null) ||
    values.valeur_max !== (threshold?.valeur_max ?? defaultMax ?? null) ||
    values.valeur_critique !== (threshold?.valeur_critique ?? defaultCritical ?? null) ||
    values.commentaire !== (threshold?.commentaire ?? '') ||
    values.actif !== (threshold?.actif ?? true)

  return (
    <Card className={!values.actif ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{label}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {unit && <Badge variant="outline">{unit}</Badge>}
            <Badge variant={values.actif ? 'default' : 'secondary'}>
              {values.actif ? 'Actif' : 'Inactif'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${type}-min`}>Valeur minimale</Label>
            <Input
              id={`${type}-min`}
              type="number"
              step="0.1"
              value={values.valeur_min ?? ''}
              onChange={(e) =>
                setValues({ ...values, valeur_min: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="Min"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${type}-max`}>Valeur maximale</Label>
            <Input
              id={`${type}-max`}
              type="number"
              step="0.1"
              value={values.valeur_max ?? ''}
              onChange={(e) =>
                setValues({ ...values, valeur_max: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="Max"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${type}-critique`}>Valeur critique</Label>
            <Input
              id={`${type}-critique`}
              type="number"
              step="0.1"
              value={values.valeur_critique ?? ''}
              onChange={(e) =>
                setValues({ ...values, valeur_critique: e.target.value ? Number(e.target.value) : null })
              }
              placeholder="Critique"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${type}-comment`}>Commentaire (optionnel)</Label>
          <Textarea
            id={`${type}-comment`}
            value={values.commentaire}
            onChange={(e) => setValues({ ...values, commentaire: e.target.value })}
            placeholder="Notes ou informations supplémentaires..."
            rows={2}
          />
        </div>

        {threshold && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="h-3 w-3" />
            <span>
              Dernière modification: {new Date(threshold.date_modification!).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setValues({ ...values, actif: !values.actif })}
          >
            {values.actif ? 'Désactiver' : 'Activer'}
          </Button>

          <div className="flex gap-2">
            {threshold && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
