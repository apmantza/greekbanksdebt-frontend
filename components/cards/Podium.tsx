'use client'

import React from 'react'

interface PodiumProps {
  rank: 1 | 2 | 3
  title: string
  winner: string
  value: string
  unit: string
  subtitle?: string
  wittyComment: string
  color: string
  height: string
}

const Podium: React.FC<PodiumProps> = ({
  rank,
  title,
  winner,
  value,
  unit,
  subtitle,
  wittyComment,
  color,
  height,
}) => {
  const medals = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  }

  const positions = {
    1: 'order-2',
    2: 'order-3',
    3: 'order-1',
  }

  return (
    <div className={`flex flex-col items-center ${positions[rank]}`}>
      {/* Medal */}
      <div className="text-6xl mb-2 animate-bounce" style={{
        animationDelay: `${rank * 0.1}s`,
      }}>
        {medals[rank]}
      </div>

      {/* Podium */}
      <div
        className={`w-full rounded-t-lg shadow-lg transition-all hover:shadow-xl hover:scale-105 ${color} flex flex-col items-center justify-end`}
        style={{ height }}
      >
        {/* Content */}
        <div className="text-center pb-4 px-4">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-lg font-bold text-primary-900 mb-1">{winner}</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-bold text-accent-600">{value}</span>
            <span className="text-sm text-gray-600">{unit}</span>
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
      </div>

      {/* Witty Comment */}
      <div className="mt-3 text-center">
        <p className="text-xs italic text-gray-600 max-w-xs">
          "{wittyComment}"
        </p>
      </div>
    </div>
  )
}

export default Podium

