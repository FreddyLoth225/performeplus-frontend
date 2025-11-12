'use client'

import { useState } from 'react'
import { useTeamStore } from '@/lib/store/team-store'
import { useRPE } from '@/lib/hooks/use-wellness'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SliderWellness } from '@/components/ui/slider-wellness'
import { Loader2 } from 'lucide-react'

const RPE_LABELS = ['Très léger', 'Modéré', 'Maximal']

interface RPEFormProps {
  session: any
  onSuccess?: () => void
}

export function RPEForm({ session, onSuccess }: RPEFormProps) {
  const { currentTeam } = useTeamStore()
  const { create, isCreating } = useRPE(currentTeam?.id)

  const [values, setValues] = useState({
    valeurRPE: 5,
    dureeReelle: 60,
    commentaire: '',
  })

  const cej = values.valeurRPE * values.dureeReelle

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Le backend RPE utilise 'seance_id' et 'participation_id'
    const seanceId = session.seance_id || session.id
    const participationId = session.participation_id

    create({
      seance_id: seanceId,
      participation_id: participationId,
      valeurRPE: values.valeurRPE,
      dureeReelle: values.dureeReelle,
      commentaire: values.commentaire || undefined,
    }, {
      onSuccess: () => {
        onSuccess?.()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Durée réelle */}
      <div className="space-y-2">
        <Label htmlFor="duree" className="text-sm sm:text-base">
          Durée réelle de participation (minutes)
        </Label>
        <Input
          id="duree"
          type="number"
          min="1"
          max="300"
          value={values.dureeReelle}
          onChange={(e) => setValues({ ...values, dureeReelle: Number(e.target.value) })}
          disabled={isCreating}
          className="text-base"
        />
        <p className="text-xs text-slate-600">
          Combien de temps avez-vous réellement participé ?
        </p>
      </div>

      {/* RPE */}
      <div className="space-y-3">
        <Label className="text-sm sm:text-base">Perception de l'effort (RPE)</Label>
        <SliderWellness
          value={values.valeurRPE}
          onChange={(val) => setValues({ ...values, valeurRPE: val })}
          min={0}
          max={10}
          step={0.5}
          labels={RPE_LABELS}
          disabled={isCreating}
        />
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-xs sm:text-sm text-slate-600 mb-1 font-medium">Échelle d'effort perçu :</p>
          <ul className="text-xs sm:text-sm text-slate-600 space-y-0.5 sm:space-y-1">
            <li>• 0-2 : Très très léger</li>
            <li>• 3-4 : Léger</li>
            <li>• 5-6 : Modéré</li>
            <li>• 7-8 : Difficile</li>
            <li>• 9-10 : Maximal</li>
          </ul>
        </div>
      </div>

      {/* Commentaire */}
      <div className="space-y-2">
        <Label htmlFor="commentaire" className="text-sm sm:text-base">
          Commentaire (optionnel)
        </Label>
        <Textarea
          id="commentaire"
          placeholder="Ressenti, douleurs, observations..."
          value={values.commentaire}
          onChange={(e) => setValues({ ...values, commentaire: e.target.value })}
          disabled={isCreating}
          rows={3}
          className="text-sm sm:text-base resize-none"
        />
      </div>

      {/* Charge calculée */}
      <div className="bg-primary/10 p-3 sm:p-4 rounded-lg">
        <p className="text-xs sm:text-sm text-slate-600 mb-1">Charge d'entraînement calculée :</p>
        <p className="text-2xl sm:text-3xl font-bold text-primary">{cej} UA</p>
        <p className="text-xs text-slate-600 mt-1">
          {values.dureeReelle} min × {values.valeurRPE} RPE
        </p>
      </div>

      {/* Bouton submit */}
      <Button
        type="submit"
        className="w-full h-11 sm:h-12 text-base"
        disabled={isCreating}
      >
        {isCreating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          'Enregistrer le RPE'
        )}
      </Button>
    </form>
  )
}