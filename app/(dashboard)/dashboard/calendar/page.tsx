'use client'

import { useState } from 'react'
import { SessionCalendar } from '@/components/sessions/session-calendar'
import { CreateSessionDialog } from '@/components/sessions/create-session-dialog'
import { SessionDetailsDialog } from '@/components/sessions/session-details-dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function CalendarPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setCreateDialogOpen(true)
  }

  const handleSessionClick = (seanceId: string) => {
    setSelectedSessionId(seanceId)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendrier</h1>
          <p className="text-slate-600 mt-1">
            Planifiez et gérez vos séances d'entraînement
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle séance
        </Button>
      </div>

      {/* Calendrier */}
      <SessionCalendar
        onSelectSession={handleSessionClick}
        onCreateSession={handleDateClick}
      />

      {/* Dialogs */}
      <CreateSessionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultDate={selectedDate}
      />

      <SessionDetailsDialog
        seanceId={selectedSessionId}
        open={!!selectedSessionId}
        onOpenChange={(open) => !open && setSelectedSessionId(null)}
      />
    </div>
  )
}