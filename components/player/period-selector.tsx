'use client'

import { Button } from '@/components/ui/button'

interface PeriodSelectorProps {
  selectedPeriod: number
  onPeriodChange: (period: number) => void
}

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  const periods = [
    { value: 7, label: '7 jours' },
    { value: 14, label: '14 jours' },
    { value: 30, label: '30 jours' },
  ]

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
      {periods.map((period) => (
        <Button
          key={period.value}
          variant={selectedPeriod === period.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onPeriodChange(period.value)}
          className={
            selectedPeriod === period.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'hover:bg-background'
          }
        >
          {period.label}
        </Button>
      ))}
    </div>
  )
}
