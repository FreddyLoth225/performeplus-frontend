'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ChargeDataPoint {
  date: string
  cej: number
  rpe: number
  duree: number
}

interface IndiceFormeDataPoint {
  date: string
  score: number
  sommeil: number
  fatigue: number
  courbatures: number
  stress: number
}

interface PlayerChartsProps {
  chargeData: ChargeDataPoint[]
  indiceFormeData: IndiceFormeDataPoint[]
  isLoading?: boolean
}

export function PlayerCharts({ chargeData, indiceFormeData, isLoading }: PlayerChartsProps) {
  const formattedChargeData = useMemo(() => {
    return chargeData.map((point) => ({
      ...point,
      dateFormatted: format(new Date(point.date), 'dd MMM', { locale: fr }),
    }))
  }, [chargeData])

  const formattedIndiceData = useMemo(() => {
    return indiceFormeData.map((point) => ({
      ...point,
      dateFormatted: format(new Date(point.date), 'dd MMM', { locale: fr }),
    }))
  }, [indiceFormeData])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Chargement...</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Graphique Charge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Évolution de la Charge</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            CEJ (Charge d'Entraînement Journalière) sur 7 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formattedChargeData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={formattedChargeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="dateFormatted"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  label={{ value: 'CEJ', angle: -90, position: 'insideLeft', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'cej') return [`${value.toFixed(0)} UA`, 'CEJ']
                    if (name === 'rpe') return [value, 'RPE']
                    if (name === 'duree') return [`${value} min`, 'Durée']
                    return [value, name]
                  }}
                />
                <Bar dataKey="cej" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Graphique Indice de Forme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Évolution Indice de Forme</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Score total et composantes sur 7 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formattedIndiceData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={formattedIndiceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="dateFormatted"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  domain={[0, 28]}
                  label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Score Total"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="sommeil"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Sommeil"
                  strokeDasharray="5 5"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Fatigue"
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
