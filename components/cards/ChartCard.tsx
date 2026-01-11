'use client'

import React from 'react'

interface ChartCardProps {
  title: string
  type: 'bar' | 'line' | 'pie' | 'histogram'
}

const ChartCard: React.FC<ChartCardProps> = ({ title, type }) => {
  return (
    <div className=\"card\">
      <div className=\"card-header\">
        <h3 className=\"text-lg font-semibold text-primary-900\">{title}</h3>
      </div>
      <div className=\"card-body\">
        <div className=\"h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded flex items-center justify-center\">
          <div className=\"text-center\">
            <p className=\"text-gray-500 text-sm\">Chart Type: {type}</p>
            <p className=\"text-gray-400 text-xs mt-1\">Plotly chart will render here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChartCard

