'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { IndiceForme } from '@/lib/types'

interface IndiceFormeChartProps {
  data: IndiceForme[]
  isLoading?: boolean
}

export function IndiceFormeChart({ data, isLoading }: IndiceFormeChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution (7 derniers jours)</CardTitle>
          <CardDescription>Votre indice de forme sur la semaine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-slate-500">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution (7 derniers jours)</CardTitle>
          <CardDescription>Votre indice de forme sur la semaine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-slate-500">Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Trier par date croissante et formater
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      date: format(new Date(item.date), 'dd/MM', { locale: fr }),
      score: item.scorTotal,
      dateComplete: format(new Date(item.date), 'EEEE dd MMMM', { locale: fr }),
    }))

  // Calculer la moyenne
  const moyenne = Math.round(
    chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length
  )

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-slate-900 capitalize">{data.dateComplete}</p>
          <p className="text-lg font-bold text-primary">{data.score}/28</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Évolution (7 derniers jours)</CardTitle>
            <CardDescription>Votre indice de forme sur la semaine</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Moyenne</p>
            <p className="text-2xl font-bold text-primary">{moyenne}/28</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 28]} 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={moyenne} 
              stroke="#3b82f6" 
              strokeDasharray="3 3" 
              label={{ value: 'Moyenne', position: 'right', fill: '#3b82f6' }}
            />
            <ReferenceLine 
              y={15} 
              stroke="#ef4444" 
              strokeDasharray="3 3" 
              label={{ value: 'Seuil bas', position: 'right', fill: '#ef4444' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}