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
  Cell,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ChargeEquipeDataPoint {
  date: string
  charge: number
}

interface IndiceFormeMoyenDataPoint {
  date: string
  moyenne: number
}

interface DistributionRPE {
  [key: string]: number
}

interface TeamChartsProps {
  chargeEquipeData: ChargeEquipeDataPoint[]
  distributionRpe: DistributionRPE
  indiceFormeMoyenData: IndiceFormeMoyenDataPoint[]
  isLoading?: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

export function TeamCharts({ chargeEquipeData, distributionRpe, indiceFormeMoyenData, isLoading }: TeamChartsProps) {
  const formattedChargeData = useMemo(() => {
    return chargeEquipeData.map((point) => ({
      ...point,
      dateFormatted: format(new Date(point.date), 'dd MMM', { locale: fr }),
    }))
  }, [chargeEquipeData])

  const formattedIndiceData = useMemo(() => {
    return indiceFormeMoyenData.map((point) => ({
      ...point,
      dateFormatted: format(new Date(point.date), 'dd MMM', { locale: fr }),
    }))
  }, [indiceFormeMoyenData])

  const rpeDistributionData = useMemo(() => {
    return Object.entries(distributionRpe)
      .map(([rpe, count]) => ({
        rpe: `RPE ${rpe}`,
        count,
        rpeValue: parseInt(rpe),
      }))
      .sort((a, b) => a.rpeValue - b.rpeValue)
  }, [distributionRpe])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Chargement...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Charge Équipe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Charge Totale Équipe</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Charge d'entraînement quotidienne de l'équipe
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formattedChargeData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={formattedChargeData}>
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
                  label={{ value: 'Charge Totale', angle: -90, position: 'insideLeft', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(0)} UA`, 'Charge']}
                />
                <Line
                  type="monotone"
                  dataKey="charge"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Distribution RPE */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Distribution RPE</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Répartition des valeurs RPE saisies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rpeDistributionData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                Aucune donnée disponible
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={rpeDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="rpe"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    label={{ value: 'Nombre', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [value, 'Occurrences']}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {rpeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Indice de Forme Moyen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Indice de Forme Moyen</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Évolution de la moyenne équipe
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
                    label={{ value: 'Score Moyen', angle: -90, position: 'insideLeft', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [value.toFixed(1), 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="moyenne"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#10b981' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
