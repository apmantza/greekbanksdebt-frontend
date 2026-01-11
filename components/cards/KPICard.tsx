'use client'

import React from 'react'

interface KPICardProps {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
}

const KPICard: React.FC<KPICardProps> = ({ label, value, change, trend }) => {
  const trendColor = {
    up: 'text-status-success',
    down: 'text-status-error',
    neutral: 'text-gray-500',
  }[trend]

  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }[trend]

  return (
    <div className=\"card\">
      <div className=\"card-body\">
        <p className=\"text-sm text-gray-600 font-medium\">{label}</p>
        <p className=\"text-2xl font-bold text-primary-900 mt-2\">{value}</p>
        <p className={`text-sm mt-2 ${trendColor}`}>
          <span>{trendIcon}</span> {change}
        </p>
      </div>
    </div>
  )
}

export default KPICard

