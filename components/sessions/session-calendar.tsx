'use client'

import { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import frLocale from '@fullcalendar/core/locales/fr'
import { useCalendar } from '@/lib/hooks/use-sessions'
import { useTeamStore } from '@/lib/store/team-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Seance, StatutSeance } from '@/lib/types'

interface SessionCalendarProps {
  onSelectSession?: (seanceId: string) => void
  onCreateSession?: (date: Date) => void
}

// Mapping des statuts avec couleurs
const statutColors: Record<StatutSeance, string> = {
  PLANIFIEE: '#3B82F6', // Bleu
  EN_COURS: '#F59E0B', // Orange
  TERMINEE: '#10B981', // Vert
  ANNULEE: '#EF4444', // Rouge
}

export function SessionCalendar({ onSelectSession, onCreateSession }: SessionCalendarProps) {
  const { currentTeam } = useTeamStore()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculer les dates de début et fin du mois
  const dateDebut = format(startOfMonth(currentDate), "yyyy-MM-dd'T'00:00:00")
  const dateFin = format(endOfMonth(currentDate), "yyyy-MM-dd'T'23:59:59")

  const { data: sessions, isLoading } = useCalendar(
    currentTeam?.id || '',
    dateDebut,
    dateFin
  )

  // Transformer les séances en événements FullCalendar
  const events = useMemo(() => {
    if (!sessions) return []

    return sessions.map((seance: Seance) => ({
      id: seance.id,
      title: seance.type,
      start: seance.dateDebut,
      end: seance.dateFin || seance.dateDebut,
      backgroundColor: statutColors[seance.statut],
      borderColor: statutColors[seance.statut],
      extendedProps: {
        seance,
      },
    }))
  }, [sessions])

  const handleDateClick = (arg: any) => {
    if (onCreateSession) {
      onCreateSession(arg.date)
    }
  }

  const handleEventClick = (info: any) => {
    if (onSelectSession) {
      onSelectSession(info.event.id)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendrier des séances
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1" />
              Planifiée
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <div className="w-2 h-2 rounded-full bg-orange-500 mr-1" />
              En cours
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1" />
              Terminée
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-1" />
              Annulée
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="fullcalendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            locale={frLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            buttonText={{
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour',
              list: 'Liste',
            }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            editable={false}
            selectable={true}
            nowIndicator={true}
            weekends={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
            }}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: false,
            }}
            datesSet={(arg) => {
              setCurrentDate(arg.start)
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}