'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatutSeance } from '@/lib/types'

interface SessionsFiltersProps {
  filters: {
    date_debut?: string
    date_fin?: string
    statut?: StatutSeance
  }
  onFiltersChange: (filters: any) => void
}

export function SessionsFilters({ filters, onFiltersChange }: SessionsFiltersProps) {
  const [dateDebut, setDateDebut] = useState<Date | undefined>(
    filters.date_debut ? new Date(filters.date_debut) : undefined
  )
  const [dateFin, setDateFin] = useState<Date | undefined>(
    filters.date_fin ? new Date(filters.date_fin) : undefined
  )

  const handleDateDebutChange = (date: Date | undefined) => {
    setDateDebut(date)
    onFiltersChange({
      ...filters,
      date_debut: date ? format(date, 'yyyy-MM-dd') : undefined,
    })
  }

  const handleDateFinChange = (date: Date | undefined) => {
    setDateFin(date)
    onFiltersChange({
      ...filters,
      date_fin: date ? format(date, 'yyyy-MM-dd') : undefined,
    })
  }

  const handleReset = () => {
    setDateDebut(undefined)
    setDateFin(undefined)
    onFiltersChange({})
  }

  const hasFilters = dateDebut || dateFin

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-end gap-4 flex-wrap">
          {/* Date début */}
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label>Date de début</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateDebut && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateDebut ? (
                    format(dateDebut, 'PPP', { locale: fr })
                  ) : (
                    <span>Sélectionner</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateDebut}
                  onSelect={handleDateDebutChange}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date fin */}
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label>Date de fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateFin && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFin ? (
                    format(dateFin, 'PPP', { locale: fr })
                  ) : (
                    <span>Sélectionner</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFin}
                  onSelect={handleDateFinChange}
                  initialFocus
                  locale={fr}
                  disabled={(date) =>
                    dateDebut ? date < dateDebut : false
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Reset */}
          {hasFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleReset}
              title="Réinitialiser les filtres"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}