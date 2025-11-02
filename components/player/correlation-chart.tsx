'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts'

interface CorrelationDataPoint {
  charge: number
  indice: number
  date: string
}

interface CorrelationChartProps {
  chargeData: { date: string; cej: number }[]
  indiceFormeData: { date: string; score: number }[]
}

export function CorrelationChart({ chargeData, indiceFormeData }: CorrelationChartProps) {
  // Combiner les données de charge et d'indice de forme
  const correlationData: CorrelationDataPoint[] = chargeData
    .map((chargeItem, index) => {
      const indiceItem = indiceFormeData[index]
      if (!indiceItem || chargeItem.cej === 0 || indiceItem.score === 0) return null
      
      return {
        charge: chargeItem.cej,
        indice: indiceItem.score,
        date: new Date(chargeItem.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      }
    })
    .filter((item): item is CorrelationDataPoint => item !== null)

  if (correlationData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Corrélation Charge - Bien-être</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Relation entre votre charge d&apos;entraînement et votre indice de forme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
            Données insuffisantes pour afficher la corrélation
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Corrélation Charge - Bien-être</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Chaque point représente une journée. Une tendance positive indique un bon équilibre.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 40, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="charge"
              name="Charge"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              label={{
                value: 'Charge d\'entraînement (CEJ)',
                position: 'insideBottom',
                offset: -10,
                fontSize: 12,
                fill: '#64748b',
              }}
            />
            <YAxis
              type="number"
              dataKey="indice"
              name="Indice"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              domain={[0, 28]}
              label={{
                value: 'Indice de forme',
                angle: -90,
                position: 'insideLeft',
                fontSize: 12,
                fill: '#64748b',
              }}
            />
            <ZAxis range={[100, 100]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-semibold mb-2 text-slate-700">{data.date}</p>
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Charge:</span> {data.charge.toFixed(0)} UA
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-medium">Indice:</span> {data.indice}/28
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Scatter
              name="Corrélation"
              data={correlationData}
              fill="#8b5cf6"
              opacity={0.7}
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="mt-4 text-xs text-slate-600 space-y-1">
          <p>💡 <span className="font-medium">Interprétation:</span></p>
          <ul className="ml-4 space-y-1">
            <li>• Points en haut à droite: Bonne forme malgré une charge élevée (optimal)</li>
            <li>• Points en bas à gauche: Faible forme avec peu de charge (récupération)</li>
            <li>• Points en bas à droite: Charge élevée et forme basse (attention surcharge)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
