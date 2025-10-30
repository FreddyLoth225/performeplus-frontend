'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderWellnessProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  labels?: string[]
  className?: string
  disabled?: boolean
}

export function SliderWellness({
  value,
  onChange,
  min = 1,
  max = 7,
  step = 1,
  labels,
  className,
  disabled = false,
}: SliderWellnessProps) {
  const percentage = ((value - min) / (max - min)) * 100

  const getColor = () => {
    if (value <= 2) return 'bg-red-500'
    if (value <= 4) return 'bg-orange-500'
    if (value <= 5) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1 relative h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300', getColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="ml-4 w-12 text-center">
          <span className="text-2xl font-bold">{value}</span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-transparent appearance-none cursor-pointer slider-custom"
      />

      {labels && labels.length === max - min + 1 && (
        <div className="flex justify-between text-xs text-slate-600">
          <span>{labels[0]}</span>
          <span>{labels[Math.floor(labels.length / 2)]}</span>
          <span>{labels[labels.length - 1]}</span>
        </div>
      )}

      <style jsx global>{`
        .slider-custom::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid currentColor;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-custom::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid currentColor;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .slider-custom::-webkit-slider-runnable-track {
          height: 8px;
          background: transparent;
          border-radius: 4px;
        }

        .slider-custom::-moz-range-track {
          height: 8px;
          background: transparent;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}