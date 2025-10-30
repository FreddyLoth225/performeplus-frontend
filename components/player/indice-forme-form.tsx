'use client'

import { useState, useEffect } from 'react'
import { useTeamStore } from '@/lib/store/team-store'
import { useIndiceForme } from '@/lib/hooks/use-wellness'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { SliderWellness } from '@/components/ui/slider-wellness'
import { Loader2, Moon, Zap, Dumbbell, Brain, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const LABELS_SOMMEIL = ['Très mauvais', 'Moyen', 'Excellent']
const LABELS_FATIGUE = ['Très fatigué', 'Moyen', 'Très reposé']
const LABELS_COURBATURES = ['Très courbaturé', 'Moyen', 'Aucune']
const LABELS_STRESS = ['Très stressé', 'Moyen', 'Très détendu']

export function IndiceFormeForm() {
  const { currentTeam, currentMembership } = useTeamStore()
  const { create, update, isCreating, isUpdating, today } = useIndiceForme(currentTeam?.id)

  const [values, setValues] = useState({
    sommeil: 4,
    fatigue: 4,
    courbatures: 4,
    stress: 4,
  })

  // Charger les valeurs du jour si elles existent
  useEffect(() => {
    if (today) {
      setValues({
        sommeil: today.sommeil,
        fatigue: today.fatigue,
        courbatures: today.courbatures,
        stress: today.stress,
      })
    }
  }, [today])

  const scorTotal = values.sommeil + values.fatigue + values.courbatures + values.stress

  const getScoreColor = () => {
    if (scorTotal < 15) return 'text-red-600'
    if (scorTotal < 21) return 'text-orange-600'
    return 'text-green-600'
  }

  const getScoreLabel = () => {
    if (scorTotal < 12) return 'Très mauvais'
    if (scorTotal < 15) return 'Mauvais'
    if (scorTotal < 21) return 'Moyen'
    if (scorTotal < 25) return 'Bon'
    return 'Excellent'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentMembership) {
      console.error('❌ Pas de membership actif')
      return
    }

    const data = {
      membre_id: currentMembership.id,
      ...values,
    }

    if (today) {
      update({ id: today.id, data })
    } else {
      create(data)
    }
  }

  const isLoading = isCreating || isUpdating
  const canModify = !today || today.peut_modifier

  // Afficher un message si pas de membership
  if (!currentMembership) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Indice de Forme du Jour</CardTitle>
          <CardDescription>Saisissez votre état de forme quotidien</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <p>Vous devez appartenir à une équipe pour saisir votre indice de forme</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Indice de Forme du Jour</CardTitle>
            <CardDescription>
              {today ? 'Modifiez' : 'Saisissez'} votre état de forme quotidien
            </CardDescription>
          </div>
          {today && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Déjà saisi</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sommeil */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Moon className="h-5 w-5 text-indigo-600" />
              Qualité du sommeil
            </Label>
            <SliderWellness
              value={values.sommeil}
              onChange={(val) => setValues({ ...values, sommeil: val })}
              labels={LABELS_SOMMEIL}
              disabled={!canModify || isLoading}
            />
          </div>

          {/* Fatigue */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-amber-600" />
              Niveau d'énergie
            </Label>
            <SliderWellness
              value={values.fatigue}
              onChange={(val) => setValues({ ...values, fatigue: val })}
              labels={LABELS_FATIGUE}
              disabled={!canModify || isLoading}
            />
          </div>

          {/* Courbatures */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Dumbbell className="h-5 w-5 text-rose-600" />
              Niveau de courbatures
            </Label>
            <SliderWellness
              value={values.courbatures}
              onChange={(val) => setValues({ ...values, courbatures: val })}
              labels={LABELS_COURBATURES}
              disabled={!canModify || isLoading}
            />
          </div>

          {/* Stress */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5 text-purple-600" />
              Niveau de stress
            </Label>
            <SliderWellness
              value={values.stress}
              onChange={(val) => setValues({ ...values, stress: val })}
              labels={LABELS_STRESS}
              disabled={!canModify || isLoading}
            />
          </div>

          {/* Score Total */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-medium">Score Total</span>
              <div className="text-right">
                <div className={cn('text-4xl font-bold', getScoreColor())}>
                  {scorTotal}/28
                </div>
                <div className={cn('text-sm font-medium', getScoreColor())}>
                  {getScoreLabel()}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!canModify || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : today ? (
                'Modifier'
              ) : (
                'Enregistrer'
              )}
            </Button>

            {!canModify && today && (
              <p className="text-xs text-center text-slate-500 mt-2">
                Vous ne pouvez plus modifier l'indice de forme d'aujourd'hui
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}