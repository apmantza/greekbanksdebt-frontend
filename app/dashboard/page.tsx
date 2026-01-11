'use client'

import React from 'react'
import KPICard from '@/components/cards/KPICard'
import ChartCard from '@/components/cards/ChartCard'

const DashboardPage: React.FC = () => {
  // Mock data - will be replaced with real API calls
  const kpis = [
    { label: 'Total Issuance', value: '€26.6B', change: '+5.2%', trend: 'up' },
    { label: 'Avg Spread', value: '382 bps', change: '-120 bps', trend: 'down' },
    { label: 'Active Bonds', value: '55', change: '+3', trend: 'up' },
    { label: 'Top Issuer', value: 'Eurobank', change: '30%', trend: 'neutral' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Greek Banks Debt Market Overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Issuance by Issuer" type="bar" />
        <ChartCard title="Spread Distribution" type="histogram" />
        <ChartCard title="Issuance Trend" type="line" />
        <ChartCard title="Issue Type Breakdown" type="pie" />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-primary-900">Recent Bonds</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Issuer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Spread</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tenor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { issuer: 'Eurobank', type: 'SR Preferred', spread: '245 bps', tenor: '5Y', size: '€500M' },
                  { issuer: 'Piraeus', type: 'Tier 2', spread: '380 bps', tenor: '7Y', size: '€400M' },
                  { issuer: 'Alpha', type: 'AT1', spread: '520 bps', tenor: 'Perpetual', size: '€300M' },
                ].map((bond, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{bond.issuer}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-info">{bond.type}</span>
                    </td>
                    <td className="py-3 px-4">{bond.spread}</td>
                    <td className="py-3 px-4">{bond.tenor}</td>
                    <td className="py-3 px-4 font-semibold">{bond.size}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

